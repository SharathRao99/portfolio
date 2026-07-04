"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Magnetic CTA — the button is gently pulled toward the cursor and
 * snaps back on leave via spring physics. Content counter-translates
 * slightly for a layered, physical feel.
 */
export default function MagneticButton({
    href,
    children,
    variant = "primary",
    className = "",
    external = false,
    download = false,
}: {
    href: string;
    children: React.ReactNode;
    variant?: "primary" | "ghost";
    className?: string;
    external?: boolean;
    download?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 200, damping: 16, mass: 0.5 });
    const springY = useSpring(y, { stiffness: 200, damping: 16, mass: 0.5 });

    const handleMove = (e: React.MouseEvent) => {
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;
        x.set((e.clientX - bounds.left - bounds.width / 2) * 0.35);
        y.set((e.clientY - bounds.top - bounds.height / 2) * 0.35);
    };

    const reset = () => {
        x.set(0);
        y.set(0);
    };

    const styles =
        variant === "primary"
            ? "bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 text-white shadow-glow-sm hover:shadow-glow"
            : "glass-light text-foreground hover:border-indigo-400/40";

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={reset}
            style={{ x: springX, y: springY }}
            whileTap={{ scale: 0.96 }}
            className="inline-block"
        >
            <Link
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                {...(download ? { download: true } : {})}
                className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold transition-shadow duration-300 ${styles} ${className}`}
            >
                {variant === "primary" && (
                    <span
                        aria-hidden
                        className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.35)_50%,transparent_75%)] bg-[length:250%_100%] animate-shimmer"
                    />
                )}
                <span className="relative z-10 inline-flex items-center gap-2">
                    {children}
                    <span
                        aria-hidden
                        className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
                    >
                        →
                    </span>
                </span>
            </Link>
        </motion.div>
    );
}
