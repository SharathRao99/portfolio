"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/motion/AnimatedSection";
import RevealText from "@/components/motion/RevealText";
import MagneticButton from "@/components/motion/MagneticButton";
import GhostWord from "@/components/motion/GhostWord";
import { skillsCardData } from "@/lib/data";

export default function SkillsCard() {
    const innerSkills = skillsCardData.skills.slice(0, 4);
    const outerSkills = skillsCardData.skills.slice(4);

    return (
        <AnimatedSection id="skills" className="relative py-14 md:py-24">
            <GhostWord word="Skills" />
            <div className="container">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
                        <p className="eyebrow">What I work with</p>
                        <RevealText
                            as="h2"
                            text={skillsCardData.title}
                            className="text-3xl font-bold tracking-tight md:text-5xl"
                        />
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ delay: 0.25, duration: 0.6 }}
                            className="max-w-xl leading-relaxed text-muted"
                        >
                            {skillsCardData.description}
                        </motion.p>
                        <MagneticButton href={skillsCardData.ctaLink}>
                            {skillsCardData.ctaText}
                        </MagneticButton>
                    </div>

                    {/* Orbital skill system — pure CSS rotation, GPU-composited.
                        Sized responsively; chips are placed with percentages so
                        the layout never overflows small screens. */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ type: "spring", stiffness: 70, damping: 18 }}
                        className="flex justify-center"
                    >
                        <div className="relative flex aspect-square w-[280px] items-center justify-center sm:w-[340px] md:w-[420px]">
                            {/* core */}
                            <div className="glass relative z-10 flex h-16 w-16 items-center justify-center rounded-full shadow-glow-sm md:h-24 md:w-24">
                                <span className="text-gradient text-2xl font-black md:text-3xl">S</span>
                                <div
                                    aria-hidden
                                    className="absolute inset-0 rounded-full opacity-70"
                                    style={{ background: "radial-gradient(circle, var(--glow-2), transparent 70%)" }}
                                />
                            </div>

                            <Orbit
                                sizeClass="h-1/2 w-1/2"
                                skills={innerSkills}
                                spin="animate-spin-slow"
                                counterSpin="animate-spin-slow-reverse"
                            />
                            <Orbit
                                sizeClass="h-[88%] w-[88%]"
                                skills={outerSkills}
                                spin="animate-spin-slower-reverse"
                                counterSpin="animate-spin-slower"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatedSection>
    );
}

function Orbit({
    sizeClass,
    skills,
    spin,
    counterSpin,
}: {
    sizeClass: string;
    skills: { name: string; src: string }[];
    spin: string;
    counterSpin: string;
}) {
    return (
        <div
            className={`absolute rounded-full border border-dashed border-black/10 dark:border-white/15 ${sizeClass} ${spin}`}
        >
            {skills.map((skill, i) => {
                const angle = (2 * Math.PI * i) / skills.length;
                const left = 50 + 50 * Math.sin(angle);
                const top = 50 - 50 * Math.cos(angle);
                return (
                    <div
                        key={skill.name}
                        className="absolute"
                        style={{ left: `${left}%`, top: `${top}%` }}
                    >
                        <div className="-translate-x-1/2 -translate-y-1/2">
                            {/* counter-rotation keeps the chip upright while the ring spins */}
                            <div className={counterSpin}>
                                <div className="group glass-light relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-125 hover:shadow-glow-sm md:h-12 md:w-12 md:rounded-2xl">
                                    <Image
                                        src={skill.src}
                                        alt={skill.name}
                                        width={28}
                                        height={28}
                                        className="h-6 w-6 object-contain md:h-7 md:w-7"
                                    />
                                    <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-medium opacity-0 transition-opacity duration-300 glass-light group-hover:opacity-100">
                                        {skill.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
