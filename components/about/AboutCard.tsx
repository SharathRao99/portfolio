"use client";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/motion/AnimatedSection";
import RevealText from "@/components/motion/RevealText";
import GhostWord from "@/components/motion/GhostWord";

const paragraphOne =
    "My journey in software development began with a fascination for creating digital solutions that make a real difference. As a Full-Stack Developer, I've spent the last 3+ years turning complex problems into elegant solutions, working across the entire development spectrum from intuitive user interfaces to robust backend systems. I'm driven by the endless possibilities that technology offers and the rapid evolution of the development landscape.";

const paragraphTwo =
    "What excites me most about this industry is the opportunity to blend creativity with technical precision. Whether I'm architecting database solutions, implementing secure payment systems, or crafting seamless user experiences, I approach each project as a chance to innovate and excel. I believe in writing code that not only works but stands the test of time, focusing on maintainability and scalability in everything I build.";

export default function AboutCard() {
    return (
        <AnimatedSection className="relative py-10 md:py-16">
            <GhostWord word="About" />
            <div className="container">
                <p className="eyebrow mb-5">About me</p>
                <RevealText
                    as="h1"
                    text="Turning complex problems into elegant solutions."
                    className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
                />

                <div className="mt-12 grid gap-10 md:grid-cols-[1.2fr_1fr]">
                    <RevealText
                        as="p"
                        text={paragraphOne}
                        stagger={0.012}
                        className="text-lg font-medium leading-relaxed md:text-2xl"
                    />
                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: 0.4, duration: 0.7 }}
                        className="leading-relaxed text-muted md:pt-2"
                    >
                        {paragraphTwo}
                    </motion.p>
                </div>
            </div>
        </AnimatedSection>
    );
}
