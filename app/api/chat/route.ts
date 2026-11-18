import { randomUUID } from "node:crypto";
import { after, NextResponse } from "next/server";
import { answerFromFacts, isOffTopic, stripInjection } from "@/lib/chat/fallback";
import { parseChatBody, rateLimit } from "@/lib/chat/guard";
import { logChat, loggingEnabled } from "@/lib/chat/log";
import { correctQuery, MIN_SCORE } from "@/lib/chat/retrieve";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A free CPU model server needs 10-20s to phrase an answer; Vercel's default function limit is 10s.
export const maxDuration = 30;

/**
 * POST /api/chat  { message, history? }
 *   -> { answer, source: "model" | "facts", modelStatus: "ready" | "waking" | "off" }
 * GET  /api/chat  -> { modelStatus }   (called when the widget opens, to wake the model early)
 *
 * The fine-tuned model runs on a separate free host that sleeps when idle.
 * When it is asleep, slow or unset we answer from the retrieval fallback so
 * the chat never dead-ends. CHAT_MODEL_URL / CHAT_MODEL_TOKEN are optional:
 * leave them unset and the site runs fallback-only.
 */

const MODEL_URL = process.env.CHAT_MODEL_URL?.replace(/\/$/, "");
const MODEL_TOKEN = process.env.CHAT_MODEL_TOKEN;
const MODEL_TIMEOUT_MS = 25_000;
const HEALTH_TIMEOUT_MS = 4_000;

// Cost guard: a CPU model bills by the second. Past this many model calls per hour (per server instance) answers come
// from the facts instead, so even a leaked token or a flood of visitors cannot run the model flat out all month.
const MAX_MODEL_CALLS_PER_HOUR = Number(process.env.CHAT_MODEL_MAX_PER_HOUR ?? 120);
const modelCalls: number[] = [];
function modelBudgetLeft(now = Date.now()): boolean {
    while (modelCalls.length && now - modelCalls[0] > 3_600_000) modelCalls.shift();
    return modelCalls.length < MAX_MODEL_CALLS_PER_HOUR;
}

type ModelStatus = "ready" | "waking" | "off";

// remember a recent failed health check so we answer instantly instead of
// making every question wait on a sleeping model
let lastStatus: { value: ModelStatus; at: number } | null = null;
const STATUS_TTL_MS = 20_000;

async function modelStatus(): Promise<ModelStatus> {
    if (!MODEL_URL) return "off";
    if (lastStatus && Date.now() - lastStatus.at < STATUS_TTL_MS) return lastStatus.value;
    let value: ModelStatus = "waking";
    try {
        const res = await fetch(`${MODEL_URL}/health`, { signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS), cache: "no-store" });
        // a sleeping host can answer 200 with an HTML "starting" page, so require our JSON
        if (res.ok && ((await res.json()) as { status?: unknown }).status === "ok") value = "ready";
    } catch {
        // sleeping / starting: the request itself is what wakes a sleeping Space
    }
    lastStatus = { value, at: Date.now() };
    return value;
}

/** Numbers and emails in a model answer must come from the facts we supplied. */
function isGrounded(answer: string, facts: string): boolean {
    const haystack = facts.toLowerCase();
    const risky = answer.toLowerCase().match(/[\w.+-]+@[\w-]+\.[\w.]+|\d[\d,.]*/g) ?? [];
    return risky.every((token) => haystack.includes(token.replace(/[.,]$/, "")));
}

type ModelResult = { kind: "answer"; answer: string } | { kind: "rejected" } | { kind: "busy" } | { kind: "unreachable" };

async function askModel(question: string, history: unknown, factTexts: string[]): Promise<ModelResult> {
    if (!MODEL_URL) return { kind: "unreachable" };
    try {
        const res = await fetch(`${MODEL_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(MODEL_TOKEN ? { Authorization: `Bearer ${MODEL_TOKEN}` } : {}) },
            body: JSON.stringify({ question, history, facts: factTexts }),
            signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
            cache: "no-store",
        });
        // 429 = the model server is awake but busy with other visitors: answer from the facts, but do not say "waking up"
        if (res.status === 429) return { kind: "busy" };
        if (!res.ok) return { kind: "unreachable" };
        const data = (await res.json()) as { answer?: unknown };
        const answer = typeof data.answer === "string" ? data.answer.trim() : "";
        // the model replied but the answer is unusable: it is awake, so don't call it "waking"
        if (!answer || answer.length > 1200 || !isGrounded(answer, factTexts.join("\n"))) return { kind: "rejected" };
        return { kind: "answer", answer };
    } catch {
        return { kind: "unreachable" };
    }
}

function clientKey(req: Request): string {
    return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function GET() {
    return NextResponse.json({ modelStatus: await modelStatus(), logging: loggingEnabled });
}

export async function POST(req: Request) {
    const limit = rateLimit(clientKey(req));
    if (!limit.ok) {
        return NextResponse.json(
            { error: "Too many questions, please wait a moment.", retryAfterSeconds: limit.retryAfterSeconds },
            { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const parsed = parseChatBody(body);
    if (!parsed) return NextResponse.json({ error: "Please send a question." }, { status: 400 });

    const { question, history, sid } = parsed;
    const started = Date.now();
    // the model only ever sees the real question: injected "ignore your rules" text is stripped, typos fixed
    const fixed = correctQuery(stripInjection(question) || question);
    const factsReply = answerFromFacts(question);
    const hits = factsReply.hits ?? [];

    // One place that answers AND records, so every answered question is logged (after the response is sent).
    const finish = (answer: string, source: "model" | "facts", modelStatus: ModelStatus, note?: string) => {
        const id = randomUUID();
        after(() =>
            logChat({ id, sid, q: question, a: answer, src: source, kind: factsReply.kind, sources: factsReply.sources, score: hits[0] ? Math.round(hits[0].score * 100) / 100 : 0, ms: Date.now() - started, modelStatus, note })
        );
        return NextResponse.json({ answer, source, modelStatus, id });
    };

    // Greetings, refusals and "I don't have that" never need the model.
    // Skill answers are built from exact data (rating + projects), so the model can only make them worse.
    const deterministic = factsReply.sources.length > 0 && factsReply.sources.every((id) => id.startsWith("skill-"));
    const modelWorthCalling =
        factsReply.kind === "answer" && !deterministic && !isOffTopic(stripInjection(question)) && (hits[0]?.score ?? 0) >= MIN_SCORE;
    if (!modelWorthCalling) {
        return finish(factsReply.answer, "facts", await modelStatus());
    }

    const status = await modelStatus();
    if (status === "ready" && !modelBudgetLeft()) {
        return finish(factsReply.answer, "facts", status, "model-budget");
    }
    if (status === "ready") {
        modelCalls.push(Date.now());
        const result = await askModel(fixed, history, hits.map((h) => h.chunk.text));
        if (result.kind === "answer") return finish(result.answer, "model", "ready");
        if (result.kind === "unreachable") {
            lastStatus = { value: "waking", at: Date.now() };
            return finish(factsReply.answer, "facts", "waking", "model-unreachable");
        }
        return finish(factsReply.answer, "facts", "ready", result.kind === "busy" ? "model-busy" : "model-rejected");
    }
    return finish(factsReply.answer, "facts", status);
}
