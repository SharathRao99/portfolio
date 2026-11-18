/**
 * Anonymous question log, so failures can be found and turned into better
 * facts, retriever keywords, test questions and (after human review) training data.
 *
 * OFF unless Upstash Redis credentials are present, so nothing is stored by
 * default and local/dev runs never write. Vercel's Upstash integration sets
 * KV_REST_API_URL / KV_REST_API_TOKEN; plain Upstash uses UPSTASH_REDIS_REST_*.
 *
 * Privacy rules (keep these if you change the file):
 *  - no IP address, no user agent, no identity; only a random per-tab session id
 *  - emails and phone-like numbers are redacted before saving
 *  - text is truncated, and every record expires after 90 days
 *
 * Uses Upstash's REST API through fetch, so there is no SDK dependency.
 */

const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const loggingEnabled = Boolean(URL_ && TOKEN);

const TTL_SECONDS = 90 * 24 * 60 * 60;
const INDEX_KEY = "chatlog:index";

export interface LogEntry {
    id: string;
    /** random per-tab id, to group a conversation; never tied to a person */
    sid: string;
    q: string;
    a: string;
    /** where the answer came from */
    src: "model" | "facts";
    /** what the retrieval answerer decided this question was */
    kind: "answer" | "unknown" | "off-topic" | "greeting";
    sources: string[];
    /** retrieval confidence (BM25 score of the best fact); low scores = shaky answers worth reviewing */
    score?: number;
    ms: number;
    modelStatus: string;
    /** e.g. "model-rejected" (answer discarded) or "model-unreachable" */
    note?: string;
}

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE = /\+?\d[\d\s().-]{7,}\d/g;

/** Strips things a visitor might paste about themselves. Names cannot be detected, so none are claimed removed. */
export function redact(text: string, max: number): string {
    return text.replace(EMAIL, "[email]").replace(PHONE, "[number]").slice(0, max);
}

async function pipeline(commands: (string | number)[][]): Promise<void> {
    if (!URL_ || !TOKEN) return;
    const res = await fetch(`${URL_.replace(/\/$/, "")}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(commands),
        signal: AbortSignal.timeout(3000),
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`log store responded ${res.status}`);
}

/** Best-effort: a failed log write must never affect the visitor's answer. */
export async function logChat(entry: LogEntry): Promise<void> {
    if (!loggingEnabled) return;
    try {
        const now = Date.now();
        const record = JSON.stringify({
            ...entry,
            q: redact(entry.q, 500),
            a: redact(entry.a, 1500),
            t: new Date(now).toISOString(),
        });
        await pipeline([
            ["SET", `chatlog:${entry.id}`, record, "EX", TTL_SECONDS],
            ["ZADD", INDEX_KEY, now, entry.id],
            ["ZREMRANGEBYSCORE", INDEX_KEY, "-inf", now - TTL_SECONDS * 1000],
        ]);
    } catch (e) {
        console.error("chat log failed:", e instanceof Error ? e.message : e);
    }
}

const ID = /^[0-9a-f-]{36}$/i;

export async function logFeedback(id: string, value: 1 | -1): Promise<void> {
    if (!loggingEnabled || !ID.test(id)) return;
    try {
        await pipeline([["SET", `chatfb:${id}`, value, "EX", TTL_SECONDS]]);
    } catch (e) {
        console.error("chat feedback log failed:", e instanceof Error ? e.message : e);
    }
}
