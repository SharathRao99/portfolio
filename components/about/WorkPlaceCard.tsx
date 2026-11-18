import Timeline from "@/components/about/Timeline";
import { workExperience } from "@/lib/data";

export default function WorkPlaceCard() {
    return <Timeline heading="Places I worked at" entries={workExperience} />;
}
