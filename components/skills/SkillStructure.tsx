"use client";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import Image from "next/image";
import AnimatedSection from "@/components/motion/AnimatedSection";
import GlowCard from "@/components/motion/GlowCard";

type SkillSet = {
    name: string;
    image: string;
    rating: number;
};

const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function SkillsStructure({ title, skillSets }: { title: string; skillSets: SkillSet[] }) {
    return (
        <AnimatedSection className="py-6 md:py-8">
            <div className="container">
                <GlowCard contentClassName="p-6 md:p-10">
                    <h2 className="mb-8 flex items-center gap-4 text-xl font-bold tracking-tight md:text-2xl">
                        <span className="h-px w-10 bg-gradient-to-r from-cyan-400 to-fuchsia-400" />
                        {title}
                    </h2>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {skillSets.map((skill, index) => (
                            <SkillRing key={skill.name} skill={skill} delay={index * 0.08} />
                        ))}
                    </div>
                </GlowCard>
            </div>
        </AnimatedSection>
    );
}

function SkillRing({ skill, delay }: { skill: SkillSet; delay: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });
    const [displayed, setDisplayed] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const controls = animate(0, skill.rating, {
            duration: 1.4,
            delay,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (v) => setDisplayed(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, skill.rating, delay]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay, type: "spring", stiffness: 160, damping: 20 }}
            className="group flex flex-col items-center gap-3"
        >
            <div className="relative h-24 w-24 transition-transform duration-300 group-hover:scale-110">
                <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r={RING_RADIUS}
                        fill="none"
                        strokeWidth="3"
                        className="stroke-current opacity-10"
                    />
                    <motion.circle
                        cx="40"
                        cy="40"
                        r={RING_RADIUS}
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="url(#skill-ring-gradient)"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                        whileInView={{
                            strokeDashoffset: RING_CIRCUMFERENCE * (1 - skill.rating / 100),
                        }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <defs>
                        <linearGradient id="skill-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="50%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#e879f9" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                        src={skill.image}
                        alt={skill.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                </div>
                <div
                    aria-hidden
                    className="absolute inset-0 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
                    style={{ background: "radial-gradient(circle, var(--glow-2), transparent 70%)" }}
                />
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold">{skill.name}</p>
                <p className="font-mono text-xs text-muted">{displayed}%</p>
            </div>
        </motion.div>
    );
}
