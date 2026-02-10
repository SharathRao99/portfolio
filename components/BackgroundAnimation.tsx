"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";

export default function BackgroundAnimation() {
    const [dots, setDots] = useState<{ x: number; y: number; id: number }[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);
    const { resolvedTheme } = useTheme();

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const updateGrid = () => {
            if (!containerRef.current) return;
            const width = window.innerWidth;
            const height = window.innerHeight;
            const gap = 50; // Spacing between dots
            const cols = Math.floor(width / gap);
            const rows = Math.floor(height / gap);
            const newDots = [];

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    // Add some randomness to the position to make it look more organic if desired, 
                    // but user asked for "grid" or "dotted". Let's keep it regular grid for now as it looks cleaner.
                    newDots.push({
                        x: j * gap + gap / 2,
                        y: i * gap + gap / 2,
                        id: i * cols + j,
                    });
                }
            }
            setDots(newDots);
        };

        updateGrid();
        window.addEventListener("resize", updateGrid);
        return () => window.removeEventListener("resize", updateGrid);
    }, []);

    const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        mouseX.set(clientX);
        mouseY.set(clientY);
    };

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 -z-50 h-full w-full overflow-hidden pointer-events-none"
        >
            {dots.map((dot) => (
                <Dot
                    key={dot.id}
                    id={dot.id}
                    baseX={dot.x}
                    baseY={dot.y}
                    mouseX={springX}
                    mouseY={springY}
                    theme={resolvedTheme}
                />
            ))}
        </div>
    );
}

function Dot({
    id,
    baseX,
    baseY,
    mouseX,
    mouseY,
    theme,
}: {
    id: number;
    baseX: number;
    baseY: number;
    mouseX: any;
    mouseY: any;
    theme: string | undefined;
}) {
    const baseColor = theme === "dark" ? "#475569" : "#cbd5e1"; // slate-600 : slate-300
    const colors = [
        "#06b6d4", // cyan
        "#ec4899", // pink
        "#8b5cf6", // violet
        "#f59e0b", // amber
        "#10b981", // emerald
        "#ef4444", // red
        "#3b82f6", // blue
    ];
    const activeColor = colors[id % colors.length];

    const x = useTransform([mouseX, mouseY], ([mx, my]) => {
        // @ts-ignore
        const dx = mx - baseX;
        // @ts-ignore
        const dy = my - baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200; // Radius of effect

        if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            const angle = Math.atan2(dy, dx);
            const moveDistance = force * 50; // Max movement pixels

            // Move AWAY from mouse
            const moveX = Math.cos(angle) * -moveDistance;
            return baseX + moveX;
        } else {
            return baseX;
        }
    });

    const y = useTransform([mouseX, mouseY], ([mx, my]) => {
        // @ts-ignore
        const dx = mx - baseX;
        // @ts-ignore
        const dy = my - baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200; // Radius of effect

        if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            const angle = Math.atan2(dy, dx);
            const moveDistance = force * 50; // Max movement pixels

            // Move AWAY from mouse
            const moveY = Math.sin(angle) * -moveDistance;
            return baseY + moveY;
        } else {
            return baseY;
        }
    });

    const backgroundColor = useTransform([mouseX, mouseY], ([mx, my]) => {
        // @ts-ignore
        const dx = mx - baseX;
        // @ts-ignore
        const dy = my - baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        if (distance < maxDistance) {
            return activeColor;
        } else {
            return baseColor;
        }
    });

    return (
        <motion.div
            style={{
                x: useSpring(x, { stiffness: 150, damping: 20 }),
                y: useSpring(y, { stiffness: 150, damping: 20 }),
                backgroundColor: backgroundColor // animate directly
            }}
            className="absolute h-1.5 w-1.5 rounded-full opacity-40 transition-colors duration-200"
        />
    );
}
