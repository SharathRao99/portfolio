import Timeline from "@/components/about/Timeline";
import { education } from "@/lib/data";

export default function EducationCard() {
    return <Timeline heading="Education" entries={education} />;
}
