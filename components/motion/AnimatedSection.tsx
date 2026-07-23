"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Section entrance: rises with a blur-to-focus settle instead of a flat fade.
 * Blur only animates during the one-shot entrance, then the element is static.
 *
 * CSS keyframes plus one IntersectionObserver rather than framer-motion.
 * Every page wraps its sections in this, so keeping it off the animation
 * library takes framer-motion out of several component trees entirely, and a
 * blur-to-focus settle across a full-width section is work the compositor
 * should own rather than a per-frame main-thread tick.
 */
export default function AnimatedSection({
    children,
    className = "",
    delay = 0,
    id,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    id?: string;
}) {
    const ref = useRef<HTMLElement>(null);
    const [shown, setShown] = useState(false);
    const [rendered, setRendered] = useState(false);

    // The entrance itself still fires at 15% visibility, matching the original
    // framer-motion `viewport={{ amount: 0.15 }}`.
    useEffect(() => {
        const el = ref.current;
        if (!el || shown) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [shown]);

    // `content-visibility` is released well before that, on a wide rootMargin.
    // The two are deliberately separate: skipping render work for offscreen
    // sections is a real win, but the browser has to guess their height until
    // they first render, and correcting that guess while a section is on
    // screen shifts everything below it. Releasing early means the correction
    // lands entirely outside the viewport, where it costs no layout shift.
    useEffect(() => {
        const el = ref.current;
        if (!el || rendered) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRendered(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "600px 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [rendered]);

    return (
        <section
            ref={ref}
            id={id}
            data-section-enter={shown ? "run" : "pending"}
            data-section-render={rendered ? "on" : "deferred"}
            style={{ "--enter-delay": `${delay}s` } as React.CSSProperties}
            className={className}
        >
            {children}
        </section>
    );
}
