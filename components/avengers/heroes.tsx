/**
 * Original, hand-built SVG hero "poses" + per-character metadata that drives the
 * cinematic Avengers-mode system (entrance timelines, background FX, and the
 * iconic hover dialog). These are recognizable by silhouette + signature colours
 * and are deliberately NOT copies of any copyrighted character art. Bold rounded
 * strokes give them a toy / comic feel. Each pose is a self-contained inline SVG
 * (zero network cost).
 */

export type EmblemProps = {
    className?: string;
    style?: React.CSSProperties;
};

/** how the character arrives when its section scrolls into view */
export type Entrance =
    | "fly" // Iron Man — thruster fly-in from the side
    | "swing" // Spider-Man — shoots a web, swings across, off toward the bottom
    | "smash" // Hulk — drops in with an impact
    | "hammer" // Thor — hammer flies to hand, storm breaks
    | "portal" // Dr Strange — steps out of a sparking ring
    | "shield" // Captain America — shield spins in and returns
    | "gauntlet" // Thanos — rises with a gauntlet clench
    | "illusion"; // Loki / Doom — ghost copies collapse into one

/** short-lived background effect fired during the entrance */
export type Fx = "lightning" | "web" | "portal" | "thruster" | "shock" | "illusion" | "none";

export type Hero = {
    id: string;
    /** used for aria + the speech bubble heading */
    name: string;
    kind: "hero" | "villain";
    /** signature accent colour (used by FX + dialog bubble) */
    accent: string;
    /** iconic one-liner shown in the hover/click tooltip */
    dialog: string;
    entrance: Entrance;
    fx: Fx;
    Pose: (props: EmblemProps) => JSX.Element;
};

const svgBase = {
    viewBox: "0 0 100 100",
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
};

/* ---------------------------------- heroes --------------------------------- */

function IronMan({ className, style }: EmblemProps) {
    return (
        <svg {...svgBase} className={className} style={style}>
            <path d="M30 20 h40 l8 20 -6 30 c-2 12 -14 18 -22 18 s-20 -6 -22 -18 l-6 -30 z"
                fill="#b91c1c" stroke="#f59e0b" strokeWidth="3" />
            <path d="M34 42 l14 -4 -3 9 z" fill="#fde68a" stroke="none" />
            <path d="M66 42 l-14 -4 3 9 z" fill="#fde68a" stroke="none" />
            <circle cx="50" cy="34" r="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
            <path d="M42 74 h16" stroke="#f59e0b" strokeWidth="3" />
        </svg>
    );
}

function Captain({ className, style }: EmblemProps) {
    return (
        <svg {...svgBase} className={className} style={style}>
            <circle cx="50" cy="50" r="40" fill="#b91c1c" />
            <circle cx="50" cy="50" r="30" fill="#f8fafc" />
            <circle cx="50" cy="50" r="20" fill="#b91c1c" />
            <circle cx="50" cy="50" r="14" fill="#1d4ed8" />
            <path d="M50 40 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z" fill="#f8fafc" />
        </svg>
    );
}

function Thor({ className, style }: EmblemProps) {
    return (
        <svg {...svgBase} className={className} style={style}>
            <rect x="26" y="20" width="48" height="30" rx="6" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
            <rect x="45" y="48" width="10" height="34" rx="4" fill="#a16207" stroke="#78350f" strokeWidth="2.5" />
            <path d="M50 8 l-6 12 h5 l-4 10 10 -13 h-5 z" fill="#fde047" stroke="none" />
            <path d="M34 30 h32 M34 40 h32" stroke="#cbd5e1" strokeWidth="2.5" />
        </svg>
    );
}

function Hulk({ className, style }: EmblemProps) {
    return (
        <svg {...svgBase} className={className} style={style}>
            <path d="M28 46 c0 -6 4 -8 8 -8 h30 c6 0 10 4 10 12 v14 c0 8 -6 14 -16 14 h-20 c-8 0 -12 -6 -12 -14 z"
                fill="#16a34a" stroke="#14532d" strokeWidth="3" />
            <path d="M36 40 v-6 c0 -4 8 -4 8 0 v6 M48 39 v-9 c0 -4 8 -4 8 0 v9 M60 40 v-7 c0 -4 8 -4 8 0 v8"
                fill="#22c55e" stroke="#14532d" strokeWidth="2.5" />
            <path d="M30 56 h44" stroke="#14532d" strokeWidth="2.5" />
        </svg>
    );
}

function Spider({ className, style }: EmblemProps) {
    return (
        <svg {...svgBase} className={className} style={style}>
            <path d="M50 16 c18 0 30 14 30 30 c0 20 -18 38 -30 38 s-30 -18 -30 -38 c0 -16 12 -30 30 -30 z"
                fill="#dc2626" stroke="#7f1d1d" strokeWidth="3" />
            <path d="M50 20 v56 M24 46 h52 M30 30 l40 32 M70 30 l-40 32" stroke="#7f1d1d" strokeWidth="1.6" />
            <path d="M34 44 c4 -8 14 -8 16 0 c-4 6 -12 6 -16 0 z" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M66 44 c-4 -8 -14 -8 -16 0 c4 6 12 6 16 0 z" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5" />
        </svg>
    );
}

function Strange({ className, style }: EmblemProps) {
    return (
        <svg {...svgBase} className={className} style={style}>
            <circle cx="50" cy="50" r="34" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="5 7" />
            <circle cx="50" cy="50" r="24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="3 5" />
            <circle cx="50" cy="50" r="13" fill="#b45309" stroke="#fde68a" strokeWidth="2" />
            <path d="M50 37 v-9 M50 63 v9 M37 50 h-9 M63 50 h9" stroke="#fbbf24" strokeWidth="2.5" />
        </svg>
    );
}

/* --------------------------------- villains -------------------------------- */

function Thanos({ className, style }: EmblemProps) {
    return (
        <svg {...svgBase} className={className} style={style}>
            <path d="M30 44 c0 -6 4 -8 8 -8 h26 c8 0 12 6 12 14 v12 c0 10 -6 16 -16 16 h-18 c-8 0 -12 -6 -12 -14 z"
                fill="#a16207" stroke="#713f12" strokeWidth="3" />
            <path d="M38 38 v-6 c0 -4 7 -4 7 0 v6 M49 37 v-8 c0 -4 7 -4 7 0 v8 M60 39 v-6 c0 -4 7 -4 7 0 v7"
                fill="#ca8a04" stroke="#713f12" strokeWidth="2.5" />
            <circle cx="41" cy="46" r="3" fill="#a855f7" />
            <circle cx="52" cy="45" r="3" fill="#22d3ee" />
            <circle cx="63" cy="47" r="3" fill="#ef4444" />
            <circle cx="52" cy="62" r="3.5" fill="#eab308" />
        </svg>
    );
}

function Loki({ className, style }: EmblemProps) {
    return (
        <svg {...svgBase} className={className} style={style}>
            <path d="M34 40 c0 -12 8 -18 16 -18 s16 6 16 18 v10 c0 12 -8 24 -16 24 s-16 -12 -16 -24 z"
                fill="#15803d" stroke="#052e16" strokeWidth="3" />
            <path d="M34 40 c-10 -4 -16 -16 -14 -30 c10 4 16 14 16 24 z" fill="#ca8a04" stroke="#713f12" strokeWidth="2.5" />
            <path d="M66 40 c10 -4 16 -16 14 -30 c-10 4 -16 14 -16 24 z" fill="#ca8a04" stroke="#713f12" strokeWidth="2.5" />
            <path d="M44 48 h12 M50 40 v20" stroke="#052e16" strokeWidth="2.5" />
        </svg>
    );
}

function Doom({ className, style }: EmblemProps) {
    return (
        <svg {...svgBase} className={className} style={style}>
            <path d="M30 24 h40 c4 0 6 3 6 8 v30 c0 14 -12 26 -26 26 s-26 -12 -26 -26 v-30 c0 -5 2 -8 6 -8 z"
                fill="#4b5563" stroke="#1f2937" strokeWidth="3" />
            <path d="M30 30 h40" stroke="#9ca3af" strokeWidth="3" />
            <path d="M38 44 l10 4 -10 4 z M62 44 l-10 4 10 4 z" fill="#111827" />
            <path d="M42 66 c4 4 12 4 16 0" stroke="#111827" strokeWidth="2.5" />
            <path d="M50 34 v6" stroke="#9ca3af" strokeWidth="2.5" />
        </svg>
    );
}

/* -------------------------------- registry --------------------------------- */

export const HEROES: Hero[] = [
    { id: "ironman", name: "Iron Sentinel", kind: "hero", accent: "#f59e0b", dialog: "I am Iron Man.", entrance: "fly", fx: "thruster", Pose: IronMan },
    { id: "spider", name: "Web Slinger", kind: "hero", accent: "#dc2626", dialog: "With great power…", entrance: "swing", fx: "web", Pose: Spider },
    { id: "thor", name: "Storm Bringer", kind: "hero", accent: "#fde047", dialog: "I say thee nay!", entrance: "hammer", fx: "lightning", Pose: Thor },
    { id: "hulk", name: "Green Titan", kind: "hero", accent: "#22c55e", dialog: "SMASH!", entrance: "smash", fx: "shock", Pose: Hulk },
    { id: "strange", name: "Mystic Ring", kind: "hero", accent: "#fbbf24", dialog: "By the Vishanti!", entrance: "portal", fx: "portal", Pose: Strange },
    { id: "captain", name: "Star Shield", kind: "hero", accent: "#1d4ed8", dialog: "I can do this all day.", entrance: "shield", fx: "none", Pose: Captain },
    { id: "thanos", name: "Mad Titan", kind: "villain", accent: "#a855f7", dialog: "I am inevitable.", entrance: "gauntlet", fx: "shock", Pose: Thanos },
    { id: "loki", name: "Trickster", kind: "villain", accent: "#15803d", dialog: "Glorious purpose.", entrance: "illusion", fx: "illusion", Pose: Loki },
    { id: "doom", name: "Iron Mask", kind: "villain", accent: "#9ca3af", dialog: "Doom demands it.", entrance: "illusion", fx: "illusion", Pose: Doom },
];
