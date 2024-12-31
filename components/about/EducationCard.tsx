import Image from "next/image";
import Card from "@/components/Card";
import SectionWrapper from "@/components/SectionWrapper";

interface Education {
    title: string;
    institute: string;
    location: string;
    period: string;
    description: string;
    logoPath: string;
}

const education: Education[] = [
    {
        title: "MCA",
        institute: "Bangalore University",
        location: "Bangalore",
        period: "2020 - 2022.",
        description: "Completed Master of Computer Applications with First Class Examplary (8.02 CGPA)",
        logoPath: "/institutes/bengaluru-university.png"
    },
    {
        title: "BCA",
        institute: "St. Aloysius College",
        location: "Mangaluru",
        period: "2017 - 2020.",
        description: "Completed Bachelor of Computer Applications with First Class (6.56 CGPA)",
        logoPath: "/institutes/st-aloysius.png"
    }
];

export default function EducationCard() {
    return (
        <SectionWrapper>
            <div className="container mx-auto">
                <Card>
                    <div className="w-full h-full flex flex-col items-center justify-center gap-8">
                        <h2 className="text-2xl text-center md:text-left font-bold text-gray-800 dark:text-gray-100">
                            Education
                        </h2>
                        {education.map((education: Education, index: number) => (
                            <div className="w-full flex gap-6" key={index}>
                                <div className="hidden md:block w-[150px] p-2 h-auto border border-gray-200 dark:border-gray-800 rounded-lg bg-white">
                                    <Image
                                        src={education.logoPath}
                                        alt={education.institute}
                                        width={200}
                                        height={200}
                                        className="rounded-full w-full h-auto"
                                    />
                                </div>
                                <div className="flex flex-col gap-px">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                        {education.title}
                                    </h3>
                                    <p className="flex flex-wrap text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold">
                                            {education.institute}, &nbsp;
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {education.location}, &nbsp;
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {education.period}
                                        </span>
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {education.description}
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
