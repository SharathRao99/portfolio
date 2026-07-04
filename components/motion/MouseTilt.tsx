"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Perspective tilt that follows the cursor with spring physics.
 * Children can opt into depth by translating on the Z axis
 * (transform-style is preserved).
 */
export default function MouseTilt({
    children,
    className = "",
    maxTilt = 9,
}: {
    children: React.ReactNode;
    className?: string;
    maxTilt?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);

    const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), {
        stiffness: 160,
        damping: 20,
    });
    const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), {
        stiffness: 160,
        damping: 20,
    });

    const handleMove = (e: React.MouseEvent) => {
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;
        px.set((e.clientX - bounds.left) / bounds.width);
        py.set((e.clientY - bounds.top) / bounds.height);
    };

    const reset = () => {
        px.set(0.5);
        py.set(0.5);
    };

    return (
        <div ref={ref} onMouseMove={handleMove} onMouseLeave={reset} style={{ perspective: 1200 }} className={className}>
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="h-full w-full will-change-transform"
            >
                {children}
            </motion.div>
        </div>
    );
}
