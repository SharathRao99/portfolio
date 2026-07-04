"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, [data-cursor]";

/**
 * Custom cursor: a dot that tracks 1:1 and a spring-lagged ring that
 * swells over interactive elements. Desktop fine-pointer only; the
 * native cursor is hidden via the `custom-cursor` class on <html>
 * (see globals.css), which keeps carets on text fields.
 */
export default function CustomCursor() {
    const [enabled, setEnabled] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [visible, setVisible] = useState(false);

    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    const ringX = useSpring(x, { stiffness: 400, damping: 35, mass: 0.6 });
    const ringY = useSpring(y, { stiffness: 400, damping: 35, mass: 0.6 });

    useEffect(() => {
        const fine = window.matchMedia("(pointer: fine)").matches;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!fine || reduced) return;

        setEnabled(true);
        document.documentElement.classList.add("custom-cursor");

        const move = (e: MouseEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);
            setVisible(true);
        };
        const over = (e: MouseEvent) => {
            setHovering(!!(e.target as Element | null)?.closest?.(INTERACTIVE));
        };
        const leave = () => setVisible(false);

        window.addEventListener("mousemove", move, { passive: true });
        window.addEventListener("mouseover", over, { passive: true });
        document.documentElement.addEventListener("mouseleave", leave);
        return () => {
            document.documentElement.classList.remove("custom-cursor");
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseover", over);
            document.documentElement.removeEventListener("mouseleave", leave);
        };
    }, [x, y]);

    if (!enabled) return null;

    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[95] hidden md:block">
            {/* 1:1 dot */}
            <motion.div
                style={{ x, y, opacity: visible ? 1 : 0 }}
                className="absolute -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-opacity duration-300"
            />
            {/* spring-lagged ring */}
            <motion.div
                style={{ x: ringX, y: ringY, opacity: visible ? 1 : 0 }}
                className="absolute -ml-4 -mt-4 transition-opacity duration-300"
            >
                <motion.div
                    animate={{
                        scale: hovering ? 1.8 : 1,
                        opacity: hovering ? 0.9 : 0.45,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="h-8 w-8 rounded-full border border-indigo-400"
                />
            </motion.div>
        </div>
    );
}
