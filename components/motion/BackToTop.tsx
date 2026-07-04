"use client";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { useState } from "react";
import { scrollToTop } from "./SmoothScroll";

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Floating orb with a scroll-progress ring; appears after ~one viewport. */
export default function BackToTop() {
    const { scrollY, scrollYProgress } = useScroll();
    const [shown, setShown] = useState(false);
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
    const dashOffset = useTransform(progress, [0, 1], [CIRCUMFERENCE, 0]);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setShown(latest > window.innerHeight * 0.9);
    });

    return (
        <AnimatePresence>
            {shown && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.6, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6, y: 16 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={scrollToTop}
                    aria-label="Back to top"
                    className="glass-strong fixed bottom-6 right-6 z-[85] flex h-12 w-12 items-center justify-center rounded-full shadow-card-float"
                >
                    <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
                        <motion.circle
                            cx="24"
                            cy="24"
                            r={RADIUS}
                            fill="none"
                            strokeWidth="2"
                            stroke="url(#btt-gradient)"
                            strokeLinecap="round"
                            strokeDasharray={CIRCUMFERENCE}
                            style={{ strokeDashoffset: dashOffset }}
                        />
                        <defs>
                            <linearGradient id="btt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#e879f9" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
