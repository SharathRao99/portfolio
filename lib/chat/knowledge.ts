import {
    education,
    heroData,
    personalInfo,
    projectsPageData,
    skillsPageData,
    workExperience,
} from "@/lib/data";

/**
 * The chatbot's single source of truth. Every fact it can state is built here,
 * from the same data that drives the site (lib/data.ts), plus the recruiter
 * facts below. The retrieval fallback answers from these chunks directly and
 * the fine-tuned model is given the top chunks as its only allowed context,
 * so editing lib/data.ts changes the bot's answers with no retraining.
 *
 * Each chunk's `text` is written as a ready-to-read answer in third person.
 */
export interface Chunk {
    id: string;
    topic: string;
    /** Extra words people use for this topic; matched but not shown. */
    keywords: string;
    text: string;
}

/** Facts only Sharath can state. Edit here, never guess elsewhere. */
export const recruiterFacts = {
    salary: "Sharath's expected salary is 15 LPA (₹15 lakhs per annum), and it is negotiable.",
    workMode:
        "Sharath is open to both remote and on-site roles. For on-site roles he prefers a hybrid arrangement.",
    notice: "Sharath's notice period is 1 month, and it is negotiable.",
    relocation:
        "Sharath is based in Bengaluru and is only open to relocating within Bengaluru, so on-site or hybrid roles need to be in Bengaluru. Fully remote roles work too.",
    contact: `The best way to reach Sharath is by email at ${personalInfo.email}. His resume can be downloaded with the "Download Resume" button in the site header.`,
    location: "Sharath is currently based in Bengaluru, India.",
    links: "Sharath's LinkedIn is https://www.linkedin.com/in/sharath-b-c-45ba01203 and his GitHub is https://github.com/SharathRao99.",
} as const;

const list = (items: string[]) => items.join("; ");

/**
 * The site copy is first person ("I built..."). The bot speaks about Sharath
 * in third person, so convert. Covers the phrasings present in lib/data.ts;
 * anything unusual just stays as written, which is still correct, only less polished.
 */
export function thirdPerson(text: string): string {
    return text
        .replace(/\bI build and maintain\b/g, "Sharath builds and maintains")
        .replace(/\bI've\b/g, "Sharath has")
        .replace(/\bI'm\b/g, "Sharath is")
        .replace(/\bI\b/g, "Sharath")
        .replace(/\bmy\b/gi, "his");
}

function buildChunks(): Chunk[] {
    const chunks: Chunk[] = [];

    // ---- recruiter facts (short, exact, answer-ready) ----
    chunks.push(
        {
            id: "salary",
            topic: "Salary expectation",
            keywords: "salary ctc compensation pay package expected expectation lpa lakhs money remuneration offer budget",
            text: recruiterFacts.salary,
        },
        {
            id: "work-mode",
            topic: "Remote, hybrid or on-site",
            keywords: "remote hybrid onsite on-site office wfh work from home arrangement mode flexible",
            text: recruiterFacts.workMode,
        },
        {
            id: "notice",
            topic: "Notice period",
            keywords: "notice period join joining start available availability when how soon immediate resign serve",
            text: recruiterFacts.notice,
        },
        {
            id: "location",
            topic: "Current location",
            keywords: "current currently location located based live lives living city where reside residence stay town place bengaluru bangalore india",
            text: recruiterFacts.location,
        },
        {
            id: "relocation",
            topic: "Relocation",
            keywords: "relocate relocation relocating move shift travel outside open willing other cities abroad bengaluru bangalore",
            text: recruiterFacts.relocation,
        },
        {
            id: "contact",
            topic: "Contact and resume",
            keywords: "contact email mail reach phone number call resume cv download hire interview schedule talk",
            text: recruiterFacts.contact,
        },
        {
            id: "links",
            topic: "LinkedIn and GitHub",
            keywords: "linkedin github profile profiles link links url social network repositories repos code open source portfolio",
            text: recruiterFacts.links,
        }
    );

    // ---- profile ----
    chunks.push({
        id: "profile",
        topic: "Summary",
        keywords: "who about summary introduce yourself tell me overview experience years profile background",
        text: `${personalInfo.name} is a Full-Stack Developer based in Bengaluru. ${heroData.description}`,
    });

    // ---- work history ----
    for (const job of workExperience) {
        const ongoing = /present/i.test(job.period);
        chunks.push({
            id: `work-${job.org.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            topic: `Work at ${job.org}`,
            keywords: `work job company employer role position worked ${ongoing ? "current currently now present" : "previous past earlier former"} experience ${job.org}`,
            text: `${job.title} at ${job.org} (${job.location}), ${job.period}. ${thirdPerson(job.description)}`,
        });
    }
    const current = workExperience.find((j) => /present/i.test(j.period));
    if (current) {
        chunks.push({
            id: "current-role",
            topic: "Current role",
            keywords: "current currently now present role job company working employer",
            text: `Sharath currently works as a ${current.title} at ${current.org} in ${current.location}, since ${current.period.split("—")[0].trim()}.`,
        });
    }

    // ---- projects ----
    for (const p of projectsPageData) {
        const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const where = p.category === "Personal" ? "a personal project" : `a project at ${p.category}`;
        chunks.push({
            id: `project-${slug}`,
            topic: p.title,
            keywords: `project ${p.title} ${p.category} ${p.stack.join(" ")} built portfolio work company employer`,
            text:
                `${p.title} is ${where}${p.note ? ` (${p.note.replace(/^Team project:\s*/i, "team project, ").replace(/,?\s*my contributions are listed below/i, "")})` : ""}. ` +
                `${thirdPerson(p.description)} Tech: ${p.stack.join(", ")}.`,
        });
        chunks.push({
            id: `project-${slug}-contrib`,
            topic: `${p.title}: Sharath's contributions`,
            keywords: `${p.title} contribution contributions did responsible achievements impact results features built`,
            text: `On ${p.title}, Sharath's contributions: ${list(p.keyContributions.map(thirdPerson))}. Core features: ${list(p.coreFeatures)}.`,
        });
    }

    // ---- skills ----
    for (const group of skillsPageData) {
        const names = group.skillSets.map((s) => `${s.name} (${s.rating}/100)`).join(", ");
        chunks.push({
            id: `skills-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            topic: `Skills: ${group.title}`,
            keywords: `skill skills know knowledge proficient proficiency experience expertise stack tech technology ${group.title} ${group.skillSets
                .map((s) => s.name)
                .join(" ")}`,
            text: `${group.title}: ${names}. Ratings are Sharath's own self-assessment out of 100.`,
        });
    }

    // ---- education ----
    for (const e of education) {
        chunks.push({
            id: `education-${e.title.toLowerCase()}`,
            topic: `Education: ${e.title}`,
            keywords: "education degree college university studied study qualification graduate graduation mca bca school academic",
            text: `${e.title} at ${e.org} (${e.location}), ${e.period}. ${e.description}.`,
        });
    }

    return chunks;
}

export const chunks: Chunk[] = buildChunks();
