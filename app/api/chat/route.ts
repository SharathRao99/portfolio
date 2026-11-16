import { NextResponse } from "next/server";
import { answerFromFacts, isOffTopic } from "@/lib/chat/fallback";
import { parseChatBody, rateLimit } from "@/lib/chat/guard";
import { MIN_SCORE, retrieve } from "@/lib/chat/retrieve";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
const MODEL_TIMEOUT_MS = 9_000;
const HEALTH_TIMEOUT_MS = 4_000;

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

type ModelResult = { kind: "answer"; answer: string } | { kind: "rejected" } | { kind: "unreachable" };

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
    return NextResponse.json({ modelStatus: await modelStatus() });
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

    const { question, history } = parsed;
    const hits = retrieve(question);
    const factsReply = answerFromFacts(question, hits);

    // Greetings, refusals and "I don't have that" never need the model.
    const modelWorthCalling = factsReply.kind === "answer" && !isOffTopic(question) && hits[0]?.score >= MIN_SCORE;
    if (!modelWorthCalling) {
        return NextResponse.json({ answer: factsReply.answer, source: "facts", modelStatus: await modelStatus() });
    }

    const status = await modelStatus();
    if (status === "ready") {
        const result = await askModel(question, history, hits.map((h) => h.chunk.text));
        if (result.kind === "answer") return NextResponse.json({ answer: result.answer, source: "model", modelStatus: "ready" });
        if (result.kind === "unreachable") {
            lastStatus = { value: "waking", at: Date.now() };
            return NextResponse.json({ answer: factsReply.answer, source: "facts", modelStatus: "waking" });
        }
        return NextResponse.json({ answer: factsReply.answer, source: "facts", modelStatus: "ready" });
    }
    return NextResponse.json({ answer: factsReply.answer, source: "facts", modelStatus: status });
}
