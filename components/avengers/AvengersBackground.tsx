"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    type Transition,
    type TargetAndTransition,
} from "framer-motion";
import { HEROES, type Fx, type Hero } from "./heroes";
import HeroDialog from "./HeroDialog";

/**
 * Avengers-mode stage. A single fixed layer that:
 *  - assigns ONE random hero to each on-screen section (reshuffled every mount,
 *    so a different hero greets the first section on each refresh),
 *  - plays that hero's iconic entrance when its section scrolls into view
 *    (Iron Man flies in, Thor summons a storm, Spider-Man swings in on a web…),
 *  - settles the hero in place with an idle float + pseudo-3D hover tilt,
 *  - shows the hero's iconic line in a comic speech bubble on hover/click.
 *
 * Performance: lazy-loaded only in Avengers mode (see BackgroundAnimation),
 * transform/opacity/filter only, reduced-motion aware, and the layer itself is
 * pointer-events-none — only the character hit-areas are interactive, so the
 * page stays fully usable.
 */

type Slot = { side: "left" | "right"; top: number; size: number };

const SLOTS: Slot[] = [
    { side: "left", top: 16, size: 168 },
    { side: "right", top: 30, size: 196 },
    { side: "left", top: 52, size: 150 },
    { side: "right", top: 60, size: 182 },
    { side: "left", top: 24, size: 176 },
    { side: "right", top: 44, size: 160 },
    { side: "left", top: 64, size: 190 },
    { side: "right", top: 20, size: 150 },
    { side: "left", top: 40, size: 170 },
];

function shuffle<T>(input: T[]): T[] {
    const arr = [...input];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function collectSections(): HTMLElement[] {
    const tagged = Array.from(
        document.querySelectorAll<HTMLElement>("#content section, [data-avengers-section]")
    );
    if (tagged.length) return tagged;
    const main = document.getElementById("content");
    if (!main) return [];
    return Array.from(main.children).filter(
        (el): el is HTMLElement => el instanceof HTMLElement && el.offsetHeight > 200
    );
}

type Assignment = { hero: Hero; slot: Slot; section: HTMLElement };

export default function AvengersBackground() {
    const reduce = useReducedMotion();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
    // the most recent entrance's FX, shown as a brief page-wide storm/glow burst
    const [burst, setBurst] = useState<{ fx: Fx; key: number } | null>(null);

    // Build assignments after mount (client-only → random, no hydration mismatch).
    useEffect(() => {
        const sections = collectSections();
        if (!sections.length) return;
        const roster = shuffle(HEROES);
        setAssignments(
            sections.map((section, i) => ({
                hero: roster[i % roster.length],
                slot: SLOTS[i % SLOTS.length],
                section,
            }))
        );
    }, []);

    // Trigger each hero's entrance when its section first scrolls into view.
    useEffect(() => {
        if (!assignments.length) return;
        if (reduce) {
            // reduced motion: reveal all settled poses immediately, no FX
            setActiveIds(new Set(assignments.map((a) => a.hero.id)));
            return;
        }
        const byNode = new Map(assignments.map((a) => [a.section, a]));
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    const a = byNode.get(entry.target as HTMLElement);
                    if (!a) continue;
                    io.unobserve(entry.target);
                    setActiveIds((prev) => {
                        if (prev.has(a.hero.id)) return prev;
                        const next = new Set(prev);
                        next.add(a.hero.id);
                        return next;
                    });
                    if (a.hero.fx !== "none") setBurst({ fx: a.hero.fx, key: Date.now() });
                }
            },
            { threshold: 0.3, rootMargin: "0px 0px -10% 0px" }
        );
        assignments.forEach((a) => io.observe(a.section));
        return () => io.disconnect();
    }, [assignments, reduce]);

    // clear the page-wide burst shortly after it fires
    useEffect(() => {
        if (!burst) return;
        const t = window.setTimeout(() => setBurst(null), 1900);
        return () => window.clearTimeout(t);
    }, [burst]);

    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-40 overflow-hidden">
            <AnimatePresence>{burst && <GlobalFx key={burst.key} fx={burst.fx} />}</AnimatePresence>
            {assignments.map((a) => (
                <HeroSprite
                    key={a.hero.id}
                    hero={a.hero}
                    slot={a.slot}
                    active={activeIds.has(a.hero.id)}
                    reduce={!!reduce}
                />
            ))}
        </div>
    );
}

/* --------------------------------- sprite ---------------------------------- */

function HeroSprite({
    hero,
    slot,
    active,
    reduce,
}: {
    hero: Hero;
    slot: Slot;
    active: boolean;
    reduce: boolean;
}) {
    const [open, setOpen] = useState(false);
    const Pose = hero.Pose;

    // pseudo-3D tilt on hover
    const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
    const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
    const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * 26);
        rx.set(-py * 26);
    };
    const reset = () => {
        rx.set(0);
        ry.set(0);
    };

    const entrance = reduce ? undefined : getEntrance(hero.entrance, slot.side);
    const settled = active || reduce;

    return (
        <div
            className="absolute"
            style={{
                top: `${slot.top}vh`,
                [slot.side]: "3%",
                width: slot.size,
                height: slot.size,
                perspective: 800,
            }}
        >
            <motion.div
                initial={entrance ? entrance.initial : { opacity: 0 }}
                animate={
                    settled
                        ? entrance
                            ? entrance.animate
                            : { opacity: 1 }
                        : entrance
                            ? entrance.initial
                            : { opacity: 0 }
                }
                transition={entrance ? entrance.transition : { duration: 0.4 }}
                className="h-full w-full will-change-transform"
            >
                {/* idle float */}
                <motion.div
                    animate={reduce ? undefined : { y: [0, -7, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative h-full w-full"
                >
                    {/* interactive hit-area (only pointer-events target on the whole layer) */}
                    <div
                        className="pointer-events-auto h-full w-full cursor-pointer"
                        role="img"
                        aria-label={`${hero.name}: ${hero.dialog}`}
                        tabIndex={0}
                        onPointerMove={onMove}
                        onPointerLeave={() => {
                            reset();
                            setOpen(false);
                        }}
                        onPointerEnter={() => setOpen(true)}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setOpen(false)}
                        onClick={() => setOpen((v) => !v)}
                    >
                        <motion.div
                            style={{ rotateX: rx, rotateY: ry }}
                            className="h-full w-full"
                            aria-hidden
                        >
                            <Pose
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    filter: `drop-shadow(0 10px 22px ${hero.accent}55)`,
                                }}
                            />
                        </motion.div>
                        <HeroDialog hero={hero} open={open} side={slot.side} />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

/* ------------------------------ entrance specs ----------------------------- */

function getEntrance(
    entrance: Hero["entrance"],
    side: "left" | "right"
): { initial: TargetAndTransition; animate: TargetAndTransition; transition: Transition } {
    const off = side === "left" ? -1 : 1;
    const spring: Transition = { type: "spring", stiffness: 120, damping: 16 };
    switch (entrance) {
        case "fly":
            return {
                initial: { x: off * -260, y: -50, rotate: off * -18, opacity: 0 },
                animate: { x: 0, y: 0, rotate: 0, opacity: 1 },
                transition: spring,
            };
        case "swing":
            return {
                initial: { y: -300, x: off * 40, rotate: off * 24, opacity: 0 },
                animate: { y: [-300, 30, 0], x: [off * 40, off * -10, 0], rotate: [off * 24, off * -8, 0], opacity: 1 },
                transition: { duration: 1, ease: [0.34, 1.2, 0.64, 1], times: [0, 0.7, 1] },
            };
        case "smash":
            return {
                initial: { y: -240, scale: 1.35, opacity: 0 },
                animate: { y: [-240, 0, -14, 0], scale: [1.35, 1, 1.05, 1], opacity: 1, x: [0, -6, 6, 0] },
                transition: { duration: 0.85, ease: "easeOut", times: [0, 0.6, 0.8, 1] },
            };
        case "hammer":
            return {
                initial: { scale: 0.55, opacity: 0, rotate: -12 },
                animate: { scale: [0.55, 1.12, 1], opacity: 1, rotate: 0 },
                transition: { duration: 0.7, ease: "easeOut", times: [0, 0.6, 1] },
            };
        case "portal":
            return {
                initial: { scale: 0, rotate: -120, opacity: 0 },
                animate: { scale: 1, rotate: 0, opacity: 1 },
                transition: { type: "spring", stiffness: 90, damping: 12 },
            };
        case "shield":
            return {
                initial: { x: off * -280, rotate: off * -720, opacity: 0 },
                animate: { x: 0, rotate: 0, opacity: 1 },
                transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
            };
        case "gauntlet":
            return {
                initial: { y: 130, scale: 0.8, opacity: 0 },
                animate: { y: 0, scale: [0.8, 1.1, 1], opacity: 1 },
                transition: { duration: 0.8, ease: "easeOut", times: [0, 0.7, 1] },
            };
        case "illusion":
            return {
                initial: { opacity: 0, filter: "blur(8px)", x: off * 30 },
                animate: { opacity: [0, 1, 0.35, 1], filter: "blur(0px)", x: [off * 30, off * -14, off * 8, 0] },
                transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.4, 0.7, 1] },
            };
    }
}

/* ------------------------------- global FX --------------------------------- */

function GlobalFx({ fx }: { fx: Fx }) {
    if (fx === "lightning") {
        return (
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} exit={{ opacity: 0 }}>
                {/* storm darken + white flashes */}
                <motion.div
                    className="absolute inset-0 bg-white"
                    animate={{ opacity: [0, 0.55, 0, 0.35, 0] }}
                    transition={{ duration: 1.4, times: [0, 0.15, 0.3, 0.45, 1] }}
                />
                <motion.svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.2, 1, 0] }}
                    transition={{ duration: 1.4, times: [0, 0.15, 0.35, 0.5, 1] }}
                >
                    <polyline points="20,0 26,22 16,26 30,55" fill="none" stroke="#fde047" strokeWidth="0.8" />
                    <polyline points="62,0 56,20 68,24 54,50" fill="none" stroke="#fde047" strokeWidth="0.8" />
                    <polyline points="84,0 78,28 88,32 74,60" fill="none" stroke="#fef9c3" strokeWidth="0.6" />
                </motion.svg>
            </motion.div>
        );
    }
    if (fx === "portal") {
        return (
            <motion.div
                className="absolute left-1/2 top-1/3 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ border: "6px solid #fbbf24", boxShadow: "0 0 80px 20px rgba(251,191,36,0.4)" }}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{ scale: 1, opacity: [0, 0.7, 0], rotate: 120 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeOut" }}
            />
        );
    }
    if (fx === "thruster") {
        return (
            <motion.div
                className="absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 60%, rgba(245,158,11,0.35), transparent 55%)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3 }}
            />
        );
    }
    if (fx === "shock") {
        return (
            <motion.div
                className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ border: "4px solid #a855f7" }}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 14, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
        );
    }
    if (fx === "illusion") {
        return (
            <motion.div
                className="absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 45%, rgba(21,128,61,0.3), transparent 60%)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0, 0.4, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, times: [0, 0.3, 0.5, 0.7, 1] }}
            />
        );
    }
    return null;
}
