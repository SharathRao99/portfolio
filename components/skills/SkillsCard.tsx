"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Card from "@/components/Card";
import SectionWrapper from "@/components/SectionWrapper";

import { skillsCardData } from "@/lib/data";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function SkillsCard() {
    return (
        <SectionWrapper>
            <div className="container mx-auto">
                <Card>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-6">
                            <h2 className="text-2xl text-center md:text-left font-bold text-gray-800 dark:text-gray-100">
                                {skillsCardData.title}
                            </h2>
                            <p className="text-gray-800 dark:text-gray-100">
                                {skillsCardData.description}
                            </p>
                            <Link href={skillsCardData.ctaLink} className="w-max bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition-colors duration-300">
                                {skillsCardData.ctaText}
                            </Link>
                        </div>
                        <motion.div
                            className="w-full md:w-1/2 grid grid-cols-3 gap-8 p-4"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                        >
                            {skillsCardData.skills.map((skill, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
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
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </Card>
            </div>
        </SectionWrapper>
    );
}