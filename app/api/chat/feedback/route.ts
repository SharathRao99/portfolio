import { after, NextResponse } from "next/server";
import { rateLimit } from "@/lib/chat/guard";
import { logFeedback } from "@/lib/chat/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/chat/feedback { id, value: 1 | -1 }: a thumbs up/down on one answer (anonymous). */
export async function POST(req: Request) {
    const key = `fb:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"}`;
    if (!rateLimit(key).ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

    let body: { id?: unknown; value?: unknown } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    if (typeof body.id !== "string" || (body.value !== 1 && body.value !== -1)) {
        return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });
    }
    const { id, value } = body as { id: string; value: 1 | -1 };
    after(() => logFeedback(id, value));
    return NextResponse.json({ ok: true });
}
