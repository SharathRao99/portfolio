"use client";
import { motion, type Variants } from "framer-motion";
import RevealText from "@/components/motion/RevealText";
import GlowCard from "@/components/motion/GlowCard";

interface ProjectStructureProps {
    title: string;
    description: string;
    keyContributions: string[];
    coreFeatures: string[];
    index?: number;
}

const listStagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
};

const listItem: Variants = {
    hidden: { opacity: 0, x: -24 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 200, damping: 24 },
    },
};

/**
 * Each project renders as a sticky panel: it pins below the header and
 * the next project slides over it, so scrolling reads as a stacked deck.
 */
export default function ProjectStructure({
    title,
    description,
    keyContributions,
    coreFeatures,
    index = 0,
}: ProjectStructureProps) {
    return (
        // deck-stacking only from md up — on phones the cards are taller than
        // the viewport, so pinning them buries content
        <section className="mb-10 md:sticky md:mb-16" style={{ top: `calc(7rem + ${index * 1.25}rem)` }}>
            <div className="container">
                {/* opaque backing so stacked cards don't show through each other */}
                <div className="rounded-3xl bg-background/90 shadow-card-float backdrop-blur-2xl">
                <GlowCard contentClassName="p-6 md:p-12">
                    <div className="relative">
                        {/* oversized ghost numeral */}
                        <span
                            aria-hidden
                            className="pointer-events-none absolute -top-8 right-0 select-none text-[7rem] font-black leading-none tracking-tighter opacity-[0.06] md:-top-12 md:text-[12rem]"
                        >
                            {String(index + 1).padStart(2, "0")}
                        </span>

                        <p className="eyebrow mb-4">Case study {String(index + 1).padStart(2, "0")}</p>
                        <RevealText
                            as="h2"
                            text={title}
                            className="text-3xl font-bold tracking-tight md:text-5xl"
                        />
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="mt-6 max-w-3xl leading-relaxed text-muted"
                        >
                            {description}
                        </motion.p>

                        <div className="mt-10 grid gap-10 md:grid-cols-2">
                            <FeatureList
                                heading="Key Contributions"
                                items={keyContributions}
                                accent="from-cyan-400 to-indigo-400"
                            />
                            <FeatureList
                                heading="Core Features"
                                items={coreFeatures}
                                accent="from-indigo-400 to-fuchsia-400"
                            />
                        </div>
                    </div>
                </GlowCard>
                </div>
            </div>
        </section>
    );
}

function FeatureList({
    heading,
    items,
    accent,
}: {
    heading: string;
    items: string[];
    accent: string;
}) {
    return (
        <div>
            <h3 className="mb-5 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em]">
                <span className={`h-px w-8 bg-gradient-to-r ${accent}`} />
                {heading}
            </h3>
            <motion.ul
                variants={listStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="space-y-3"
            >
                {items.map((item, i) => (
                    <motion.li key={i} variants={listItem} className="flex items-start gap-3">
                        <span
                            className={`mt-[7px] h-2 w-2 shrink-0 rounded-full bg-gradient-to-r ${accent} shadow-glow-sm`}
                        />
                        <span className="leading-relaxed text-muted">{item}</span>
                    </motion.li>
                ))}
            </motion.ul>
        </div>
    );
}
