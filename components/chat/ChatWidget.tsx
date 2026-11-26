"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ModelStatus = "ready" | "waking" | "off";
type Message = { role: "user" | "assistant"; content: string; id?: string; vote?: 1 | -1 };

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

/** Random per-tab id so a conversation can be grouped in the log. Not tied to a person. */
function sessionId(): string {
    try {
        let sid = sessionStorage.getItem("chat-sid");
        if (!sid) {
            sid = crypto.randomUUID();
            sessionStorage.setItem("chat-sid", sid);
        }
        return sid;
    } catch {
        return "anon";
    }
}
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
    const [logging, setLogging] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const wakeStartedAt = useRef<number | null>(null);
    const [nudge, setNudge] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    // phones: the open chat is a full-screen sheet sized to the VISIBLE area (it shrinks when the keyboard opens)
    const [sheet, setSheet] = useState<{ top: number; height: number } | null>(null);

    // On Android Chrome the on-screen keyboard shrinks only the visual viewport, so a panel sized from the layout
    // viewport (100dvh) ends up taller than what is visible and its header and messages slide off the top.
    // Track the visual viewport instead, and lock the page behind the sheet so it cannot scroll away.
    useEffect(() => {
        if (!open || !window.matchMedia("(max-width: 639px)").matches) {
            setSheet(null);
            return;
        }
        const vv = window.visualViewport;
        const update = () => setSheet({ top: vv?.offsetTop ?? 0, height: vv?.height ?? window.innerHeight });
        update();
        vv?.addEventListener("resize", update);
        vv?.addEventListener("scroll", update);
        window.addEventListener("resize", update);
        const root = document.documentElement;
        const prev = [root.style.overflow, document.body.style.overflow];
        root.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        return () => {
            vv?.removeEventListener("resize", update);
            vv?.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
            [root.style.overflow, document.body.style.overflow] = prev;
        };
    }, [open]);

    // when the keyboard opens and the sheet shrinks, keep the latest message in view
    useEffect(() => {
        if (sheet) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }, [sheet?.height]); // eslint-disable-line react-hooks/exhaustive-deps

    // one friendly nudge per browser session, a few seconds after load; never again once dismissed or used
    useEffect(() => {
        if (sessionStorage.getItem("chat-nudged") === "1") return;
        const show = setTimeout(() => {
            setNudge(true);
            sessionStorage.setItem("chat-nudged", "1");
        }, 5000);
        const hide = setTimeout(() => setNudge(false), 11000);
        return () => {
            clearTimeout(show);
            clearTimeout(hide);
        };
    }, []);

    const checkStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/chat", { cache: "no-store" });
            const data = (await res.json()) as { modelStatus?: ModelStatus; logging?: boolean };
            if (data.modelStatus) setStatus(data.modelStatus);
            if (typeof data.logging === "boolean") setLogging(data.logging);
        } catch {
            // offline: leave the status as is
        }
    }, []);

    // opening the panel pings the model so it starts waking before the first question
    useEffect(() => {
        if (!open) return;
        setNudge(false);
        setHasOpened(true);
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

    // After the assistant replies, show the START of its answer (long answers used to be scrolled
    // past their first lines); otherwise follow the conversation to the bottom.
    useEffect(() => {
        const list = listRef.current;
        if (!list) return;
        const last = messages[messages.length - 1];
        const el = last.role === "assistant" && !pending ? list.querySelector<HTMLElement>(`[data-msg="${messages.length - 1}"]`) : null;
        // measure against the list itself (offsetTop is relative to the dialog, which has a header above the list)
        const top = el ? list.scrollTop + (el.getBoundingClientRect().top - list.getBoundingClientRect().top) - 12 : list.scrollHeight;
        list.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
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
            const history = messages.filter((m) => m !== INTRO).slice(-4).map(({ role, content }) => ({ role, content }));
            setMessages((prev) => [...prev, { role: "user", content: question }]);
            setInput("");
            setPending(true);
            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: question, history, sid: sessionId() }),
                });
                const data = (await res.json()) as { answer?: string; error?: string; modelStatus?: ModelStatus; id?: string };
                if (data.modelStatus) setStatus(data.modelStatus);
                const reply =
                    res.ok && data.answer
                        ? data.answer
                        : data.error ?? "Sorry, something went wrong. You can email Sharath directly.";
                setMessages((prev) => [...prev, { role: "assistant", content: reply, id: res.ok ? data.id : undefined }]);
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

    const vote = useCallback(
        (index: number, value: 1 | -1) => {
            const target = messages[index];
            if (!target?.id || target.vote) return; // one vote per answer
            setMessages((prev) => prev.map((m, i) => (i === index ? { ...m, vote: value } : m)));
            void fetch("/api/chat/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: target.id, value }),
            }).catch(() => {});
        },
        [messages]
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
                        style={sheet ? { top: sheet.top, height: sheet.height } : undefined}
                        className={
                            sheet
                                ? "fixed inset-x-0 z-[91] flex flex-col overflow-hidden bg-background"
                                : "fixed bottom-24 left-4 z-[80] flex h-[min(34rem,calc(100dvh-12.5rem))] w-[min(24rem,calc(100vw-2rem))] origin-bottom-left flex-col overflow-hidden rounded-3xl border border-black/10 bg-background shadow-card-float dark:border-white/10"
                        }
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
                                <div key={i} data-msg={i} className={m.role === "user" ? "flex justify-end" : "flex flex-col items-start gap-1"}>
                                    <p
                                        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                            m.role === "user"
                                                ? "bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 text-white"
                                                : "glass-light"
                                        }`}
                                    >
                                        {m.content}
                                    </p>
                                    {m.role === "assistant" && m.id && (
                                        <div className="flex items-center gap-1 pl-1 text-muted">
                                            {([1, -1] as const).map((v) => (
                                                <button
                                                    key={v}
                                                    onClick={() => vote(i, v)}
                                                    disabled={m.vote !== undefined}
                                                    aria-label={v === 1 ? "Helpful answer" : "Not helpful"}
                                                    aria-pressed={m.vote === v}
                                                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:text-foreground disabled:cursor-default ${
                                                        m.vote === v ? "text-indigo-500" : m.vote !== undefined ? "opacity-30" : ""
                                                    }`}
                                                >
                                                    <svg viewBox="0 0 24 24" fill={m.vote === v ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 ${v === -1 ? "rotate-180" : ""}`}>
                                                        <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                                                    </svg>
                                                </button>
                                            ))}
                                            {m.vote !== undefined && <span className="pl-1 text-[10px]">Thanks!</span>}
                                        </div>
                                    )}
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
                        {logging && (
                            <p className="px-4 pb-2.5 text-center text-[10px] leading-snug text-muted">
                                Questions are saved anonymously to improve answers. Please don&apos;t share personal details.
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* on phones the open sheet has its own close button, so the launcher steps aside */}
            <div className={`fixed bottom-6 left-4 z-[80] flex flex-col items-start gap-3 ${open && sheet ? "hidden" : ""}`}>
                <AnimatePresence>
                    {nudge && !open && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 260, damping: 24 }}
                            className="relative max-w-[16rem] rounded-2xl border border-black/10 bg-background py-3 pl-4 pr-8 text-sm leading-snug shadow-card-float dark:border-white/10"
                        >
                            <button
                                onClick={() => setNudge(false)}
                                aria-label="Dismiss"
                                className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-muted hover:text-foreground"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-3 w-3">
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                            Hi 👋 Recruiters: ask me about Sharath&apos;s experience, skills, salary or availability.
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Close chat" : "Ask about Sharath"}
                    aria-expanded={open}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 py-2.5 pl-2.5 pr-5 text-white shadow-glow transition-shadow hover:shadow-glow"
                >
                    {/* a few attention pulses on load, then it settles (never loops forever) */}
                    {!open && !hasOpened && (
                        <span
                            aria-hidden
                            style={{ animationIterationCount: 4, animationDelay: "1.2s" }}
                            className="absolute inset-0 -z-10 animate-ping rounded-full bg-indigo-400/50 motion-reduce:hidden"
                        />
                    )}
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                        {open ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-4 w-4">
                                <path d="M6 6l12 12M18 6L6 18" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 20.5l1.5-4.9A8.5 8.5 0 1 1 21 11.5Z" />
                                <path d="M12 7.6l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="currentColor" stroke="none" />
                            </svg>
                        )}
                        {!open && (
                            <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                        )}
                    </span>
                    <span className="text-sm font-semibold tracking-tight">
                        {open ? "Close" : (
                            <>
                                <span className="sm:hidden">Ask me</span>
                                <span className="hidden sm:inline">Ask about Sharath</span>
                            </>
                        )}
                    </span>
                </motion.button>
            </div>
        </>
    );
}
