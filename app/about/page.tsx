import WorkPlaceCard from "@/components/about/WorkPlaceCard";
import AboutCard from "@/components/about/AboutCard";
import EducationCard from "@/components/about/EducationCard";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Me',
    description: 'Learn more about Sharath B C, a passionate Full Stack Developer with expertise in React, Next.js, and modern web technologies.',
    openGraph: {
        title: 'About Me | Sharath B C',
        description: 'Discover my journey, experience, and education as a Full Stack Developer.',
    },
};

export default function About() {
    return (
        <>
            <AboutCard />
            <WorkPlaceCard />
            <EducationCard />
        </>
    )
}