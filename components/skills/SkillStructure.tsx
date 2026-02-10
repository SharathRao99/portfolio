"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Card from "@/components/Card";
import SectionWrapper from "@/components/SectionWrapper";

type skillSet = {
    name: string,
    image: string,
    rating: number,
};
type title = string;
type skillSets = skillSet[];
export default function SkillsStructure({ title, skillSets }: { title: title, skillSets: skillSets }) {

    const getProgressColor = (rating: number) => {
        if (rating >= 90) return "bg-green-600";
        if (rating >= 20) return "bg-yellow-500";
        return "bg-red-600";
    };

    return (
        <SectionWrapper>
            <div className="container mx-auto">
                <Card>
                    <div className="flex flex-col items-center justify-between gap-4 md:gap-8">
                        <h2 className="text-2xl text-center md:text-left font-bold text-gray-800 dark:text-gray-100">
                            {title}
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full mt-6">
                            {skillSets.map((skill: skillSet, index: number) => (
                                <div key={index} className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 flex items-center justify-center relative" title={skill.name}>
                                        <Image
                                            src={skill.image}
                                            alt={skill.name}
                                            width={100}
                                            height={100}
                                        />
                                    </div>
                                    <div className="w-3/4 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <motion.div
                                            className={`${getProgressColor(skill.rating)} h-2.5 rounded-full`}
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${skill.rating}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            viewport={{ once: true }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </SectionWrapper>
    );
}