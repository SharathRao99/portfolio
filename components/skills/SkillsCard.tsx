import Link from "next/link";
import Image from "next/image";
import Card from "@/components/Card";
import SectionWrapper from "@/components/SectionWrapper";

interface Skill {
    name: string;
    src: string;
}

const skills: Skill[] = [
    { name: "React.js", src: '/icons/react.png' },
    { name: "Next.js", src: '/icons/next.png' },
    { name: "TypeScript", src: '/icons/typescript.png' },
    { name: "Node.js", src: '/icons/nodejs.png' },
    { name: "Firebase", src: '/icons/firebase.png' },
    { name: "Git", src: '/icons/git.png', },
    { name: "MySQL", src: '/icons/mysql.png' },
    { name: "PHP", src: '/icons/php.png' },
    { name: "Tailwind", src: '/icons/tailwind.png', },
];

export default function SkillsCard() {
    return (
        <SectionWrapper>
            <div className="container mx-auto">
                <Card>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-6">
                            <h2 className="text-2xl text-center md:text-left font-bold text-gray-800 dark:text-gray-100">
                                Crafting Digital Excellence
                            </h2>
                            <p className="text-gray-800 dark:text-gray-100">
                                I transform ideas into seamless digital experiences, specializing in building modern web and mobile applications. From responsive frontends to robust backend systems, I focus on creating scalable solutions that combine performance with elegant user experiences. My expertise spans across the entire development lifecycle, ensuring your projects are built with the latest industry best practices.
                            </p>
                            <Link href="/skills" className="w-max bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition-colors duration-300">
                                Stuff I&apos;m Good At
                            </Link>
                        </div>
                        <div className="w-full md:w-1/2 grid grid-cols-3 gap-8 p-4">
                            {skills.map((skill, index) => (
                                <div
                                    key={index}
                                    className="w-full h-full flex flex-col items-center justify-center group relative"
                                >
                                    <Image
                                        src={skill.src}
                                        alt={skill.name}
                                        width={100}
                                        height={100}
                                    />
                                    <span className="opacity-0 group-hover:opacity-100 absolute -bottom-6 text-sm text-gray-600 dark:text-gray-300 transition-opacity duration-300">
                                        {skill.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </SectionWrapper>
    );
}