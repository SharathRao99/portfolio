import Timeline, { TimelineEntry } from "@/components/about/Timeline";

const education: TimelineEntry[] = [
    {
        title: "MCA",
        org: "Bangalore University",
        location: "Bangalore",
        period: "2020 — 2022",
        description: "Completed Master of Computer Applications with First Class Examplary (8.02 CGPA)",
        logoPath: "/institutes/bengaluru-university.png",
        logoOnLight: true,
    },
    {
        title: "BCA",
        org: "St. Aloysius College",
        location: "Mangaluru",
        period: "2017 — 2020",
        description: "Completed Bachelor of Computer Applications with First Class (6.56 CGPA)",
        logoPath: "/institutes/st-aloysius.png",
        logoOnLight: true,
    },
];

export default function EducationCard() {
    return <Timeline heading="Education" entries={education} />;
}
