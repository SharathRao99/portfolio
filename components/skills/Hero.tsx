import Card from "@/components/Card";
import SectionWrapper from "@/components/SectionWrapper";

export default function SkillsHero() {
    return (
        <SectionWrapper>
            <div className="container mx-auto">
                <Card>
                    <div className="flex flex-col items-center justify-between gap-4 md:gap-8">

                        <h2 className="text-2xl text-center md:text-left font-bold text-gray-800 dark:text-gray-100">
                            Things I&apos;m Good At
                        </h2>
                        <p className="text-gray-800 dark:text-gray-100 space-y-4">
                            I&apos;ve spent the last 2 years turning complex problems into elegant solutions, working across the entire development spectrum from intuitive user interfaces to robust backend systems. I&apos;m driven by the endless possibilities that technology offers and the rapid evolution of the development landscape.
                        </p>
                    </div>
                </Card>
            </div>
        </SectionWrapper>
    );
}