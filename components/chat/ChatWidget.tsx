"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ModelStatus = "ready" | "waking" | "off";
type Message = { role: "user" | "assistant"; content: string };

const INTRO: Message = {
    role: "assistant",
    content:
        "Hi! I'm Sharath's assistant. Ask me about his experience, projects, skills, notice period, salary expectation or availability.",
};

const SUGGESTIONS = [
    "What does Sharath do at Zibtek?",
    "What is his notice period?",
    "Does he know Python?",
    "Salary expectation?",
];

const MAX_CHARS = 500;
const WAKE_POLL_MS = 8000;
const WAKE_GIVE_UP_MS = 3 * 60 * 1000;

/**
 * Floating recruiter Q&A assistant. Answers come from /api/chat, which uses
 * Sharath's own fine-tuned model when it is awake and falls back to his
 * portfolio facts when it is sleeping, so the chat always answers.
 *
 * Layering: z-[80] keeps it under the mobile menu overlay (z-[86]) and header
 * (z-[87]), so opening the menu covers it instead of overlapping.
 */
export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([INTRO]);
    const [input, setInput] = useState("");
    const [pending, setPending] = useState(false);
    const [status, setStatus] = useState<ModelStatus>("off");
    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const wakeStartedAt = useRef<number | null>(null);

    const checkStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/chat", { cache: "no-store" });
            const data = (await res.json()) as { modelStatus?: ModelStatus };
            if (data.modelStatus) setStatus(data.modelStatus);
        } catch {
            // offline: leave the status as is
        }
    }, []);

    // opening the panel pings the model so it starts waking before the first question
    useEffect(() => {
        if (!open) return;
        wakeStartedAt.current ??= Date.now();
        void checkStatus();
        inputRef.current?.focus();
    }, [open, checkStatus]);

    // while it is waking, keep checking until it is ready (or we give up)
    useEffect(() => {
        if (!open || status !== "waking") return;
        const id = setInterval(() => {
            if (wakeStartedAt.current && Date.now() - wakeStartedAt.current > WAKE_GIVE_UP_MS) {
                clearInterval(id);
                return;
            }
            void checkStatus();
        }, WAKE_POLL_MS);
        return () => clearInterval(id);
    }, [open, status, checkStatus]);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, pending]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const send = useCallback(
        async (text: string) => {
            const question = text.trim().slice(0, MAX_CHARS);
            if (!question || pending) return;
            const history = messages.filter((m) => m !== INTRO).slice(-4);
            setMessages((prev) => [...prev, { role: "user", content: question }]);
            setInput("");
            setPending(true);
            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: question, history }),
                });
                const data = (await res.json()) as { answer?: string; error?: string; modelStatus?: ModelStatus };
                if (data.modelStatus) setStatus(data.modelStatus);
                const reply =
                    res.ok && data.answer
                        ? data.answer
                        : data.error ?? "Sorry, something went wrong. You can email Sharath directly.";
                setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
            } catch {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "I couldn't reach the assistant. Please try again, or email Sharath directly." },
                ]);
            } finally {
                setPending(false);
            }
        },
        [messages, pending]
    );

    const showSuggestions = messages.length === 1;

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        role="dialog"
                        aria-label="Chat with Sharath's assistant"
                        // Lenis (SmoothScroll.tsx) captures every wheel event on the page, which scrolled the
                        // page behind the panel and left the message list stuck. This opts the panel out.
                        data-lenis-prevent
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                        // solid background (not glass): page text behind a translucent panel made
                        // answers hard to read. Height leaves room for the fixed header on short phones.
                        className="fixed bottom-24 left-4 z-[80] flex h-[min(34rem,calc(100dvh-12.5rem))] w-[min(24rem,calc(100vw-2rem))] origin-bottom-left flex-col overflow-hidden rounded-3xl border border-black/10 bg-background shadow-card-float dark:border-white/10"
                    >
                        <div className="flex items-center gap-3 border-b border-black/5 px-5 py-4 dark:border-white/5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-400 text-sm font-black text-white">
                                S
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold leading-tight">Ask about Sharath</p>
                                <p className="truncate text-[11px] text-muted">Answers come from his portfolio data</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                aria-label="Close chat"
                                className="glass-light flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                        </div>

                        {status === "waking" && (
                            <p role="status" className="border-b border-black/5 bg-amber-400/10 px-5 py-2 text-[11px] leading-snug text-muted dark:border-white/5">
                                Waking up my model, this takes about a minute. Meanwhile you&apos;ll get quick answers from my notes.
                            </p>
                        )}

                        <div ref={listRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
                            {messages.map((m, i) => (
                                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                                    <p
                                        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                            m.role === "user"
                                                ? "bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 text-white"
                                                : "glass-light"
                                        }`}
                                    >
                                        {m.content}
                                    </p>
                                </div>
                            ))}
                            {pending && (
                                <div className="flex justify-start" aria-label="Assistant is typing">
                                    <span className="glass-light flex gap-1 rounded-2xl px-3.5 py-3">
                                        {[0, 1, 2].map((d) => (
                                            <motion.span
                                                key={d}
                                                className="h-1.5 w-1.5 rounded-full bg-current opacity-50"
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.15 }}
                                            />
                                        ))}
                                    </span>
                                </div>
                            )}
                            {showSuggestions && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => void send(s)}
                                            className="glass-light rounded-full px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                void send(input);
                            }}
                            className="flex items-center gap-2 border-t border-black/5 p-3 dark:border-white/5"
                        >
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                maxLength={MAX_CHARS}
                                placeholder="Ask a question…"
                                aria-label="Your question"
                                // 16px+ on phones stops iOS Safari zooming the page on focus
                                className="glass-light min-w-0 flex-1 rounded-full px-4 py-2.5 text-base outline-none placeholder:text-muted md:text-sm"
                            />
                            <button
                                type="submit"
                                disabled={pending || !input.trim()}
                                aria-label="Send question"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 text-white shadow-glow-sm transition-opacity disabled:opacity-40"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close chat" : "Ask about Sharath"}
                aria-expanded={open}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                className="glass-strong fixed bottom-6 left-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full shadow-card-float"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
                    <path d="M9 11h6M9 14h3.5" />
                </svg>
            </motion.button>
        </>
    );
}
