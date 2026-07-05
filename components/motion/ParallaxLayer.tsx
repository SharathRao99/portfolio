"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Scroll-linked parallax: the layer drifts vertically as it crosses
 * the viewport. `speed` > 0 lags behind the scroll, < 0 leads it.
 */
export default function ParallaxLayer({
    children,
    speed = 40,
    className = "",
}: {
    children: React.ReactNode;
    speed?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);

    return (
        <motion.div ref={ref} style={{ y }} className={`will-change-transform ${className}`}>
            {children}
        </motion.div>
    );
}
