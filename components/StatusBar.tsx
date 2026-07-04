"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/** IDE-style status bar: the last strip of the page. */
export default function StatusBar() {
    const { resolvedTheme } = useTheme();
    const [time, setTime] = useState("");

    useEffect(() => {
        const tick = () =>
            setTime(
                new Date().toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                })
            );
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="border-t border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.03]">
            <div className="container flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2.5 font-mono text-[11px] text-muted md:justify-between">
                <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    available for work · Bangalore, IN
                </span>
                <span suppressHydrationWarning className="tabular-nums">
                    {time && `local ${time} IST`}
                </span>
                <span>
                    {resolvedTheme ?? "system"} · Next.js × Tailwind × Motion
                </span>
            </div>
        </div>
    );
}
