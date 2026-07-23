"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { useAnimationMode } from "./animation-mode/AnimationModeProvider";

// WebGL layer is heavy — load it lazily, client-only
const ParticleField = dynamic(() => import("./three/ParticleField"), { ssr: false });

// Avengers layer is only ever fetched for visitors who opt into that mode, so
// default-mode traffic never pays for it (protects the Lighthouse baseline).
const AvengersBackground = dynamic(() => import("./avengers/AvengersBackground"), {
    ssr: false,
});

// 2× the gradient's 600px radius, so the baked box covers the full falloff
const SPOTLIGHT_SIZE = 1200;

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
    const { mode } = useAnimationMode();
    // `mode` is null until mounted; treat that as the default so the first paint
    // matches the SSR markup (the aurora carries the look either way).
    const isAvengers = mode === "avengers";
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
        const eligible = () => wide.matches && !still.matches;

        // three.js is ~215KB gzipped and its first draw walls the main thread.
        // It is pure decoration, so it waits for an idle moment after load
        // rather than competing with the hero for the critical path — the
        // aurora layer carries the look until it arrives. Once that gate has
        // opened, media-query changes take effect immediately as before.
        let idleId = 0;
        let cancelled = false;
        let opened = false;

        const update = () => opened && setShowWebGL(eligible());

        const open = () => {
            if (cancelled) return;
            const schedule =
                window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
            idleId = schedule(
                () => {
                    if (cancelled) return;
                    opened = true;
                    update();
                },
                { timeout: 2000 }
            ) as unknown as number;
        };

        if (document.readyState === "complete") open();
        else window.addEventListener("load", open, { once: true });

        wide.addEventListener("change", update);
        still.addEventListener("change", update);
        return () => {
            cancelled = true;
            window.cancelIdleCallback?.(idleId);
            window.removeEventListener("load", open);
            wide.removeEventListener("change", update);
            still.removeEventListener("change", update);
        };
    }, []);

    // The spotlight used to be a full-viewport element whose `background`
    // gradient was rewritten on every spring frame, which repaints the whole
    // viewport per frame while the cursor moves. Same gradient, but baked
    // once into a fixed 1200px box that is only translated — transform-only,
    // so it stays on the compositor.
    const spotX = useTransform(springX, (v) => v - SPOTLIGHT_SIZE / 2);
    const spotY = useTransform(springY, (v) => v - SPOTLIGHT_SIZE / 2);

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

            {/* WebGL depth layer — default mode only; Avengers mode swaps in its
                own (lighter, SVG) hero layer instead of the three.js field */}
            {showWebGL && !isAvengers && <ParticleField isDark={resolvedTheme !== "light"} />}
            {isAvengers && <AvengersBackground />}

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
            <motion.div
                className="absolute left-0 top-0 will-change-transform"
                style={{
                    x: spotX,
                    y: spotY,
                    width: SPOTLIGHT_SIZE,
                    height: SPOTLIGHT_SIZE,
                    background:
                        "radial-gradient(circle 600px at center, var(--spotlight), transparent 70%)",
                }}
            />
        </div>
    );
}
