import Card from "@/components/Card";
import SectionWrapper from "@/components/SectionWrapper";

export default function ProjectsHero() {
    return (
        <SectionWrapper>
            <div className="container mx-auto">
                <Card>
                    <div className="flex flex-col items-center justify-between gap-4 md:gap-8">
                        <h2 className="text-2xl text-center md:text-left font-bold text-gray-800 dark:text-gray-100">
                            Full-Stack Development Expertise
                        </h2>
                        <p className="text-gray-800 dark:text-gray-100 space-y-4">
                            As a versatile Full-Stack Developer, I specialize in crafting comprehensive digital solutions using modern technologies like React.js, Next.js, and Node.js. From building responsive front-end interfaces to implementing secure backend systems with authentication and payment integrations, I bring ideas to life through clean, efficient code. My experience spans web and mobile development, allowing me to deliver seamless experiences across all platforms.
                        </p>
                    </div>
                </Card>
            </div>
        </SectionWrapper>
    );
}