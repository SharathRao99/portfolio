"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { useTheme } from "next-themes";

// WebGL layer is heavy — load it lazily, client-only
const ParticleField = dynamic(() => import("./three/ParticleField"), { ssr: false });

/**
 * Ambient background system, layered back-to-front:
 *  1. aurora blobs drifting on pure CSS keyframes (GPU compositing only)
 *  2. WebGL particle nebula + wireframe with cursor parallax (desktop only,
 *     skipped for prefers-reduced-motion)
 *  3. faint structural grid, radially masked
 *  4. ONE spring-smoothed spotlight following the cursor
 */
export default function BackgroundAnimation() {
    const { resolvedTheme } = useTheme();
    const [showWebGL, setShowWebGL] = useState(false);

    const mouseX = useMotionValue(-600);
    const mouseY = useMotionValue(-600);
    const springX = useSpring(mouseX, { damping: 40, stiffness: 120, mass: 0.8 });
    const springY = useSpring(mouseY, { damping: 40, stiffness: 120, mass: 0.8 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMove, { passive: true });
        return () => window.removeEventListener("mousemove", handleMove);
    }, [mouseX, mouseY]);

    useEffect(() => {
        const wide = window.matchMedia("(min-width: 768px)");
        const still = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setShowWebGL(wide.matches && !still.matches);
        update();
        wide.addEventListener("change", update);
        still.addEventListener("change", update);
        return () => {
            wide.removeEventListener("change", update);
            still.removeEventListener("change", update);
        };
    }, []);

    const spotlight = useMotionTemplate`radial-gradient(600px circle at ${springX}px ${springY}px, var(--spotlight), transparent 70%)`;

    return (
        <div aria-hidden className="noise fixed inset-0 -z-50 overflow-hidden">
            {/* aurora blobs */}
            <div
                className="absolute -top-[20%] left-[8%] h-[55vmax] w-[55vmax] rounded-full blur-[90px] animate-aurora-drift will-change-transform"
                style={{ background: "radial-gradient(circle at center, var(--glow-1), transparent 60%)" }}
            />
            <div
                className="absolute -bottom-[25%] -right-[10%] h-[60vmax] w-[60vmax] rounded-full blur-[100px] animate-aurora-drift-alt will-change-transform"
                style={{ background: "radial-gradient(circle at center, var(--glow-2), transparent 60%)" }}
            />
            <div
                className="absolute top-[30%] right-[25%] h-[38vmax] w-[38vmax] rounded-full blur-[80px] animate-aurora-drift will-change-transform [animation-delay:-12s]"
                style={{ background: "radial-gradient(circle at center, var(--glow-3), transparent 60%)" }}
            />

            {/* WebGL depth layer */}
            {showWebGL && <ParticleField isDark={resolvedTheme !== "light"} />}

            {/* structural grid, radially masked so it stays quiet */}
            <div
                className="absolute inset-0 opacity-[0.35] dark:opacity-[0.22]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, var(--surface-border) 1px, transparent 1px), linear-gradient(to bottom, var(--surface-border) 1px, transparent 1px)",
                    backgroundSize: "72px 72px",
                    maskImage: "radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%)",
                }}
            />

            {/* cursor spotlight */}
            <motion.div className="absolute inset-0" style={{ background: spotlight }} />
        </div>
    );
}
