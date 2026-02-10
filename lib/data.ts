export const personalInfo = {
    name: "Sharath B C",
    email: "sharath.byadagodu@outlook.com",
    resumeLink: "/data/Resume_Sharath_B_C.pdf",
    contactLink: "mailto:sharath.byadagodu@outlook.com",
};

export const navData = {
    contactText: "Contact Me",
    downloadResumeText: "Download Resume",
};

export const heroData = {
    title: "Hello, Know me better",
    description: "Full-Stack Developer with 3+ years of hands-on experience in frontend, backend, and mobile app development. Proficient in modern technologies including React.js, Next.js, Node.js, Express.js, React Native, SQL, and NoSQL databases. Experienced in implementing authentication systems and payment gateways. Demonstrated ability to deliver end-to-end solutions while maintaining clean code practices.",
    ctaText: "Know More",
    ctaLink: "/about",
};

export const skillsCardData = {
    title: "Crafting Digital Excellence",
    description: "I transform ideas into seamless digital experiences, specializing in building modern web and mobile applications. From responsive frontends to robust backend systems, I focus on creating scalable solutions that combine performance with elegant user experiences. My expertise spans across the entire development lifecycle, ensuring your projects are built with the latest industry best practices.",
    ctaText: "Stuff I'm Good At",
    ctaLink: "/skills",
    skills: [
        { name: "React.js", src: '/icons/react.png' },
        { name: "Next.js", src: '/icons/next.png' },
        { name: "TypeScript", src: '/icons/typescript.png' },
        { name: "Node.js", src: '/icons/nodejs.png' },
        { name: "Firebase", src: '/icons/firebase.png' },
        { name: "Git", src: '/icons/git.png', },
        { name: "MySQL", src: '/icons/mysql.png' },
        { name: "PHP", src: '/icons/php.png' },
        { name: "Tailwind", src: '/icons/tailwind.png', },
    ]
};

export const projectsCardData = {
    title: "Featured Projects",
    description: "Passionate about crafting innovative solutions using modern technologies like React.js, Next.js, Node.js, and cloud services. Specialized in developing scalable, user-centric applications with robust architectures and intuitive interfaces. My portfolio includes major projects such as a comprehensive Recruitment Management System, a feature-rich Digital Commerce Platform, and an advanced Parenting Control App.",
    ctaText: "View Projects",
    ctaLink: "/projects",
};

export const skillsPageData = [
    {
        title: "Frameworks and Libraries",
        skillSets:
            [
                { name: "React", image: '/icons/react.png', rating: 90 },
                { name: "Next.js", image: '/icons/next.png', rating: 90 },
                { name: "React Native", image: '/icons/react-native.png', rating: 75 },
                { name: "Node.js", image: '/icons/nodejs.png', rating: 85 },
                { name: "Redux", image: '/icons/redux.png', rating: 65 },
                { name: "Tailwind", image: '/icons/tailwind.png', rating: 90 },
                { name: "Bootstrap", image: '/icons/bootstrap.png', rating: 60 },
            ]
    },
    {
        title: 'Programming Languages',
        skillSets:
            [
                { name: "JavaScript", image: '/icons/javascript.png', rating: 90 },
                { name: "TypeScript", image: '/icons/typescript.png', rating: 80 },
                { name: "PHP", image: '/icons/php.png', rating: 90 },
                { name: "Java", image: '/icons/java.png', rating: 70 },
                { name: "Python", image: '/icons/python.png', rating: 60 },
                { name: "SQL", image: '/icons/mysql.png', rating: 90 },
            ]
    },
    {
        title: "Markup Languages",
        skillSets: [
            { name: "HTML5", image: '/icons/html5.png', rating: 90 }
        ]
    },
    {
        title: "Stylesheet Languages",
        skillSets: [
            { name: "CSS3", image: '/icons/css3.png', rating: 85 },
        ]
    },
    {
        title: "Version Control",
        skillSets: [
            { name: "Git", image: '/icons/git.png', rating: 85 },
        ]
    },
    {
        title: "Cloud",
        skillSets: [
            { name: "AWS", image: '/icons/aws.png', rating: 70 },
            { name: "Firebase", image: '/icons/firebase.png', rating: 75 },
            { name: "Digital Occean", image: '/icons/digital-occean.png', rating: 70 },
        ]
    },
    {
        title: "Payment Gateways",
        skillSets: [
            { name: 'Cashfree', image: '/icons/cashfree.png', rating: 85 },
            { name: 'Stripe', image: '/icons/stripe.png', rating: 75 },
        ]
    }
];

export const projectsPageData = [
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
