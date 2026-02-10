import ProjectsHero from "@/components/projects/Hero";
import ProjectStructure from "@/components/projects/ProjectStructure";

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