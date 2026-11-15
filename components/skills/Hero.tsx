import AnimatedSection from "@/components/motion/AnimatedSection";
import RevealText from "@/components/motion/RevealText";
import GhostWord from "@/components/motion/GhostWord";

export default function SkillsHero() {
    return (
        <AnimatedSection className="relative py-10 md:py-16">
            <GhostWord word="Skills" />
            <div className="container">
                <p className="eyebrow mb-5">Skills</p>
                <RevealText
                    as="h1"
                    text="Things I'm Good At"
                    className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
                />
                <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
                    I&apos;ve spent the last 3+ years turning business requirements into production software, working across the full stack with React, Next.js, Node.js and Python, and adding AI-powered features where they help. I&apos;m driven by the endless possibilities that technology offers and the rapid evolution of the development landscape.
                </p>
            </div>
        </AnimatedSection>
    );
}
