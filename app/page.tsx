
import Hero from "@/components/Hero";
import SkillsCard from "@/components/skills/SkillsCard";
import ProjectCard from "@/components/projects/ProjectCard";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  description: 'Welcome to the portfolio of Sharath B C, a Full Stack Developer specializing in building exceptional digital experiences.',
  openGraph: {
    title: 'Sharath B C | Full Stack Developer',
    description: 'Explore my latest projects, technical skills, and professional journey.',
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <SkillsCard />
      <ProjectCard />
    </>
  );
}