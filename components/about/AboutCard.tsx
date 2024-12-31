import Card from "@/components/Card";
import SectionWrapper from "@/components/SectionWrapper";

export default function AboutCard() {
    return (
        <SectionWrapper>
            <div className="container mx-auto">
                <Card>
                    <div className="flex flex-col items-center justify-between gap-8">

                        <h2 className="text-2xl text-center md:text-left font-bold text-gray-800 dark:text-gray-100">
                            About Me
                        </h2>
                        <p className="text-gray-800 dark:text-gray-100 space-y-4">
                            <span className="block">
                                My journey in software development began with a fascination for creating digital solutions that make a real difference. As a Full-Stack Developer, I&apos;ve spent the last 2 years turning complex problems into elegant solutions, working across the entire development spectrum from intuitive user interfaces to robust backend systems. I&apos;m driven by the endless possibilities that technology offers and the rapid evolution of the development landscape.
                            </span>
                            <span className="block mt-4">
                                What excites me most about this industry is the opportunity to blend creativity with technical precision. Whether I&apos;m architecting database solutions, implementing secure payment systems, or crafting seamless user experiences, I approach each project as a chance to innovate and excel. I believe in writing code that not only works but stands the test of time, focusing on maintainability and scalability in everything I build.
                            </span>
                        </p>
                    </div>
                </Card>
            </div>
        </SectionWrapper>
    );
}