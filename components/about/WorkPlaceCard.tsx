import Timeline, { TimelineEntry } from "@/components/about/Timeline";

const workExperience: TimelineEntry[] = [
    {
        title: "Full Stack Developer",
        org: "Raw Conscious",
        location: "Bangalore",
        period: "2022 — Present",
        description:
            "I am a Full Stack Developer at Raw Conscious, where I work on building modern web and mobile applications. I specialize in building responsive frontends to robust backend systems, and I focus on creating scalable solutions that combine performance with elegant user experiences.",
        logoPath: "/companies/raw-conscious.png",
    },
];

export default function WorkPlaceCard() {
    return <Timeline heading="Places I worked at" entries={workExperience} />;
}
