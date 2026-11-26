/**
 * Abuse guards for /api/chat.
 *
 * The rate limiter is in-memory and per server instance. On serverless that
 * means it is best-effort (a burst can hit different instances), which is
 * fine for a free portfolio bot: the model server enforces its own limits
 * and the fallback costs nothing. Swap for a shared store (e.g. Vercel KV)
 * if abuse ever becomes real.
 */

export const MAX_QUESTION_CHARS = 500;
export const MAX_HISTORY_TURNS = 4;

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, now = Date.now()): { ok: boolean; retryAfterSeconds: number } {
    const recent = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
        buckets.set(key, recent);
        return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((WINDOW_MS - (now - recent[0])) / 1000)) };
    }
    recent.push(now);
    buckets.set(key, recent);

    // keep the map from growing forever
    if (buckets.size > 5000) {
        for (const [k, times] of buckets) if (times.every((t) => now - t >= WINDOW_MS)) buckets.delete(k);
    }
    return { ok: true, retryAfterSeconds: 0 };
}

export interface ChatTurn {
    role: "user" | "assistant";
    content: string;
}

/** Validates and trims untrusted client input. Returns null when unusable. */
export function parseChatBody(body: unknown): { question: string; history: ChatTurn[]; sid: string } | null {
    if (!body || typeof body !== "object") return null;
    const { message, history, sid } = body as { message?: unknown; history?: unknown; sid?: unknown };
    if (typeof message !== "string") return null;
    const question = message.trim().slice(0, MAX_QUESTION_CHARS);
    if (!question) return null;

    const turns: ChatTurn[] = [];
    if (Array.isArray(history)) {
        for (const t of history.slice(-MAX_HISTORY_TURNS)) {
            if (!t || typeof t !== "object") continue;
            const { role, content } = t as { role?: unknown; content?: unknown };
            if ((role === "user" || role === "assistant") && typeof content === "string") {
                turns.push({ role, content: content.slice(0, MAX_QUESTION_CHARS) });
            }
        }
    }
    // random per-tab id used only to group a conversation in the log; anything malformed becomes "anon"
    const session = typeof sid === "string" && /^[A-Za-z0-9-]{8,40}$/.test(sid) ? sid : "anon";
    return { question, history: turns, sid: session };
}
