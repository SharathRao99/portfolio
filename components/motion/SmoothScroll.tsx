"use client";
import { useEffect } from "react";
import Lenis from "lenis";

// module-level handle so BackToTop (and future consumers) can drive the
// same instance instead of fighting native scrollTo
let lenis: Lenis | null = null;

export function scrollToTop() {
    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
}

export function scrollToTarget(selector: string) {
    if (lenis) lenis.scrollTo(selector, { duration: 1.2, offset: -96 });
    else document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
}

/**
 * Inertia smooth scrolling via Lenis. Mounted once in the layout.
 * Skipped entirely for reduced-motion users and touch-only devices —
 * they keep native scrolling.
 */
export default function SmoothScroll() {
    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const finePointer = window.matchMedia("(pointer: fine)").matches;
        if (reduced || !finePointer) return;

        lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        let rafId: number;
        const raf = (time: number) => {
            lenis?.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis?.destroy();
            lenis = null;
        };
    }, []);

    return null;
}
