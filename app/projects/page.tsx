import ProjectsHero from "@/components/projects/Hero";
import ProjectStructure from "@/components/projects/ProjectStructure";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Projects',
    description: 'Explore my portfolio of projects including Recruitment Management Systems, Parental Control Apps, and E-commerce Platforms.',
    openGraph: {
        title: 'Projects | Sharath B C',
        description: 'Check out my latest work in Full Stack Development, featuring React, Next.js, and Node.js projects.',
    },
};

import { projectsPageData } from "@/lib/data";

export default function ProjectsPage() {
    return (
        <div>
            <ProjectsHero />
            {projectsPageData.map((project, index) => (
                <ProjectStructure
                    key={index}
                    title={project.title}
                    description={project.description}
                    keyContributions={project.keyContributions}
                    coreFeatures={project.coreFeatures}
                />
            ))}
        </div>
    );
}