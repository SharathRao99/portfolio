import ProjectsHero from "@/components/projects/Hero";
import ProjectStructure from "@/components/projects/ProjectStructure";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Projects',
    description: 'Explore my portfolio of projects including a donor-funded ad platform, a learning and commerce marketplace, an e-signature document platform, and personal projects in AI video generation and hiring/HR.',
    alternates: { canonical: '/projects' },
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
                <ProjectStructure key={project.title} index={index} {...project} />
            ))}
            {/* breathing room so the last stacked card can scroll clear */}
            <div className="h-16 md:h-24" />
        </div>
    );
}