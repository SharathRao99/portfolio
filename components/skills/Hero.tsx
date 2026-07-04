import AnimatedSection from "@/components/motion/AnimatedSection";
import RevealText from "@/components/motion/RevealText";

export default function SkillsHero() {
    return (
        <AnimatedSection className="py-10 md:py-16">
            <div className="container">
                <p className="eyebrow mb-5">Skills</p>
                <RevealText
                    as="h1"
                    text="Things I'm Good At"
                    className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
                />
                <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
                    I&apos;ve spent the last 3+ years turning complex problems into elegant solutions, working across the entire development spectrum from intuitive user interfaces to robust backend systems. I&apos;m driven by the endless possibilities that technology offers and the rapid evolution of the development landscape.
                </p>
            </div>
        </AnimatedSection>
    );
}
