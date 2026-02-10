import SkillsHero from "@/components/skills/Hero";
import SkillsStructure from "@/components/skills/SkillStructure";

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