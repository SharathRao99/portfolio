import Timeline, { TimelineEntry } from "@/components/about/Timeline";

const workExperience: TimelineEntry[] = [
    {
        title: "Full-Stack Developer",
        org: "Zibtek Custom Software Development Company",
        location: "Bangalore",
        period: "Mar 2026 — Present",
        logoPath: "/companies/zibtek.webp",
        logoOnLight: true,
        logoWide: true,
        description:
            "I build and maintain client products across React, Next.js, Node.js, Laravel and Python: Preach Together and Ask Heaven (a ZIP-targeted ad platform with an AI chatbot), Zack Academy (a learning and commerce marketplace) and SequiDocs3 (an employee-management and e-signature platform). Recognized with a Raising Star award for performance.",
    },
    {
        title: "Full-Stack Developer",
        org: "Raw Conscious",
        location: "Bangalore",
        period: "Feb 2023 — Feb 2026",
        description:
            "I built web and mobile products end to end: an AI-assisted cyber security and compliance SaaS with multi-tenant role-based access, background jobs and scheduled reports, and a parental control mobile app with parent and child apps. I also integrated payment gateways, authentication providers and AI SDKs, and improved performance by about 20% through rendering, image handling and API efficiency.",
        logoPath: "/companies/raw-conscious.png",
    },
];

export default function WorkPlaceCard() {
    return <Timeline heading="Places I worked at" entries={workExperience} />;
}
