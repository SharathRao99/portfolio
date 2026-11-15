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
    description: "Full-Stack Developer with 3+ years of experience turning business requirements into production software, from planning and architecture through to delivery. I work across React, Next.js, Node.js and Python, with depth in payment and booking systems, multi-tenant platforms with role-based access, document and e-signature workflows, and AI-integrated features.",
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
        { name: "Git", src: '/icons/git.png', },
        { name: "MySQL", src: '/icons/mysql.png' },
        { name: "MongoDB", src: '/icons/mongodb.png' },
        { name: "PHP", src: '/icons/php.png' },
        { name: "Tailwind", src: '/icons/tailwind.png', },
    ]
};

export const projectsCardData = {
    title: "Featured Projects",
    description: "Passionate about crafting innovative solutions using modern technologies like React.js, Next.js, Node.js, and cloud services. Specialized in developing scalable, user-centric applications with robust architectures and intuitive interfaces. My work includes a donor-funded ad platform with an AI chatbot (Preach Together), a learning and commerce marketplace (Zack Academy), an e-signature document platform (SequiDocs3), and personal projects like Crewdesk, a multi-company hiring and HR platform, and a resumable AI video pipeline.",
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
                { name: "Express.js", mark: "Ex", rating: 85 },
                { name: "FastAPI", mark: "FA", rating: 80 },
                { name: "Zustand", mark: "Zu", rating: 80 },
                { name: "Tailwind", image: '/icons/tailwind.png', rating: 90 },
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
                { name: "Python", image: '/icons/python.png', rating: 85 },
                { name: "SQL", image: '/icons/mysql.png', rating: 90 },
            ]
    },
    {
        title: "State, Data & Forms",
        skillSets: [
            { name: "TanStack Query", mark: "TQ", rating: 85 },
            { name: "React Hook Form", mark: "RHF", rating: 85 },
            { name: "Zod", mark: "Zod", rating: 85 },
            { name: "Redux", image: '/icons/redux.png', rating: 80 },
        ]
    },
    {
        title: "AI & Integrations",
        skillSets: [
            { name: "OpenAI API", mark: "AI", rating: 80 },
            { name: "Gemini", mark: "Gem", rating: 70 },
            { name: "Google Ads & GA4", mark: "GA", rating: 70 },
            { name: "PostHog", mark: "PH", rating: 70 },
        ]
    },
    {
        title: "Testing",
        skillSets: [
            { name: "Playwright", mark: "Pw", rating: 75 },
            { name: "Vitest / Jest", mark: "Vt", rating: 75 },
            { name: "pytest", mark: "Py", rating: 70 },
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
        title: "Databases",
        skillSets: [
            { name: "MySQL", image: '/icons/mysql.png', rating: 90 },
            { name: "MongoDB", image: '/icons/mongodb.png', rating: 85 },
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
            { name: 'Authorize.Net', mark: 'AN', rating: 75 },
        ]
    }
];

export interface ProjectData {
    title: string;
    category: "Zibtek" | "Personal" | "Raw Conscious";
    description: string;
    /** Shown as a small badge, e.g. when the project was a team effort. */
    note?: string;
    stack: string[];
    keyContributions: string[];
    coreFeatures: string[];
    link?: { label: string; href: string };
}

export const projectsPageData: ProjectData[] = [
    // ---------------------------------------------------------------- Zibtek
    {
        title: "Preach Together & Ask Heaven",
        category: "Zibtek",
        note: "Team project: my contributions are listed below",
        description: "A donor-funded, ZIP-targeted gospel ad platform for the Latter-day Saints community in North America, built for a client at Zibtek. Donors fund ad themes in their ZIP codes, the platform runs the campaigns and routes the resulting leads, and Ask Heaven is a public AI chatbot that answers from an approved library of scripture. The system spans an admin app, a marketing site, a Node.js backend and a Python AI service. I took ownership of the live platform and shipped fixes within my first two weeks.",
        stack: ["React 19", "TypeScript", "Vite", "Node.js", "Express", "MongoDB", "FastAPI", "OpenAI", "Stripe", "Google Ads", "GA4"],
        keyContributions: [
            "Fixed lead routing that ignored the clicked ad theme and sent leads to the wrong donor in the same ZIP. It now rotates only among donors who funded that theme, with a support-email fallback, and keeps the clicked theme on the record for accurate attribution",
            "Fixed the AI narration pipeline that silently dropped sentences and scripture references on long requests: chunking at about 1,500 characters, transcription-based verification, up to 3 retries and chunk caching, covered by 46 tests",
            "Cut mobile LCP from about 4.1s to 2.3s (Lighthouse 75-81 to 95-97 in local tests) by inlining critical CSS with a custom Vite plugin, plus immutable asset caching for repeat visits",
            "Built static meta-title generation for the client-side-rendered Vite marketing site to improve SEO, and fixed further production bugs"
        ],
        coreFeatures: [
            "Admin dashboard for donors, campaigns, donations and lead management",
            "ZIP-code and theme based ad targeting with Google Ads and GA4 reporting",
            "Stripe-powered donations",
            "Ask Heaven: a retrieval-augmented chatbot with guardrails, rate limiting and signed sessions",
            "AI ad copy plus image and video generation running as background jobs"
        ]
    },
    {
        title: "Zack Academy",
        category: "Zibtek",
        note: "Team project: frontend only",
        description: "A learning and commerce platform, billed as North America's largest vocational training marketplace, where people find and book classes and administrators run events, venues, attendees and attendance. I worked on the frontend of both the admin (EMS) app and the public marketing site, and wrote tooling to protect the site's SEO during the migration.",
        stack: ["Next.js", "TypeScript", "Tailwind", "Zustand", "TanStack Query", "Zod", "Authorize.Net", "WebMCP", "Python"],
        keyContributions: [
            "Found that checkout pricing and totals were calculated and stored client-side in localStorage. Proposed and implemented an architecture where all payment and pricing logic runs on the backend and the frontend only renders server data",
            "Added stock handling, booking concurrency control and a slot-reservation system that holds a slot for 20 minutes during checkout",
            "Modernized the legacy Next.js frontend with TanStack Query, strict Zod validation and better error handling, and flagged missing admin authorization and predictable resource IDs to the backend team",
            "Improved semantic HTML, SEO structure and layout shift, and implemented WebMCP tools for event discovery, location search and cart operations",
            "Wrote a Python SEO crawler and diff tool that compares the old and new sites page by page (titles, meta descriptions, H1s, canonicals, redirects) to verify the migration"
        ],
        coreFeatures: [
            "Class search and event discovery with location search",
            "Cart and checkout with Authorize.Net payments",
            "Admin app for events, venues, attendees, attendance and coupons",
            "Role-based access in the admin app",
            "Marketing site with certification landing pages and FAQs"
        ]
    },
    {
        title: "SequiDocs3",
        category: "Zibtek",
        note: "Team project: frontend lead, plus backend fixes",
        description: "The new V3 modules of an existing, complete employee-management platform in the vein of Workday, built for an enterprise client. V3 adds employee hiring and document preparation: building documents and templates, sending them out, and collecting legally binding signatures. I owned frontend delivery, then stepped into the Laravel backend when the signing flow needed rescuing. The project has since been retired.",
        stack: ["React", "Redux", "Bootstrap", "Tiptap", "PostHog", "Laravel 12"],
        keyContributions: [
            "Built the V3 routing and a controlled V2/V3 rollout using PostHog feature flags: when a flag is on users see V3, otherwise V2 behaves exactly as before",
            "Built the document editor on Tiptap: fonts and rich text, drag-and-drop blocks (text, lists, images, tables, page breaks), fillable fields, PDF rendering, automatic pagination with headers and footers, and page deletion. The client themselves called it genuinely complex and budgeted 180 days of post-launch maintenance for it",
            "Built document signing with field-level permissions, so each signer can only fill their own assigned fields, and a signature modal supporting styled text, drawn signatures and image upload",
            "Diagnosed the failing sequential signing flow (the second signer is emailed only after the first has signed) as a backend architecture problem and a frontend/backend contract mismatch, then fixed validation gaps in Laravel 12",
            "Refactored the document and template delivery modules, adding complete sent and completed history for documents and template bundles, with resend and withdraw for anything not yet completed",
            "Wrote frontend and backend unit tests and shipped everything through the client's engineering code review"
        ],
        coreFeatures: [
            "Document viewer, editor and send flow",
            "Fillable fields: signature, text, checklist, date, radio and drop-down",
            "Sequential multi-signer signing, up to five signers per document",
            "Template bundles, sent history, resend and withdraw",
            "Admin and standard preview modes, where standard users can only preview and send"
        ]
    },
    // -------------------------------------------------------------- Personal
    {
        title: "Crewdesk",
        category: "Personal",
        description: "A multi-company platform that bundles two everyday jobs: Hiring, which sources developers from public GitHub data and scores them against open roles, and People, which runs employee records, leave and work from home. Every company gets its own isolated data and its own rules. It is a personal project: a FastAPI backend with a separate Next.js web app.",
        stack: ["Next.js", "TypeScript", "TanStack Query", "shadcn/ui", "FastAPI", "MongoDB", "Playwright"],
        link: { label: "View the API on GitHub", href: "https://github.com/SharathRao99/crewdesk-api" },
        keyContributions: [
            "Designed multi-tenancy with an isolated MongoDB database per company and role-based access for admin, HR, recruiter, manager and employee",
            "Built the Hiring module: resumable sourcing jobs over public GitHub data, scored by per-role YAML rules, with a role builder, candidate screening, status history and email templates",
            "Built the People module: employee records, company policy, leave types, holidays, balances, work-from-home requests, manager approvals and CSV or Excel exports",
            "Hardened security with Argon2 password hashing, login lockout, session versioning, single-use employee setup links and data anonymisation",
            "Backed it with 289 API test functions and 17 Playwright end-to-end specs"
        ],
        coreFeatures: [
            "Per-role candidate scoring with configurable rules",
            "Leave, work-from-home and balance management with approvals",
            "Employee self-service via one-time setup links",
            "Installable PWA with phone, tablet and desktop layouts",
            "Light and dark themes with per-user avatars"
        ]
    },
    {
        title: "AI Media Pipeline",
        category: "Personal",
        description: "A generic, resumable pipeline for AI video and audio generation. Long outputs are built from small scenes, so any single piece can be retried, regenerated or reviewed without redoing the rest. Describe a video in a manifest and the pipeline produces keyframes, narration and clips, then assembles the final video with ffmpeg.",
        stack: ["Python", "ffmpeg", "OpenAI", "Gemini"],
        keyContributions: [
            "Designed a manifest-driven architecture: a new video type is a new project folder, with no code changes",
            "Made every run resumable: progress is saved after each scene, re-runs skip finished work and retry only failures, with backoff",
            "Built a provider-agnostic layer where image, narration and video providers (OpenAI, Gemini, macOS voices, free offline mocks) are swapped by config, with usage totalled per run",
            "Made stages pluggable and added a script command that drafts scenes with an LLM"
        ],
        coreFeatures: [
            "Pipeline: keyframes, narration, clips, ffmpeg assembly",
            "Review keyframes before spending on video generation",
            "Regenerate a single scene without touching the rest",
            "Offline mock providers for free testing"
        ]
    },
    // ---------------------------------------------------------- Raw Conscious
    {
        title: "Cyber Security & Compliance SaaS",
        category: "Raw Conscious",
        description: "An AI-assisted platform that helps organizations work through NIS2 Article 21 and ISO 27001 requirements. It covers the policy lifecycle, threat intelligence and dynamic reporting, serving administrators, partners and enterprise users from one multi-tenant system.",
        stack: ["Node.js", "Express", "MongoDB", "Vercel AI SDK", "Agenda", "AWS S3"],
        keyContributions: [
            "Designed the multi-tenant architecture with role-based access for administrators, partners and enterprise users",
            "Built AI-assisted compliance workflows for NIS2 Article 21 and ISO 27001, including policy lifecycle management",
            "Added Agenda background jobs for leaked-credential intelligence and credit-based data workflows",
            "Built scheduled PDF report generation with storage on AWS S3"
        ],
        coreFeatures: [
            "NIS2 Article 21 and ISO 27001 compliance workflows",
            "Policy lifecycle management",
            "Threat and leaked-credential intelligence",
            "Dynamic and scheduled PDF reporting",
            "Separate experiences for administrators, partners and enterprises"
        ]
    },
    {
        title: "Recruitment Management System",
        category: "Raw Conscious",
        stack: ["React", "Tailwind CSS", "PHP", "WordPress", "AWS Cognito"],
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
        category: "Raw Conscious",
        stack: ["React Native", "Node.js", "Express", "Prisma", "MySQL", "Firebase"],
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
        category: "Raw Conscious",
        stack: ["Next.js", "Tailwind CSS", "Cashfree"],
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
