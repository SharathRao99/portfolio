"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import AnimatedSection from "@/components/motion/AnimatedSection";
import GlowCard from "@/components/motion/GlowCard";
import RevealText from "@/components/motion/RevealText";

export interface TimelineEntry {
    title: string;
    org: string;
    location: string;
    period: string;
    description: string;
    logoPath: string;
    logoOnLight?: boolean;
}

/**
 * Journey timeline: a gradient spine fills as you scroll past it,
 * milestones slide in from alternating depths, logos pop into place.
 */
export default function Timeline({ heading, entries }: { heading: string; entries: TimelineEntry[] }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.8", "end 0.5"],
    });
    const lineProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });

    return (
        <AnimatedSection className="py-10 md:py-14">
            <div className="container">
                <RevealText
                    as="h2"
                    text={heading}
                    className="mb-12 text-3xl font-bold tracking-tight md:text-4xl"
                />

                <div ref={ref} className="relative pl-8 md:pl-12">
                    {/* spine track + scroll-linked fill */}
                    <div className="absolute bottom-0 left-[11px] top-0 w-[2px] rounded-full bg-current opacity-10 md:left-[15px]" />
                    <motion.div
                        style={{ scaleY: lineProgress }}
                        className="absolute bottom-0 left-[11px] top-0 w-[2px] origin-top rounded-full bg-gradient-to-b from-cyan-400 via-indigo-400 to-fuchsia-400 md:left-[15px]"
                    />

                    <div className="space-y-10">
                        {entries.map((entry, index) => (
                            <div key={index} className="relative">
                                {/* milestone node */}
                                <motion.span
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true, amount: 0.8 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
                                    className="absolute -left-8 top-8 flex h-6 w-6 items-center justify-center md:-left-12 md:h-8 md:w-8"
                                >
                                    <span className="absolute h-full w-full rounded-full bg-indigo-400/25" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 shadow-glow-sm" />
                                </motion.span>

                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.35 }}
                                    transition={{ type: "spring", stiffness: 90, damping: 20 }}
                                >
                                    <GlowCard contentClassName="p-6 md:p-8">
                                        <div className="flex flex-col gap-6 md:flex-row md:items-start">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
                                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                                viewport={{ once: true, amount: 0.5 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
                                                className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl p-2 ${
                                                    entry.logoOnLight ? "bg-white" : "glass-light"
                                                }`}
                                            >
                                                <Image
                                                    src={entry.logoPath}
                                                    alt={entry.org}
                                                    width={80}
                                                    height={80}
                                                    className="h-full w-full rounded-xl object-contain"
                                                />
                                            </motion.div>
                                            <div>
                                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                    <h3 className="text-xl font-bold tracking-tight">{entry.title}</h3>
                                                    <span className="font-mono text-xs uppercase tracking-widest text-muted">
                                                        {entry.period}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm font-semibold text-gradient">
                                                    {entry.org} · {entry.location}
                                                </p>
                                                <p className="mt-3 leading-relaxed text-muted">{entry.description}</p>
                                            </div>
                                        </div>
                                    </GlowCard>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
}
