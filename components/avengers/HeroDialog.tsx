"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Hero } from "./heroes";

/**
 * Comic speech-bubble tooltip shown when a settled character is hovered/clicked.
 * Pops in with a signature spring + a quick "impact" flash behind the text.
 * Positioned above the character; `side` flips the little tail.
 */
export default function HeroDialog({
    hero,
    open,
    side,
}: {
    hero: Hero;
    open: boolean;
    side: "left" | "right";
}) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.4, y: 12, rotate: side === "left" ? -6 : 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 8 }}
                    transition={{ type: "spring", stiffness: 520, damping: 18 }}
                    className="pointer-events-none absolute -top-3 left-1/2 z-10 -translate-x-1/2 -translate-y-full"
                >
                    <div
                        className="relative whitespace-nowrap rounded-2xl border-[3px] border-black bg-white px-4 py-2 font-comic text-lg tracking-wide text-black"
                        style={{
                            boxShadow: `4px 4px 0 0 ${hero.accent}, 4px 4px 0 3px #000`,
                        }}
                    >
                        {/* impact flash */}
                        <motion.span
                            aria-hidden
                            initial={{ scale: 0, opacity: 0.9 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                            className="absolute inset-0 rounded-2xl"
                            style={{ background: hero.accent }}
                        />
                        <span className="relative">{hero.dialog}</span>
                        {/* comic tail */}
                        <span
                            className="absolute top-full h-0 w-0"
                            style={{
                                [side === "left" ? "left" : "right"]: "22px",
                                borderLeft: "10px solid transparent",
                                borderRight: "10px solid transparent",
                                borderTop: "14px solid #000",
                            }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
