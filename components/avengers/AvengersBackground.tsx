"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
    motion,
    useAnimationControls,
    useMotionValue,
    useReducedMotion,
    useSpring,
    type Transition,
    type TargetAndTransition,
} from "framer-motion";
import { HEROES, type Fx, type Hero } from "./heroes";
import HeroDialog from "./HeroDialog";
import AvengersFx, { type Burst } from "./AvengersFx";

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

// Alternating left/right, with each column's slots kept ~19vh apart and sizes
// modest so no two settled heroes overlap even when many are on screen at once.
const SLOTS: Slot[] = [
    { side: "left", top: 8, size: 148 },
    { side: "right", top: 17, size: 156 },
    { side: "left", top: 27, size: 140 },
    { side: "right", top: 38, size: 150 },
    { side: "left", top: 46, size: 146 },
    { side: "right", top: 59, size: 152 },
    { side: "left", top: 65, size: 138 },
    { side: "right", top: 80, size: 148 },
    { side: "left", top: 84, size: 136 },
];

function shuffle<T>(input: T[]): T[] {
    const arr = [...input];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Exact viewport position (uv, y-up) of a settled hero's icon centre, computed
// from the same slot geometry the sprite is positioned with — so an
// entrance-triggered burst radiates from the icon itself (e.g. Thor's hammer).
function iconCenter(slot: Slot, compact: boolean): { x: number; y: number } {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const size = Math.round(slot.size * (compact ? 0.52 : 1));
    const edge = (compact ? -0.04 : 0.03) * vw; // matches the sprite's [side]: 3% / -4%
    const cx = slot.side === "left" ? edge + size / 2 : vw - edge - size / 2;
    const cy = (slot.top / 100) * vh + size / 2;
    return { x: cx / vw, y: 1 - cy / vh };
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
    // indices of the sections currently on screen → only those heroes show, so a
    // section's icon is gone by the time you reach the next one.
    const [visible, setVisible] = useState<Set<number>>(new Set());
    const visibleRef = useRef<Set<number>>(new Set());
    // sections whose entrance FX has already fired (fire once, not on every re-scroll)
    const seenRef = useRef<Set<number>>(new Set());
    // the most recent FX, played as a brief WebGL burst from the hero's position
    const [burst, setBurst] = useState<Burst | null>(null);
    // On phones the sprites overlap the (edge-to-edge) text column, so shrink
    // them, fade them, and tuck them against the screen edge.
    const [compact, setCompact] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 640px)");
        const onChange = () => setCompact(mq.matches);
        onChange();
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    // (Re)build assignments on mount AND on every client-side navigation. The
    // layer lives in the root layout, so it persists across routes — without the
    // pathname dependency the observers stay bound to the previous page's now
    // detached <section> nodes and no hero appears after the first navigation.
    // A rAF lets the new page's DOM commit before we collect its sections.
    const pathname = usePathname();
    useEffect(() => {
        // Drop the previous route's heroes at once so they don't slowly animate
        // out on top of the incoming page's reveal (which read as a "collision").
        setAssignments([]);
        setVisible(new Set());
        visibleRef.current = new Set();
        seenRef.current = new Set();
        setBurst(null);
        const build = () => {
            const sections = collectSections();
            // reset the per-page tracking so this route's heroes reveal + fire fresh
            seenRef.current = new Set();
            visibleRef.current = new Set();
            setVisible(new Set());
            if (!sections.length) {
                setAssignments([]);
                return;
            }
            const roster = shuffle(HEROES);
            setAssignments(
                sections.map((section, i) => ({
                    hero: roster[i % roster.length],
                    slot: SLOTS[i % SLOTS.length],
                    section,
                }))
            );
        };
        const raf = requestAnimationFrame(build);
        return () => cancelAnimationFrame(raf);
    }, [pathname]);

    // Show a section's hero only while that section is on screen: reveal + play
    // its entrance when it scrolls in, hide it again when it scrolls out.
    useEffect(() => {
        if (!assignments.length) return;
        const idxByNode = new Map(assignments.map((a, i) => [a.section, i]));
        visibleRef.current = new Set();
        const io = new IntersectionObserver(
            (entries) => {
                let changed = false;
                for (const entry of entries) {
                    const idx = idxByNode.get(entry.target as HTMLElement);
                    if (idx === undefined) continue;
                    if (entry.isIntersecting) {
                        if (visibleRef.current.has(idx)) continue;
                        visibleRef.current.add(idx);
                        changed = true;
                        // one dramatic burst the first time this section appears,
                        // from the hero's icon centre (Thor's storm plays through once)
                        const a = assignments[idx];
                        if (!reduce && a.hero.fx !== "none" && !seenRef.current.has(idx)) {
                            seenRef.current.add(idx);
                            setBurst({
                                fx: a.hero.fx,
                                accent: a.hero.accent,
                                origin: iconCenter(a.slot, compact),
                                key: Date.now(),
                            });
                        }
                    } else if (visibleRef.current.has(idx)) {
                        visibleRef.current.delete(idx);
                        changed = true;
                    }
                }
                if (changed) setVisible(new Set(visibleRef.current));
            },
            { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
        );
        assignments.forEach((a) => io.observe(a.section));
        return () => io.disconnect();
    }, [assignments, reduce, compact]);

    // clear the burst shortly after it fires (each FX is a single one-shot play)
    useEffect(() => {
        if (!burst) return;
        const t = window.setTimeout(() => setBurst(null), 1900);
        return () => window.clearTimeout(t);
    }, [burst]);

    // clicking a hero fires its signature WebGL FX from the icon's position
    const fireFx = (fx: Fx, accent: string, origin: { x: number; y: number }) => {
        if (fx !== "none") setBurst({ fx, accent, origin, key: Date.now() });
    };

    return (
        <div
            aria-hidden
            // Desktop: sit ABOVE content (z-30, below header/chrome) so the icon
            // hit-areas actually receive hover/click — the layer itself stays
            // pointer-events-none, so only the icons intercept, the rest is
            // click-through. Mobile: stay behind + faded (decorative) as before.
            className={`pointer-events-none fixed inset-0 overflow-hidden ${
                compact ? "-z-40" : "z-30"
            }`}
        >
            {assignments.map((a, i) => (
                <HeroSprite
                    key={`${a.hero.id}-${i}`}
                    hero={a.hero}
                    slot={a.slot}
                    active={visible.has(i)}
                    reduce={!!reduce}
                    compact={compact}
                    onAction={fireFx}
                />
            ))}
            {/* WebGL burst layer — plays each hero's signature effect on click /
                entrance, from the icon's position. Idle (no render) otherwise. */}
            <AvengersFx burst={burst} />
        </div>
    );
}

/* --------------------------------- sprite ---------------------------------- */

function HeroSprite({
    hero,
    slot,
    active,
    reduce,
    compact,
    onAction,
}: {
    hero: Hero;
    slot: Slot;
    active: boolean;
    reduce: boolean;
    compact: boolean;
    onAction: (fx: Fx, accent: string, origin: { x: number; y: number }) => void;
}) {
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(false);
    const Pose = hero.Pose;
    const size = Math.round(slot.size * (compact ? 0.52 : 1));
    // per-hero signature move (Cap's shield spins, Thor swings…) — replayed on
    // both hover and click for lively, unmistakable feedback.
    const action = useAnimationControls();
    const onEnter = () => {
        setOpen(true);
        setHovered(true);
        if (!reduce) action.start(getAction(hero.entrance));
    };
    const onLeave = () => {
        reset();
        setOpen(false);
        setHovered(false);
    };
    // shared by click and Enter/Space so the icon is fully keyboard-operable
    const activate = (target: HTMLElement) => {
        setOpen((v) => !v);
        if (reduce) return;
        // fire the WebGL burst from the centre of the icon that was activated
        const r = target.getBoundingClientRect();
        onAction(hero.fx, hero.accent, {
            x: (r.left + r.width / 2) / window.innerWidth,
            y: 1 - (r.top + r.height / 2) / window.innerHeight,
        });
        action.start(getAction(hero.entrance));
    };
    const onClickHero = (e: React.MouseEvent<HTMLDivElement>) => activate(e.currentTarget);
    const onKeyDownHero = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            activate(e.currentTarget);
        }
    };

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

    // Drive show/hide imperatively so re-entering a section replays the FULL
    // dramatic entrance (from off-screen) every time, while scrolling away always
    // uses one calm, consistent fade-out — instead of abruptly reversing whatever
    // dramatic entrance this hero happens to have.
    const reveal = useAnimationControls();
    useEffect(() => {
        if (active) {
            if (entrance) {
                reveal.set(entrance.initial);
                reveal.start({ ...entrance.animate, transition: entrance.transition });
            } else {
                reveal.start({ opacity: 1, transition: { duration: 0.4 } });
            }
        } else {
            reveal.start({
                opacity: 0,
                scale: 0.82,
                transition: { duration: 0.4, ease: "easeInOut" },
            });
        }
        // entrance is recreated each render; we intentionally react only to `active`
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    return (
        <div
            className="absolute"
            style={{
                top: `${slot.top}vh`,
                // tuck against the screen edge on phones so sprites clear the text
                [slot.side]: compact ? "-4%" : "3%",
                width: size,
                height: size,
                perspective: 800,
            }}
        >
            <motion.div
                initial={entrance ? entrance.initial : { opacity: 0 }}
                animate={reveal}
                className="h-full w-full will-change-transform"
            >
                {/* idle float — only ticks while the hero is actually on screen */}
                <motion.div
                    animate={active && !reduce ? { y: [0, -7, 0] } : { y: 0 }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative h-full w-full"
                >
                    {/* interactive hit-area (only pointer-events target on the whole layer) */}
                    <div
                        className="pointer-events-auto h-full w-full cursor-pointer"
                        role="button"
                        aria-label={`${hero.name}: ${hero.dialog}`}
                        tabIndex={0}
                        onPointerMove={onMove}
                        onPointerLeave={onLeave}
                        onPointerEnter={onEnter}
                        onFocus={onEnter}
                        onBlur={onLeave}
                        onClick={onClickHero}
                        onKeyDown={onKeyDownHero}
                    >
                        {/* pulsing accent glow that blooms while hovered */}
                        <motion.div
                            aria-hidden
                            className="pointer-events-none absolute inset-[-15%] rounded-full"
                            style={{ background: `radial-gradient(circle, ${hero.accent}66, transparent 70%)` }}
                            animate={
                                hovered && !reduce
                                    ? { opacity: [0.35, 0.75, 0.35], scale: [1, 1.12, 1] }
                                    : { opacity: 0, scale: 0.8 }
                            }
                            transition={
                                hovered && !reduce
                                    ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                                    : { duration: 0.3 }
                            }
                        />
                        <motion.div
                            style={{ rotateX: rx, rotateY: ry, opacity: compact ? 0.4 : 1 }}
                            className="h-full w-full"
                            aria-hidden
                        >
                            {/* signature click move layer */}
                            <motion.div animate={action} className="h-full w-full">
                                {/* lively hover / press reaction (its own layer so it
                                    composes with the tilt above and the click move) */}
                                <motion.div
                                    className="h-full w-full"
                                    whileHover={{ scale: 1.16, rotate: slot.side === "left" ? 4 : -4 }}
                                    whileTap={{ scale: 0.94 }}
                                    transition={{ type: "spring", stiffness: 320, damping: 13 }}
                                >
                                    <Pose
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            // tighter shadow → crisper silhouette (the old
                                            // 22px halo blurred the busier poses, e.g. Spider)
                                            filter: `drop-shadow(0 6px 12px ${hero.accent}40)`,
                                        }}
                                    />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                        <HeroDialog hero={hero} open={open} side={slot.side} />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

/* ---------------------------- signature click move ------------------------- */
// Replayed each time a settled hero is clicked. The page-wide FX (thunder,
// portal, shockwave, …) is fired separately via onAction(hero.fx).
function getAction(entrance: Hero["entrance"]): TargetAndTransition {
    switch (entrance) {
        case "shield": // Captain America — spin the shield
            return { rotate: [0, 360], transition: { duration: 0.7, ease: "easeInOut" } };
        case "hammer": // Thor — swing Mjolnir (thunder fires via fx)
            return { rotate: [0, -12, 12, -6, 0], scale: [1, 1.12, 1], transition: { duration: 0.7 } };
        case "smash": // Hulk — pound down
            return { y: [0, -22, 0], scale: [1, 1.18, 0.94, 1], transition: { duration: 0.55, ease: "easeOut" } };
        case "fly": // Iron Man — thruster hop
            return { y: [0, -26, 0], rotate: [0, 8, -8, 0], transition: { duration: 0.7 } };
        case "swing": // Spider-Man — web swing
            return { rotate: [0, -16, 16, 0], y: [0, -14, 0], transition: { duration: 0.7 } };
        case "portal": // Dr Strange — spin the sling ring
            return { rotate: [0, 360], scale: [1, 0.9, 1], transition: { duration: 0.8, ease: "easeInOut" } };
        case "gauntlet": // Thanos — snap
            return { scale: [1, 0.82, 1.14, 1], rotate: [0, -5, 5, 0], transition: { duration: 0.6 } };
        case "illusion": // Loki / Doom — flicker into copies
            return { opacity: [1, 0.25, 1, 0.4, 1], x: [0, -10, 10, -4, 0], transition: { duration: 0.7 } };
        default:
            return { scale: [1, 1.12, 1], transition: { duration: 0.4 } };
    }
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
