import AnimatedSection from "@/components/motion/AnimatedSection";
import RevealText from "@/components/motion/RevealText";
import GhostWord from "@/components/motion/GhostWord";

const stats = [
    { value: "20+", label: "Products shipped" },
    { value: "3+", label: "Years of experience" },
    { value: "Web & Mobile", label: "End to end" },
];

export default function ProjectsHero() {
    return (
        <AnimatedSection className="relative py-10 md:py-16">
            <GhostWord word="Work" />
            <div className="container">
                <p className="eyebrow mb-5">Projects</p>
                <RevealText
                    as="h1"
                    text="Full-Stack Development Expertise"
                    className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
                />
                <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
                    As a versatile Full-Stack Developer, I specialize in crafting comprehensive digital solutions using modern technologies like React.js, Next.js, and Node.js. From building responsive front-end interfaces to implementing secure backend systems with authentication and payment integrations, I bring ideas to life through clean, efficient code. My experience spans web and mobile development, allowing me to deliver seamless experiences across all platforms.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="glass-light rounded-2xl px-5 py-4">
                            <p className="text-xl font-black leading-none text-gradient md:text-2xl">{stat.value}</p>
                            <p className="mt-1.5 text-[11px] font-medium uppercase tracking-widest text-muted">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                <p className="mt-8 text-sm text-muted">
                    Below are three of the most complex systems I&apos;ve built end-to-end.
                </p>
            </div>
        </AnimatedSection>
    );
}
