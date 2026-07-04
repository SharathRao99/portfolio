"use client";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/motion/AnimatedSection";
import RevealText from "@/components/motion/RevealText";
import MagneticButton from "@/components/motion/MagneticButton";
import MouseTilt from "@/components/motion/MouseTilt";
import ParallaxLayer from "@/components/motion/ParallaxLayer";
import { projectsCardData } from "@/lib/data";

export default function ProjectCard() {
    return (
        <AnimatedSection className="py-14 md:py-24">
            <div className="container">
                <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
                    <ParallaxLayer speed={30} className="px-2 pb-12 pt-6 lg:px-0 lg:py-0">
                        <ProjectShowcase />
                    </ParallaxLayer>

                    <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
                        <p className="eyebrow">Selected work</p>
                        <RevealText
                            as="h2"
                            text={projectsCardData.title}
                            className="text-3xl font-bold tracking-tight md:text-5xl"
                        />
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ delay: 0.25, duration: 0.6 }}
                            className="max-w-xl leading-relaxed text-muted"
                        >
                            {projectsCardData.description}
                        </motion.p>
                        <MagneticButton href={projectsCardData.ctaLink}>
                            {projectsCardData.ctaText}
                        </MagneticButton>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
}

/**
 * Product mockup stack: a glass browser window with a shimmering UI
 * skeleton, a floating mobile screen, and a stats chip - web and
 * mobile in one 3D composition.
 */
function ProjectShowcase() {
    return (
        <MouseTilt className="mx-auto w-full max-w-lg" maxTilt={6}>
            <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                <div
                    aria-hidden
                    className="absolute -inset-8 opacity-60 blur-2xl"
                    style={{ background: "radial-gradient(circle at 45% 40%, var(--glow-1), transparent 65%)" }}
                />

                {/* browser window */}
                <div className="glass relative overflow-hidden rounded-3xl shadow-card-float">
                    <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3.5 dark:border-white/5">
                        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                        <span className="glass-light ml-3 flex-1 rounded-full px-3 py-1 font-mono text-[10px] text-muted">
                            recruitree.app
                        </span>
                    </div>
                    <div className="space-y-4 p-6">
                        {/* hero banner */}
                        <div className="relative h-24 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500/40 via-indigo-500/40 to-fuchsia-500/40">
                            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.25)_50%,transparent_75%)] bg-[length:250%_100%] animate-shimmer" />
                            <div className="absolute bottom-3 left-4 space-y-1.5">
                                <div className="h-2.5 w-32 rounded-full bg-white/70" />
                                <div className="h-2 w-20 rounded-full bg-white/40" />
                            </div>
                        </div>
                        {/* skeleton cards */}
                        <div className="grid grid-cols-3 gap-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="glass-light space-y-2 rounded-xl p-3">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400/50 to-indigo-400/50" />
                                    <div className="h-1.5 w-full rounded-full bg-current opacity-15" />
                                    <div className="h-1.5 w-2/3 rounded-full bg-current opacity-10" />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="h-1.5 w-full rounded-full bg-current opacity-10" />
                            <div className="h-1.5 w-4/5 rounded-full bg-current opacity-10" />
                        </div>
                    </div>
                </div>

                {/* floating phone */}
                <div
                    className="absolute -bottom-12 right-0 w-24 md:-right-10 md:w-28"
                    style={{ transform: "translateZ(60px)" }}
                >
                    <div className="glass-strong rounded-[1.4rem] p-2 shadow-card-float animate-float-y">
                        <div className="space-y-2 rounded-[1rem] bg-gradient-to-b from-indigo-500/25 to-fuchsia-500/25 p-3">
                            <div className="mx-auto h-1 w-8 rounded-full bg-current opacity-20" />
                            <div className="h-10 rounded-lg bg-gradient-to-br from-cyan-400/50 to-indigo-400/50" />
                            <div className="h-1.5 w-full rounded-full bg-current opacity-15" />
                            <div className="h-1.5 w-3/4 rounded-full bg-current opacity-10" />
                            <div className="h-6 rounded-lg bg-current opacity-10" />
                        </div>
                    </div>
                </div>

                {/* stats chip */}
                <div className="absolute left-0 -top-6 md:-left-8" style={{ transform: "translateZ(45px)" }}>
                    <div className="glass-strong rounded-2xl px-4 py-3 shadow-card-float animate-float-y [animation-delay:-3.5s]">
                        <p className="text-lg font-black leading-none text-gradient">20+</p>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-muted">
                            products shipped
                        </p>
                    </div>
                </div>
            </div>
        </MouseTilt>
    );
}
