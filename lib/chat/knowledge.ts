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
            keywords: "salary ctc compensation pay package expected expectation lpa lakhs money remuneration offer budget want wants per year annual annum earn earning expecting expect asking",
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
            keywords: "notice period join joining start available availability when how soon immediate immediately resign serve days day weeks week months early earlier next",
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
            keywords: "relocate relocation relocating move shift travel outside open willing other cities abroad office interested hyderabad mumbai pune chennai delhi gurgaon gurugram noida kolkata ahmedabad kochi mysuru mysore coimbatore jaipur chandigarh indore us usa uk dubai singapore germany canada overseas country bengaluru bangalore",
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
            keywords: "linkedin github profile profiles link links url social network repositories repos code open source portfolio website see view work samples where",
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
            keywords: `work job company employer role position worked do does doing responsibilities responsible duties day-to-day ${ongoing ? "current currently now present" : "previous past earlier former"} experience ${job.org}`,
            text: `${job.title} at ${job.org} (${job.location}), ${job.period}. ${thirdPerson(job.description)}`,
        });
    }
    // counts and lists, so "how many companies?" / "list his employers" are answered directly
    const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    const word = (n: number) => NUMBER_WORDS[n] ?? String(n);
    const span = (period: string) => period.replace(/\s*—\s*/, " to ").replace(/present/i, "present");
    chunks.push({
        id: "work-history",
        topic: "Work history and companies",
        keywords:
            "how many companies employers organisations organizations jobs worked work history career timeline list previous past current employment experience",
        text:
            `Sharath has worked at ${word(workExperience.length)} ${workExperience.length === 1 ? "company" : "companies"}: ` +
            workExperience.map((j) => `${j.org} (${j.title}, ${span(j.period)})`).join(" and ") +
            ".",
    });
    const byCategory = new Map<string, string[]>();
    for (const p of projectsPageData) byCategory.set(p.category, [...(byCategory.get(p.category) ?? []), p.title]);
    chunks.push({
        id: "projects-overview",
        topic: "Projects overview",
        keywords: "how many projects list all major portfolio built worked on products work done",
        text:
            `Sharath's portfolio lists ${projectsPageData.length} projects. ` +
            [...byCategory.entries()]
                .map(([cat, titles]) => `${cat === "Personal" ? "Personal projects" : `At ${cat}`}: ${titles.join(", ")}`)
                .join(". ") +
            ".",
    });

    const current = workExperience.find((j) => /present/i.test(j.period));
    if (current) {
        chunks.push({
            id: "current-role",
            topic: "Current role",
            keywords: "current currently now present role job company working employer since started",
            text: `Sharath currently works as a ${current.title} at ${current.org} in ${current.location}, since ${current.period.split("—")[0].trim()}.`,
        });
    }

    // ---- skills overview (tech stack / strengths) ----
    chunks.push({
        id: "skills-overview",
        topic: "Tech stack overview",
        keywords: "tech stack technologies technology main skills strengths strong best specialise specialize expertise what does he know languages frameworks tools overview",
        text:
            "Sharath's main technologies: " +
            skillsPageData
                .map((g) => `${g.title}: ${g.skillSets.slice(0, 6).map((s) => s.name).join(", ")}`)
                .join(". ") +
            ".",
    });

    // ---- role fit, frontend/backend, strengths: answers to "is he a good fit for ...?" and "strongest skill?" ----
    const names = (wanted: string[]) =>
        wanted.filter((n) => skillsPageData.some((g) => g.skillSets.some((s) => s.name === n)));
    const frontend = names(["React", "Next.js", "TypeScript", "JavaScript", "Tailwind", "HTML5", "CSS3", "Zustand", "Redux", "TanStack Query", "React Hook Form", "Zod"]);
    const backend = names(["Node.js", "Express.js", "FastAPI", "PHP", "MongoDB", "MySQL", "SQL"]);
    chunks.push(
        {
            id: "skills-frontend",
            topic: "Frontend skills",
            keywords: "frontend front-end front end ui ux client side web skills technologies",
            text: `Frontend: ${frontend.join(", ")}.`,
        },
        {
            id: "skills-backend",
            topic: "Backend skills",
            keywords: "backend back-end back end server side api apis rest restful endpoints services skills technologies",
            // "REST APIs" comes from Sharath's resume (Backend skills); the site's skills page has no rating for it
            text: `Backend: ${backend.join(", ")}. He builds REST APIs, for example with Node.js and Express.js or Python and FastAPI.`,
        },
        {
            id: "role-fit",
            topic: "Role fit: full-stack, frontend or backend",
            keywords: "good fit suitable role position work as backend frontend full stack fullstack developer engineer can he work hire hiring job opening",
            text: `Sharath is a Full-Stack Developer, so he can work on the frontend or the backend. Frontend: ${frontend.slice(0, 5).join(", ")}. Backend: ${backend.slice(0, 5).join(", ")}.`,
        }
    );
    const maxRating = Math.max(...skillsPageData.flatMap((g) => g.skillSets.map((s) => s.rating)));
    const strongest = [...new Set(skillsPageData.flatMap((g) => g.skillSets.filter((s) => s.rating === maxRating).map((s) => s.name)))];
    chunks.push({
        id: "top-skills",
        topic: "Strongest skills",
        keywords: "strongest best top highest strength strengths most expert good at best at proficient skills main core",
        text: `Sharath's highest self-rated skills (${maxRating}/100) are ${strongest.join(", ")}.`,
    });

    // ---- leadership, status, achievements ----
    chunks.push({
        id: "leadership",
        topic: "Leadership and ownership",
        keywords: "lead leader led leadership team manage managed management mentor mentoring ownership owned responsible head senior",
        // each clause is stated in lib/data.ts (Recruitree description, SequiDocs3 note, Preach Together description)
        text: "Sharath has taken lead roles: he led the development of Recruitree at Raw Conscious, was the frontend lead on SequiDocs3, and took ownership of the live Preach Together & Ask Heaven platform at Zibtek. His portfolio does not mention formally managing a team.",
    });
    if (current) {
        chunks.push({
            id: "employed",
            topic: "Employment status",
            keywords: "currently employed employment status working job unemployed notice serving",
            text: `Yes, Sharath is currently employed as a ${current.title} at ${current.org}, since ${current.period.split("—")[0].trim()}.`,
        });
    }
    chunks.push({
        id: "availability",
        topic: "Open to opportunities",
        keywords: "open opportunities opportunity job change switch available hiring interested hire new role",
        // "open to opportunities" is the status badge on Sharath's own home page
        text: `Sharath is open to new opportunities. His notice period is 1 month (negotiable), and he is open to remote roles or hybrid/on-site roles in Bengaluru.`,
    });
    const award = workExperience.map((j) => j.description.match(/Recognized with an? ([^.]+)/i)?.[1]).find(Boolean);
    const measurable = projectsPageData
        .flatMap((p) => p.keyContributions.map((c) => ({ p: p.title, c })))
        .filter(({ c }) => /\d+(\.\d+)?s\b|\d+%|\d+ (API test|tests|Playwright)/.test(c))
        .slice(0, 3)
        .map(({ p, c }) => `${p}: ${thirdPerson(c).slice(0, 170).replace(/\s+\S*$/, "")}`);
    chunks.push({
        id: "achievements",
        topic: "Achievements and awards",
        keywords: "achievement achievements award awards recognition recognised recognized proud biggest accomplishment accomplishments highlight highlights impact results won performance improve improved optimise optimize optimization speed faster lcp lighthouse",
        text: `${award ? `Sharath was recognized with a ${award} at Zibtek. ` : ""}Highlights from his projects: ${measurable.join("; ")}.`,
    });

    // first sentence of a description, whole if it fits; otherwise cut at a word with an ellipsis (never mid-parenthesis)
    const blurb = (description: string, max = 240) => {
        const first = thirdPerson(description).split(/(?<=[.!?])\s+/)[0].replace(/[.]$/, "");
        if (first.length <= max) return first;
        const cut = first.slice(0, max);
        const comma = cut.lastIndexOf(", ");
        return (comma > max * 0.5 ? cut.slice(0, comma) : cut.replace(/\s+\S*$/, "")).replace(/\([^)]*$/, "").trim();
    };

    // ---- mobile development: projects whose stack or description says mobile / React Native ----
    const mobile = projectsPageData.filter((p) => /react native|mobile/i.test(`${p.stack.join(" ")} ${p.description}`));
    if (mobile.length) {
        const rn = skillsPageData.flatMap((g) => g.skillSets).find((s) => /react native/i.test(s.name));
        chunks.push({
            id: "mobile",
            topic: "Mobile development",
            keywords: "mobile app apps application development android ios phone smartphone react native cross-platform",
            text:
                `Sharath has built mobile apps: ` +
                mobile.map((p) => `${p.title} at ${p.category} (${blurb(p.description, 150)})`).join("; ") +
                `.${rn ? ` He rates himself ${rn.rating}/100 in ${rn.name}.` : ""} His portfolio does not say which platforms (Android or iOS) the app targeted.`,
        });
    }

    // ---- projects grouped by where they were done ----
    for (const [cat, label, kw] of [
        ["Zibtek", "At Zibtek", "zibtek client projects"],
        ["Raw Conscious", "At Raw Conscious", "raw conscious rawconscious earlier previous company projects"],
        ["Personal", "Personal projects", "personal side own hobby projects"],
    ] as const) {
        const list = projectsPageData.filter((p) => p.category === cat);
        if (!list.length) continue;
        chunks.push({
            id: `projects-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            topic: `${label}: projects`,
            keywords: `${kw} projects worked built list`,
            text: `${label}, Sharath worked on: ` + list.map((p) => `${p.title} (${blurb(p.description)})`).join("; ") + ".",
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
            keywords: `skill skills know knowledge proficient proficiency experience expertise stack tech technology ${group.title} ${group.title === "AI & Integrations" ? "llm llms gpt chatgpt generative genai language model ai" : ""} ${group.skillSets
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
