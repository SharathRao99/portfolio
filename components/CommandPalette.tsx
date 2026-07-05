"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { personalInfo } from "@/lib/data";

// module-level opener so the header chip can trigger the palette
// (same pattern as scrollToTop in motion/SmoothScroll)
let openHandler: (() => void) | null = null;
export function openPalette() {
    openHandler?.();
}

type Command = {
    id: string;
    group: "Navigate" | "Actions";
    label: string;
    hint?: string;
    keywords: string;
    run: () => void | Promise<void>;
};

export default function CommandPalette() {
    const router = useRouter();
    const { setTheme, resolvedTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(0);
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const close = useCallback(() => {
        setOpen(false);
        setQuery("");
        setSelected(0);
        setCopied(false);
    }, []);

    const commands = useMemo<Command[]>(
        () => [
            { id: "home", group: "Navigate", label: "Home", hint: "/", keywords: "home start landing", run: () => router.push("/") },
            { id: "about", group: "Navigate", label: "About", hint: "/about", keywords: "about me journey experience education", run: () => router.push("/about") },
            { id: "skills", group: "Navigate", label: "Skills", hint: "/skills", keywords: "skills stack tech technologies", run: () => router.push("/skills") },
            { id: "projects", group: "Navigate", label: "Projects", hint: "/projects", keywords: "projects work case studies portfolio", run: () => router.push("/projects") },
            {
                id: "theme",
                group: "Actions",
                label: `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`,
                keywords: "theme dark light mode toggle appearance",
                run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
            },
            {
                id: "email",
                group: "Actions",
                label: copied ? "Copied ✓" : "Copy email address",
                hint: personalInfo.email,
                keywords: "email copy contact mail reach",
                run: async () => {
                    await navigator.clipboard.writeText(personalInfo.email);
                    setCopied(true);
                    setTimeout(close, 700);
                },
            },
            {
                id: "resume",
                group: "Actions",
                label: "Download resume",
                hint: "PDF",
                keywords: "resume cv download pdf",
                run: () => {
                    window.open(personalInfo.resumeLink, "_blank");
                },
            },
            {
                id: "linkedin",
                group: "Actions",
                label: "Open LinkedIn",
                hint: "↗",
                keywords: "linkedin social profile connect",
                run: () => {
                    window.open("https://www.linkedin.com/in/sharath-b-c-45ba01203", "_blank");
                },
            },
        ],
        [router, setTheme, resolvedTheme, copied, close]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return commands;
        return commands.filter(
            (c) => c.label.toLowerCase().includes(q) || c.keywords.includes(q)
        );
    }, [commands, query]);

    // global shortcuts
    useEffect(() => {
        openHandler = () => setOpen(true);
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => {
            openHandler = null;
            window.removeEventListener("keydown", onKey);
        };
    }, []);

    useEffect(() => {
        if (open) {
            // focus after the entrance animation mounts the input
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    useEffect(() => setSelected(0), [query]);

    const runCommand = useCallback(
        (command: Command) => {
            command.run();
            if (command.id !== "email") close();
        },
        [close]
    );

    const onInputKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelected((s) => Math.min(s + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelected((s) => Math.max(s - 1, 0));
        } else if (e.key === "Enter" && filtered[selected]) {
            e.preventDefault();
            runCommand(filtered[selected]);
        } else if (e.key === "Escape") {
            close();
        }
    };

    let lastGroup: string | null = null;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={close}
                    className="fixed inset-0 z-[96] flex items-start justify-center bg-black/40 px-4 pt-[18vh] backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -12, filter: "blur(6px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.96, y: -12, filter: "blur(6px)" }}
                        transition={{ type: "spring", stiffness: 320, damping: 26 }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-label="Command palette"
                        className="glass-strong w-full max-w-lg overflow-hidden rounded-2xl shadow-card-float"
                    >
                        <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3.5 dark:border-white/10">
                            <span className="font-mono text-sm text-indigo-500 dark:text-indigo-400">&gt;</span>
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={onInputKey}
                                placeholder="type a command…"
                                aria-label="Search commands"
                                className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted"
                            />
                            <kbd className="glass-light rounded-md px-1.5 py-0.5 font-mono text-[10px] text-muted">esc</kbd>
                        </div>

                        <div className="max-h-[46vh] overflow-y-auto p-2">
                            {filtered.length === 0 && (
                                <p className="px-3 py-6 text-center font-mono text-sm text-muted">
                                    no matches — try &quot;projects&quot; or &quot;email&quot;
                                </p>
                            )}
                            {filtered.map((command, i) => {
                                const showGroup = command.group !== lastGroup;
                                lastGroup = command.group;
                                return (
                                    <div key={command.id}>
                                        {showGroup && (
                                            <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                                                {command.group}
                                            </p>
                                        )}
                                        <button
                                            onClick={() => runCommand(command)}
                                            onMouseEnter={() => setSelected(i)}
                                            className={`relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                                                i === selected ? "text-foreground" : "text-muted"
                                            }`}
                                        >
                                            {i === selected && (
                                                <motion.span
                                                    layoutId="palette-pill"
                                                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                                    className="absolute inset-0 rounded-xl glass-light"
                                                />
                                            )}
                                            <span className="relative z-10 font-medium">{command.label}</span>
                                            {command.hint && (
                                                <span className="relative z-10 font-mono text-xs text-muted">{command.hint}</span>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-4 border-t border-black/5 px-4 py-2.5 font-mono text-[10px] text-muted dark:border-white/10">
                            <span><kbd>↑↓</kbd> navigate</span>
                            <span><kbd>↵</kbd> select</span>
                            <span className="ml-auto text-gradient font-semibold">sharath.dev</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
