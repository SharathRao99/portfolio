import SkillsHero from "@/components/skills/Hero";
import SkillsStructure from "@/components/skills/SkillStructure";

const skillsData = [
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
            { name: 'Cashfree', image: '/icons/cashfree.png', rating: 85},
            { name: 'Stripe', image: '/icons/stripe.png', rating: 75},
        ]
    }

]

export default function SkillsPage() {
    return (
        <div>
            <SkillsHero />
            {skillsData.map((data, index) => (
                <div key={index} >
                    <SkillsStructure title={data.title} skillSets={data.skillSets} />
                </div>
            ))}
        </div>
    )
}