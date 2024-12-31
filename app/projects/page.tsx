import ProjectsHero from "@/components/projects/Hero";
import ProjectStructure from "@/components/projects/ProjectStructure";

const projectsData = [
    {
        title: "Recruitment Management System",
        description: "Led the development of Recruitree, a comprehensive recruitment platform that streamlines the hiring process through dual-dashboard architecture. The system empowers applicants to showcase their portfolios and apply for positions while providing recruiters with powerful tools for job posting and candidate evaluation.",
        keyContributions: [
            "Architected and implemented dual dashboard interfaces using React and Tailwind CSS",
            "Developed a dynamic skills dataset that evolves with application data",
            "Integrated Cognito Hosted UI for secure authentication",
            "Built robust backend infrastructure using PHP and WordPress"
        ],
        coreFeatures: [
            "Portfolio creation and management",
            "Advanced job search and application system",
            "Comprehensive application review tools",
            "Keyboard shortcuts for efficient navigation"
        ]
    },
    {
        title: "Monarch AI - Parental Control App",
        description: "Developed Monarch AI, a comprehensive parental control mobile application featuring dual-app architecture (parent and child apps). The solution enables parents to monitor and manage their child's device usage through real-time tracking and control mechanisms.",
        keyContributions: [
            "Designed and implemented intuitive UI/UX for both parent and child applications using React Native",
            "Integrated Firebase services for authentication, real-time notifications, and data synchronization",
            "Developed middleware API using Node.js and Express for seamless communication",
            "Implemented Prisma ORM with MySQL for efficient data management and retrieval",
            "Created real-time location tracking and app usage monitoring systems"
        ],
        coreFeatures: [
            "App usage limits and blocking capabilities",
            "Website URL blocking and content restriction",
            "Real-time location tracking and monitoring",
            "Detailed app usage metrics and analytics",
            "In-app notifications for usage alerts",
            "Cross-device data synchronization"
        ]
    },
    {
        title: "Digital Commerce Platform",
        description: "Developed an experimental e-commerce platform with a headless architecture, focusing on delivering a simplified checkout experience. The platform combines modern technologies to create a user-friendly solution comparable to established e-commerce platforms while maintaining flexibility and scalability.",
        keyContributions: [
            "Built the entire frontend interface using Next.js and Tailwind CSS",
            "Implemented headless architecture for improved scalability and maintenance",
            "Integrated Cashfree payment gateway for secure transactions",
            "Designed and developed an intuitive user interface focused on conversion",
            "Maintained continuous development and feature improvements"
        ],
        coreFeatures: [
            "Streamlined checkout process",
            "User-friendly authentication system",
            "Integrated payment processing with Cashfree",
            "Scalable headless architecture",
            "Responsive and modern design"
        ]
    }
];

export default function ProjectsPage() {
    return (
        <div>
            <ProjectsHero />
            {projectsData.map((project, index) => (
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