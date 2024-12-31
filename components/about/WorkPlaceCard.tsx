import Image from "next/image";
import Card from "@/components/Card";
import SectionWrapper from "@/components/SectionWrapper";

interface WorkExperience {
    title: string;
    company: string;
    location: string;
    period: string;
    description: string;
    logoPath: string;
}

const workExperience: WorkExperience[] = [
    {
        title: "Full Stack Developer",
        company: "Raw Conscious",
        location: "Bangalore",
        period: "2022 - Present.",
        description: "I am a Full Stack Developer at Raw Conscious, where I work on building modern web and mobile applications. I specialize in building responsive frontends to robust backend systems, and I focus on creating scalable solutions that combine performance with elegant user experiences.",
        logoPath: "/companies/raw-conscious.png"
    }
];

export default function WorkPlaceCard() {
    return (
        <SectionWrapper>
            <div className="container mx-auto">
                <Card>
                    <div className="w-full h-full flex flex-col items-center justify-center gap-8">
                        <h2 className="text-2xl text-center md:text-left font-bold text-gray-800 dark:text-gray-100">
                            Places I worked at
                        </h2>
                        {workExperience.map((workExperience, index) => (
                            <div className="w-full flex gap-6" key={index}>
                                <div className="hidden md:block max-w-max w-[200px] h-[200px]">
                                    <Image
                                        src={workExperience.logoPath}
                                        alt={workExperience.company}
                                        width={200}
                                        height={200}
                                        className="rounded-full w-full h-auto"
                                    />
                                </div>
                                <div className="flex flex-col gap-px">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                        {workExperience.title}
                                    </h3>
                                    <p className="flex flex-wrap text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold">
                                            {workExperience.company}, &nbsp;
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            INC; {workExperience.location}, &nbsp;
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {workExperience.period}
                                        </span>
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {workExperience.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </SectionWrapper>
    );
}
