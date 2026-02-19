import SkillsHero from "@/components/skills/Hero";
import SkillsStructure from "@/components/skills/SkillStructure";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Skills',
    description: 'Expertise in modern web technologies including React.js, Next.js, Node.js, TypeScript, and cloud services.',
    openGraph: {
        title: 'Skills & Expertise | Sharath B C',
        description: 'See my technical skills stack, from frontend frameworks to backend systems and databases.',
    },
};

import { skillsPageData } from "@/lib/data";

export default function SkillsPage() {
    return (
        <div>
            <SkillsHero />
            {skillsPageData.map((data, index) => (
                <div key={index} >
                    <SkillsStructure title={data.title} skillSets={data.skillSets} />
                </div>
            ))}
        </div>
    )
}