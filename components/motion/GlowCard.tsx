"use client";
import { useRef } from "react";

/**
 * Glass panel with a cursor-tracked spotlight and border glow.
 * Pointer position is written to CSS custom properties directly on the
 * element (no React state), so hover tracking costs zero re-renders.
 */
export default function GlowCard({
    children,
    className = "",
    contentClassName = "",
}: {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const handleMove = (e: React.MouseEvent) => {
        const el = ref.current;
        if (!el) return;
        const bounds = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - bounds.left}px`);
        el.style.setProperty("--my", `${e.clientY - bounds.top}px`);
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            className={`group/glow glass relative overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1 hover:shadow-card-float ${className}`}
        >
            {/* border glow that follows the cursor */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover/glow:opacity-100"
                style={{
                    background:
                        "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(129,140,248,0.35), transparent 65%)",
                    maskImage:
                        "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
                    maskClip: "padding-box, border-box",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                }}
            />
            {/* inner spotlight */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/glow:opacity-100"
                style={{
                    background:
                        "radial-gradient(560px circle at var(--mx, 50%) var(--my, 50%), var(--spotlight), transparent 70%)",
                }}
            />
            <div className={`relative z-10 ${contentClassName}`}>{children}</div>
        </div>
    );
}
