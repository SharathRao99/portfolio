"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Staggered word-by-word reveal. Each word rises out of an
 * overflow-hidden mask — only transform/opacity are animated.
 *
 * Driven by CSS keyframes rather than framer-motion: the words ship in their
 * hidden state in the server HTML, so `immediate` blocks animate from the
 * very first paint instead of waiting on hydration. That matters for LCP —
 * an element parked at opacity:0 until JS boots is not an LCP candidate.
 * Below-the-fold blocks still wait for intersection, which is the only JS
 * this component needs.
 */
export default function RevealText({
    text,
    as: Tag = "span",
    className = "",
    delay = 0,
    stagger = 0.045,
    once = true,
    immediate = false,
}: {
    text: string;
    as?: React.ElementType;
    className?: string;
    delay?: number;
    stagger?: number;
    once?: boolean;
    /** Skip the viewport check and animate on first paint (above the fold). */
    immediate?: boolean;
}) {
    const words = text.split(" ");
    const ref = useRef<HTMLSpanElement>(null);
    const [state, setState] = useState<"pending" | "run">(
        immediate ? "run" : "pending"
    );

    useEffect(() => {
        if (state === "run") return;
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setState("run");
                    if (once) observer.disconnect();
                }
            },
            { threshold: 0.6 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [state, once]);

    // parameterized ElementType keeps children typing intact even when
    // libraries (e.g. R3F) augment the global JSX namespace
    const Component = Tag as React.ElementType<{
        className?: string;
        children?: React.ReactNode;
    }>;

    return (
        <Component className={className}>
            <span className="sr-only">{text}</span>
            <span ref={ref} aria-hidden data-reveal={state} className="inline">
                {words.map((word, i) => (
                    <span
                        key={i}
                        className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom"
                    >
                        <span
                            className="reveal-word"
                            style={
                                { "--enter-delay": `${delay + i * stagger}s` } as React.CSSProperties
                            }
                        >
                            {word}
                        </span>
                        {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
                    </span>
                ))}
            </span>
        </Component>
    );
}
