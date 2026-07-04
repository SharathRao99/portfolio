"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import RevealText from "@/components/motion/RevealText";
import MagneticButton from "@/components/motion/MagneticButton";
import MouseTilt from "@/components/motion/MouseTilt";
import { scrollToTarget } from "@/components/motion/SmoothScroll";
import { heroData, personalInfo, navData } from "@/lib/data";

export default function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    // hero gently recedes as the next section takes over
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const exitScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
    const exitOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25]);
    const exitY = useTransform(scrollYProgress, [0, 1], [0, -60]);

    return (
        <section ref={sectionRef} className="container relative flex min-h-[calc(100dvh-9rem)] flex-col justify-center">
            <motion.div
                style={{ scale: exitScale, opacity: exitOpacity, y: exitY }}
                className="grid items-center gap-12 will-change-transform lg:grid-cols-[1.1fr_0.9fr]"
            >
                <div className="order-2 flex flex-col items-center gap-7 text-center lg:order-1 lg:items-start lg:text-left">
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="eyebrow"
                    >
                        {heroData.title}
                    </motion.p>

                    <h1 className="text-5xl font-bold leading-[1.04] tracking-tight md:text-7xl">
                        <RevealText text={personalInfo.name.split(" ")[0]} delay={0.3} />
                        <br />
                        {/* single continuous gradient — bg-clip-text can't survive
                            per-word overflow masks, so this line wipes in via clip-path */}
                        <motion.span
                            initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
                            animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
                            transition={{ delay: 0.55, duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
                            className="text-gradient inline-block pb-[0.1em]"
                        >
                            builds digital products.
                        </motion.span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ delay: 0.8, duration: 0.7 }}
                        className="max-w-xl text-base leading-relaxed text-muted md:text-lg"
                    >
                        {heroData.description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
                    >
                        <MagneticButton href={heroData.ctaLink}>{heroData.ctaText}</MagneticButton>
                        <MagneticButton href={personalInfo.contactLink} variant="ghost">
                            {navData.contactText}
                        </MagneticButton>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 32 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 80, damping: 18 }}
                    className="order-1 w-full px-2 pb-10 pt-4 lg:order-2 lg:px-0 lg:py-0"
                >
                    <HeroShowcase />
                </motion.div>
            </motion.div>

            {/* clickable scroll cue */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                onClick={() => scrollToTarget("#skills")}
                aria-label="Scroll to skills"
                className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 cursor-pointer md:block"
            >
                <div className="flex h-10 w-6 items-start justify-center rounded-full border border-black/20 p-1.5 text-muted transition-colors duration-300 hover:border-indigo-400/60 dark:border-white/20">
                    <span className="h-2 w-[3px] rounded-full bg-current animate-scroll-hint" />
                </div>
            </motion.button>
        </section>
    );
}

/* ---------- typing sequence ---------- */

// plain-text mirror of the syntax-colored lines below; drives the typewriter
const CODE_LINES = [
    "const sharath = {",
    '  role: "Full-Stack Developer",',
    '  experience: "3+ years",',
    '  stack: ["React", "Next.js", "Node"],',
    '  ships: () => "end-to-end products",',
    "};",
];
const TOTAL_CHARS = CODE_LINES.reduce((sum, line) => sum + line.length, 0);

function useTypewriter() {
    const [typed, setTyped] = useState(0);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setTyped(TOTAL_CHARS);
            return;
        }
        let count = 0;
        const timer = setInterval(() => {
            // 2–3 chars per tick ≈ human-fast typing, ~2s total
            count = Math.min(count + 2 + Math.round(Math.random()), TOTAL_CHARS);
            setTyped(count);
            if (count >= TOTAL_CHARS) clearInterval(timer);
        }, 28);
        return () => clearInterval(timer);
    }, []);

    // chars already typed at the start of each line
    let consumed = 0;
    const lines = CODE_LINES.map((line) => {
        const visible = Math.max(0, Math.min(line.length, typed - consumed));
        consumed += line.length;
        return { text: line, visible, done: visible >= line.length };
    });
    const activeLine = lines.findIndex((l) => !l.done);
    return { lines, activeLine, done: typed >= TOTAL_CHARS };
}

/**
 * Layered 3D composition: a glass code editor that types itself out,
 * then a floating terminal "ships the build" — write code → ship it.
 * Each layer sits at a different translateZ depth inside the cursor tilt.
 */
function HeroShowcase() {
    const { lines, activeLine, done } = useTypewriter();

    // syntax-colored renderings shown once a line finishes typing
    const colored = [
        <><span className="text-fuchsia-500 dark:text-fuchsia-400">const</span> <span className="text-cyan-600 dark:text-cyan-300">sharath</span> = {"{"}</>,
        <>  role: <Str>&quot;Full-Stack Developer&quot;</Str>,</>,
        <>  experience: <Str>&quot;3+ years&quot;</Str>,</>,
        <>  stack: [<Str>&quot;React&quot;</Str>, <Str>&quot;Next.js&quot;</Str>, <Str>&quot;Node&quot;</Str>],</>,
        <>  ships: () <span className="text-fuchsia-500 dark:text-fuchsia-400">=&gt;</span> <Str>&quot;end-to-end products&quot;</Str>,</>,
        <>{"}"};</>,
    ];

    return (
        <MouseTilt className="mx-auto w-full max-w-md" maxTilt={7}>
            <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                {/* ambient glow behind the whole stack */}
                <div
                    aria-hidden
                    className="absolute -inset-8 opacity-70 blur-2xl"
                    style={{ background: "radial-gradient(circle at 50% 40%, var(--glow-2), transparent 65%)" }}
                />

                {/* code editor */}
                <div className="glass relative overflow-hidden rounded-3xl shadow-card-float">
                    <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3.5 dark:border-white/5">
                        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                        <span className="ml-3 font-mono text-xs text-muted">sharath.ts</span>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-6 sm:p-5 sm:text-[13px] sm:leading-7 md:text-sm">
                        <code>
                            {lines.map((line, i) => (
                                <span key={i} className="block whitespace-pre">
                                    <span className="mr-4 inline-block w-4 select-none text-right text-muted opacity-50">
                                        {i + 1}
                                    </span>
                                    {line.done ? colored[i] : line.text.slice(0, line.visible)}
                                    {(i === activeLine || (done && i === lines.length - 1)) && <Caret />}
                                </span>
                            ))}
                        </code>
                    </pre>
                </div>

                {/* floating terminal — enters only after the code finishes typing.
                    Outer div owns depth, inner owns the float animation (a CSS
                    transform animation would clobber translateZ). */}
                <div
                    className="absolute -bottom-10 left-0 w-[75%] md:-left-10"
                    style={{ transform: "translateZ(50px)" }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.9 }}
                        animate={done ? { opacity: 1, y: 0, scale: 1 } : {}}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="glass-strong rounded-2xl p-4 shadow-card-float animate-float-y"
                    >
                        <p className="font-mono text-xs leading-6">
                            <span className="text-emerald-500 dark:text-emerald-400">➜</span>{" "}
                            <span className="text-muted">npm run build</span>
                            <br />
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={done ? { opacity: 1 } : {}}
                                transition={{ delay: 0.7 }}
                                className="inline-block"
                            >
                                <span className="text-emerald-500 dark:text-emerald-400">✓</span> Ready — shipped to production
                            </motion.span>
                        </p>
                    </motion.div>
                </div>

                {/* status chip */}
                <div className="absolute right-0 -top-5 md:-right-6" style={{ transform: "translateZ(70px)" }}>
                    <div className="glass-strong rounded-full px-4 py-2 text-xs font-medium shadow-card-float animate-float-y [animation-delay:-3s]">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                        Open to opportunities
                    </div>
                </div>

                {/* floating tech chips */}
                <TechChip src="/icons/react.png" alt="React" className="-left-2 top-10 md:-left-14" z={80} delay="-1s" />
                <TechChip src="/icons/next.png" alt="Next.js" className="-right-1 top-1/2 md:-right-12" z={60} delay="-4.5s" />
                <TechChip src="/icons/nodejs.png" alt="Node.js" className="-bottom-14 right-6 md:-bottom-16 md:right-8" z={45} delay="-2.5s" />
            </div>
        </MouseTilt>
    );
}

function Caret() {
    return (
        <motion.span
            aria-hidden
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            className="ml-0.5 inline-block h-4 w-[7px] translate-y-[3px] bg-indigo-400"
        />
    );
}

function Str({ children }: { children: React.ReactNode }) {
    return <span className="text-emerald-600 dark:text-emerald-300">{children}</span>;
}

function TechChip({
    src,
    alt,
    className,
    z,
    delay,
}: {
    src: string;
    alt: string;
    className: string;
    z: number;
    delay: string;
}) {
    return (
        <div className={`absolute ${className}`} style={{ transform: `translateZ(${z}px)` }}>
            <div
                className="glass-light flex h-12 w-12 items-center justify-center rounded-2xl shadow-card-float animate-float-y"
                style={{ animationDelay: delay }}
            >
                <Image src={src} alt={alt} width={26} height={26} className="h-[26px] w-[26px] object-contain" />
            </div>
        </div>
    );
}
