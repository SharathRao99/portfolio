import Card from "@/components/Card";
import SectionWrapper from "@/components/SectionWrapper";

interface ProjectStructureProps {
    title: string;
    description: string;
    keyContributions: string[];
    coreFeatures: string[];
}

export default function ProjectStructure({ 
    title, 
    description, 
    keyContributions, 
    coreFeatures 
}: ProjectStructureProps) {
    return (
        <SectionWrapper>
            <div className="container mx-auto">
                <Card>
                    <div className="flex flex-col items-center justify-between gap-4 md:gap-8">
                        <h2 className="text-2xl text-center md:text-left font-bold text-gray-800 dark:text-gray-100">
                            {title}
                        </h2>
                        <p className="text-gray-800 dark:text-gray-100">
                            {description}
                        </p>
                        
                        <div className="w-full space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Key Contributions</h3>
                                <ul className="mt-2 text-gray-700 dark:text-gray-200">
                                    {keyContributions.map((contribution, index) => (
                                        <li key={index} className="flex gap-2">
                                            <span className="min-w-[6px] h-[6px] mt-2 rounded-full bg-gray-500"></span>
                                            <span>{contribution}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="border-l-4 border-green-500 pl-4">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Core Features</h3>
                                <ul className="mt-2 text-gray-700 dark:text-gray-200">
                                    {coreFeatures.map((feature, index) => (
                                        <li key={index} className="flex gap-2">
                                            <span className="min-w-[6px] h-[6px] mt-2 rounded-full bg-gray-500"></span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </SectionWrapper>
    );
}