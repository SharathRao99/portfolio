import { chunks as allChunks, recruiterFacts, thirdPerson } from "@/lib/chat/knowledge";
import { correctQuery, expandAbbreviations, MIN_SCORE, retrieve, tokenize, type Hit } from "@/lib/chat/retrieve";
import { personalInfo, projectsPageData, skillsPageData } from "@/lib/data";

/**
 * Retrieval-only answerer. Used whenever the fine-tuned model is asleep,
 * slow or unavailable, so the chat never dead-ends. It can only repeat text
 * from the knowledge chunks, so it cannot hallucinate.
 */

const OFF_TOPIC_REPLY =
    "I can only answer questions about Sharath's experience, projects, skills and availability. " +
    `For anything else, you can reach him at ${personalInfo.email}.`;

const UNKNOWN_REPLY =
    "I don't have that detail. You can ask Sharath directly at " +
    `${personalInfo.email}, or ask me about his experience, projects, skills, notice period or salary expectation.`;

const GREETING_REPLY =
    "Hi! I'm Sharath's portfolio assistant. Ask me about his experience, projects, skills, notice period, salary expectation or availability.";

const GREETING = /^\s*(hi|hello|hey|hii+|good (morning|afternoon|evening)|namaste|yo|sup)\b[\s!.?]*$/i;
const THANKS = /^\s*(thanks|thank you|thx|ok(ay)?|cool|great|got it)\b[\s!.?]*$/i;

// instructions hidden in a question that try to change the bot's behaviour
const INJECTION =
    /\b(ignore (all |any |the |your |these )?(previous |prior |above |earlier )?(instructions|rules|prompt|guidelines|facts)|ignore (all |any |the )?(previous|prior|above|earlier)|disregard|forget (everything|all|your|the)|system prompt|your (system )?(instructions|prompt|rules)|jailbreak|pretend (to be|you)|act as|you are now|from now on|reveal (your|the) (prompt|instructions)|print your|repeat the text above)\b/i;

// requests that are plainly not about Sharath
const OFF_TOPIC =
    /\b(write (me )?(a |an |some |the )?([\w+#.-]+ ){0,2}(poem|story|essay|song|joke|code|script|function|program|query|email|letter|haiku|limerick)|tell me a joke|weather|stock price|bitcoin|recipe|capital of|translate|solve (this|the|for|x|\\d)|homework|who (is|was) the (president|prime minister)|prime minister of|president of)\b/i;
// pasted code or attack strings (HTML, SQL, shell, template injection): never a recruiter question
const CODE_LIKE =
    /<\/?[a-z][^>]*>|\b(drop|delete|truncate|alter)\s+(table|database)\b|\bselect\b[^?]*\bfrom\b|\bunion\s+select\b|;\s*--|\bor\s+1\s*=\s*1\b|\{\{|\}\}|\$\{|\.\.\/|\betc\/passwd\b|\brm\s+-rf\b|\bsudo\b|\bcurl\s+http|\bjavascript:/i;
const MATH = /\b(what('?s| is)|calculate|compute)\s+-?\d+(\.\d+)?\s*(\+|-|\*|x|\u00d7|times|plus|minus|multiplied by|divided by|\/)\s*-?\d+/i;

// things only Sharath knows and we were never given: answer "I don't have that" instead of guessing from nearby text
const KNOWN_UNKNOWN =
    /\b(how old|his age|date of birth|dob|birthday|where was he born|married|marital|wife|girlfriend|kids|children|(home|residential|postal|permanent) address|references?|referees?|(other|competing|any) offers?|offers? in hand|bonus|religio\w*|caste|passport|hobb(y|ies)|weakness(es)?|favou?rite|blood group|father|mother|political|why (did|is|was|does|would) he (leave|leaving|left|looking|want to (leave|change))|reason (for|of) (leaving|change|switch)|job change|visa|work authori[sz]ation|certif\w*|freelanc\w*|contract(or|ual)?|full[- ]time|part[- ]time|permanent|night shifts?|shifts?|on[- ]call|senior(ity)?|junior|designation|speak\w*|fluen\w*|mother tongue|spoken languages?|serving (his )?notice|resigned|last working day|whatsapp|call him)\b/i;

// "current / last drawn salary" is not the same as the expected salary we do have
const CURRENT_SALARY =
    /\b(current|present|existing|last[- ]drawn|drawn|take[- ]home)\b[^?.!]*\b(ctc|salary|pay|package|compensation|income)\b|\b(ctc|salary|pay|package|compensation)\b[^?.!]*\b(current|present|last[- ]drawn|drawn)\b|\bhike\b/i;

/**
 * A recruiter often pastes job-description context before the question ("We are hiring a senior React developer ... Is he a fit?").
 * Answer the sentences that are questions, not the context, which would otherwise trip the "can't know" topics.
 */
function questionPart(text: string): string {
    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
    if (sentences.length < 2) return text;
    const asked = sentences.filter((s) => s.trim().endsWith("?"));
    const question = asked.join(" ");
    // "Is that okay?" means nothing without the sentence before it ("We can offer 20 LPA."): keep the context then
    return question && tokenize(question).length >= 2 ? question : text;
}

/** Drops sentences that try to override the bot ("Ignore previous instructions and ..."), keeps the real question. */
export function stripInjection(text: string): string {
    return text
        .split(/(?<=[.!?;])\s+|\s+(?:also|and then)\s+|,\s*(?=(?:and\s+)?(?:ignore|disregard|forget|pretend|act as|you are now|from now on))/i)
        .filter((part) => part.trim() && !INJECTION.test(part))
        .join(" ")
        .trim();
}

// ---- direct "do you know X?" answers --------------------------------------

const SKILL_CUE =
    /\b(know|knows|experience|experienced|used|use|using|worked|work with|familiar|comfortable|proficient|proficiency|expert|expertise|skilled|skill|handson|hands-on|built|have you|do you)\b/i;

const norm = (s: string) => s.toLowerCase().replace(/\.js\b/g, "").replace(/[^a-z0-9+#]+/g, " ").trim();

// how people actually type technology names
const aliasNorm = (s: string) =>
    norm(s)
        .replace(/\bmongo db\b/g, "mongodb")
        .replace(/\bmongo\b/g, "mongodb")
        .replace(/\bmy sql\b/g, "mysql")
        .replace(/\btailwind css\b|\btailwindcss\b/g, "tailwind")
        .replace(/\bdigital ocean\b/g, "digitalocean")
        .replace(/\bhtml\b/g, "html5")
        .replace(/\bcss\b/g, "css3")
        .replace(/\breactnative\b/g, "react native")
        .replace(/\bts\b/g, "typescript")
        .replace(/\bjs\b/g, "javascript");

// "how many years of experience in React?": the data has a self-rating and projects, not years per skill
const YEARS_CUE = /\b(years?|how long|total experience|how much experience|duration|since when)\b/i;

interface Tech {
    name: string;
    rating?: number;
    projects: string[];
}

// every technology the site mentions, from the skills page and each project's stack
const techs: Tech[] = (() => {
    const map = new Map<string, Tech>();
    for (const group of skillsPageData)
        for (const s of group.skillSets) map.set(norm(s.name), { name: s.name, rating: s.rating, projects: [] });
    for (const p of projectsPageData)
        for (const t of p.stack) {
            const key = norm(t).replace(/ \d+$/, "").replace(/ css$/, ""); // "Laravel 12" -> "laravel", "Tailwind CSS" -> "tailwind"
            const entry = map.get(key) ?? { name: t, projects: [] };
            if (!entry.projects.includes(p.title)) entry.projects.push(p.title);
            map.set(key, entry);
        }
    return [...map.values()];
})();

const projectTitles = projectsPageData.map((p) => norm(p.title));

// "explain more", "how did he use it in his projects", "tell me more about his Stripe experience"
const DETAIL_CUE =
    /\b(explain|elaborate|more|details?|examples?|how (has|have|did|does|do|was|were)?\s*(he|sharath)?\s*(use|used|using|apply|applied|work|worked)|used (it )?in|projects?)\b/i;

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** First sentence of `text` that mentions `word` (whole word), clipped. */
function sentenceWith(text: string, word: string): string | null {
    // "React" must not match "React Native", which is a different skill
    const notNative = word.toLowerCase() === "react" ? "(?!\\s+Native)" : "";
    const re = new RegExp(`(^|[^A-Za-z0-9])${escapeRe(word)}${notNative}([^A-Za-z0-9]|$)`, "i");
    const hit = text.split(/(?<=[.!?])\s+/).find((s) => re.test(s));
    if (!hit) return null;
    return hit;
}

/** Where and how a technology was used, built only from the project data. */
function techDetail(tech: Tech): string | null {
    const base = tech.name.replace(/\s+\d+$/, "");
    const bullets: string[] = [];
    for (const p of projectsPageData) {
        const inStack = p.stack.some((s) => norm(s).replace(/ \d+$/, "") === norm(base).replace(/ \d+$/, ""));
        let line: string | null = null;
        for (const c of p.keyContributions) {
            const s = sentenceWith(thirdPerson(c), base);
            if (s) { line = `Sharath ${lowerFirst(s)}`; break; }
        }
        line ??= sentenceWith(thirdPerson(p.description), base);
        if (!line && !inStack) continue;
        const where = p.category === "Personal" ? "personal project" : p.category;
        line ??= `Part of the tech stack. ${thirdPerson(p.description).split(/(?<=[.!?])\s+/)[0]}`;
        bullets.push(`• ${p.title} (${where}): ${line}`);
        if (bullets.length === 4) break;
    }
    if (bullets.length === 0) return null;
    const rating = tech.rating !== undefined ? ` and rates himself ${tech.rating}/100 in it` : "";
    return `Sharath works with ${tech.name}${rating}. Here is where he has used it:\n${bullets.join("\n")}`;
}

// which project a question is about ("zack", "sequidocs", "preach together", ...)
const PROJECT_KEYS: [RegExp, string][] = [
    [/\b(preach together|ask heaven|preach)\b/i, "Preach Together & Ask Heaven"],
    [/\bzack\b/i, "Zack Academy"],
    [/\bsequidocs\d*\b/i, "SequiDocs3"],
    [/\bcrewdesk\b/i, "Crewdesk"],
    [/\b(media pipeline|ai media)\b/i, "AI Media Pipeline"],
    [/\b(cyber ?security|compliance)\b/i, "Cyber Security & Compliance SaaS"],
    [/\b(recruitree|recruitment management)\b/i, "Recruitment Management System"],
    [/\b(monarch|parental)\b/i, "Monarch AI - Parental Control App"],
    [/\b(digital commerce|commerce platform)\b/i, "Digital Commerce Platform"],
];

/** "How did he use Python on Zack Academy?": what he did with that technology on that project, from the project data. */
function projectTechAnswer(project: (typeof projectsPageData)[number], tech: Tech): Reply {
    const base = tech.name.replace(/\s+\d+$/, "");
    const lines: string[] = [];
    for (const c of project.keyContributions) {
        const s = sentenceWith(thirdPerson(c), base);
        if (s) lines.push(`Sharath ${lowerFirst(s)}`);
        if (lines.length === 2) break;
    }
    if (lines.length === 0) {
        const d = sentenceWith(thirdPerson(project.description), base);
        if (d) lines.push(d);
    }
    const inStack = project.stack.some((s) => norm(s).replace(/ \d+$/, "") === norm(base));
    // FastAPI is a Python framework, so a FastAPI backend is Python even when "Python" is not tagged
    const viaFastApi = norm(base) === "python" && project.stack.some((s) => /fastapi/i.test(s));
    const rating = tech.rating !== undefined ? ` He rates himself ${tech.rating}/100 in ${tech.name} overall.` : "";

    let answer: string;
    if (lines.length) answer = `On ${project.title}: ${lines.map((l) => l.replace(/[.…]+$/, "") + ".").join(" ")}${rating}`;
    else if (inStack) answer = `${tech.name} is part of ${project.title}'s tech stack, but I don't have more detail on how he used it there.${rating}`;
    else if (viaFastApi) answer = `${project.title}'s backend uses FastAPI, which is a Python framework, but I don't have more detail on how he used it there.${rating}`;
    else {
        const elsewhere = tech.projects.length ? ` He has used it in ${tech.projects.join(", ")}.` : "";
        answer = `${tech.name} isn't listed for ${project.title}.${elsewhere}`;
    }
    return { answer, sources: [`skill-${norm(tech.name)}`], kind: "answer" };
}

function skillAnswer(question: string, original: string = question): Reply | null {
    const q = ` ${aliasNorm(question)} `;
    // phrases like "total experience" are matched on what the visitor typed as well as the typo-corrected text
    const cues = `${question} ${original}`;
    const found = techs.filter((t) => {
        const n = norm(t.name).replace(/ \d+$/, "");
        return n.length > 1 && q.includes(` ${n} `);
    });
    // "React Native" also contains "React": when a longer name matches, drop the shorter one it contains
    const mentioned = found.filter((t) => {
        const n = norm(t.name).replace(/ \d+$/, "");
        return !found.some((o) => o !== t && norm(o.name).replace(/ \d+$/, "").startsWith(`${n} `));
    });

    // a technology AND a project in one question: answer about that technology on that project
    const projectTitle = PROJECT_KEYS.find(([re]) => re.test(question) || re.test(original))?.[1];
    if (projectTitle && mentioned.length === 1) {
        const project = projectsPageData.find((p) => p.title === projectTitle);
        if (project) return projectTechAnswer(project, mentioned[0]);
    }
    // "what did you do on Zack Academy" is a project question, not a skill one
    if (projectTitle || projectTitles.some((t) => q.includes(` ${t.split(" ")[0]} `))) return null;

    if (mentioned.length === 0 || mentioned.length > 4) return null;

    // a bare technology ("python?", "does he node js?", "react experience") is a skill question even without "know"
    const named = new Set(mentioned.flatMap((t) => tokenize(t.name)));
    const leftover = tokenize(question).filter((tok) => !named.has(tok));
    if (!SKILL_CUE.test(cues) && leftover.length > 2) return null;

    if (mentioned.length === 1 && YEARS_CUE.test(cues)) {
        const t = mentioned[0];
        const rating = t.rating !== undefined ? ` He rates himself ${t.rating}/100 in ${t.name}` : "";
        const used = t.projects.length ? `${rating ? " and has" : " He has"} used it in ${t.projects.join(", ")}` : "";
        return {
            answer: `I don't have a separate number of years for ${t.name}. Sharath has 3+ years of experience overall as a Full-Stack Developer.${rating}${used}${rating || used ? "." : ""}`,
            sources: [`skill-${norm(t.name)}`],
            kind: "answer",
        };
    }

    if (mentioned.length === 1 && DETAIL_CUE.test(cues)) {
        const detail = techDetail(mentioned[0]);
        if (detail) return { answer: detail, sources: [`skill-${norm(mentioned[0].name)}`], kind: "answer" };
    }

    const lines = mentioned.map((t) => {
        const rating = t.rating !== undefined ? ` He rates himself ${t.rating}/100 in it.` : "";
        const used = t.projects.length ? ` He has used it in ${t.projects.join(", ")}.` : "";
        return `Yes, Sharath works with ${t.name}.${rating}${used}`;
    });
    return { answer: lines.join("\n"), sources: mentioned.map((t) => `skill-${norm(t.name)}`), kind: "answer" };
}

// ---- answer length: never cut mid-sentence -----------------------------------------------

const MAX_ANSWER = 800;

/** Shortens to the last full sentence or list item that fits; never ends with "…" or half a phrase. */
function trimToBoundary(text: string, max = MAX_ANSWER): string {
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(".\n"));
    if (end > max * 0.4) return cut.slice(0, end).replace(/[;,:\s]+$/, "") + ".";
    return cut.replace(/[,;:]?\s+\S*$/, "") + ".";
}

/** First fact always; each further fact only if it fits whole (half of a second fact reads as a broken answer). */
function fitFacts(texts: string[]): string {
    const out = [texts[0]];
    let length = texts[0].length;
    for (const t of texts.slice(1)) {
        if (length + 2 + t.length > MAX_ANSWER) continue;
        out.push(t);
        length += 2 + t.length;
    }
    return trimToBoundary(out.join("\n\n"));
}

export type Reply = {
    answer: string;
    /** ids of the chunks the answer was built from, for debugging and tests */
    sources: string[];
    kind: "answer" | "unknown" | "off-topic" | "greeting";
    /** the facts this answer was built from; the API route gives these to the model as its only context */
    hits?: Hit[];
};

export function isOffTopic(question: string): boolean {
    return INJECTION.test(question) || OFF_TOPIC.test(question) || MATH.test(question) || CODE_LIKE.test(question);
}

const INTRO =
    /^(who (is|'s) (sharath|he|this)|introduce (him|sharath)|describe (him|sharath))\b|^((tell|show|give) me (everything|all|more)( about (him|sharath))?|sharath( b c)?|him|he)\s*\??$/i;
const BARE_EXPERIENCE = /^(tell me about |what is |what's )?(his |the )?(total |overall |work |professional )?(years of experience|experience|background|career)\??$/i;
const BARE_PROJECTS = /^(tell me about |show me |what are )?(his |the |all |your )?(projects?|portfolio|works?|work done|past work)\??$/i;
const STRONGEST = /\b(strongest|strengths?|good at|best at|top skills?|best skills?|highest[- ]rated|most proficient|main skills?)\b/i;
const SKILLS_GENERIC =
    /^(what (are |is )?)?(his |the |all |main |key )?(technical |tech |core )?(skills?|skill ?set|technologies|tools|tech stack|expertise)\??$|\b(what|which) (technical |tech )?(skills|technologies|tools)\b|\btechnical skills?\b/i;
const BEST_PROJECT = /\b(best|favou?rite|most (proud|impressive|complex|challenging))\b[^?]*\b(project|thing|system|product|application|app|built|build|work)\b/i;

/** Splits "salary and when can he join" into parts and answers each when they hit different facts. */
function multiPartAnswer(q: string): Reply | null {
    const parts = q
        .split(/\s*(?:\band\b|&|,|;|\balso\b|\bplus\b|\?)\s*/i)
        .map((x) => x.trim())
        .filter((x) => tokenize(x).length >= 1); // short parts like "when he can join" are still a question; the score threshold below guards against noise
    if (parts.length < 2 || parts.length > 3) return null;
    const picks = new Map<string, Hit>();
    for (const part of parts) {
        const hit = retrieve(part, 1)[0];
        if (hit && hit.score >= MIN_SCORE * 1.3) picks.set(hit.chunk.id, hit);
    }
    if (picks.size < 2) return null;
    const hits = [...picks.values()];
    return { answer: fitFacts(hits.map((h) => h.chunk.text)), sources: hits.map((h) => h.chunk.id), kind: "answer", hits };
}

export function answerFromFacts(question: string, hits?: Hit[]): Reply {
    const asked = question.trim();
    if (GREETING.test(asked) || THANKS.test(asked)) return { answer: GREETING_REPLY, sources: [], kind: "greeting" };

    // keep the real question, drop any "ignore your instructions ..." part; nothing left means it was only an attack
    const raw = questionPart(expandAbbreviations(stripInjection(asked)));
    if (!raw || isOffTopic(raw)) return { answer: OFF_TOPIC_REPLY, sources: [], kind: "off-topic" };

    if (CURRENT_SALARY.test(raw)) {
        return {
            answer: `I don't have his current salary. ${recruiterFacts.salary} For anything else, email Sharath at ${personalInfo.email}.`,
            sources: ["salary"],
            kind: "unknown",
        };
    }
    if (KNOWN_UNKNOWN.test(raw)) return { answer: UNKNOWN_REPLY, sources: [], kind: "unknown" };
    if (BEST_PROJECT.test(raw)) {
        const overview = allChunks.find((c) => c.id === "projects-overview")?.text ?? "";
        return { answer: `${overview} I can't say which one he considers his best; you can email him at ${personalInfo.email}.`, sources: ["projects-overview"], kind: "answer" };
    }

    // fix typos ("pyhon", "salry") before matching; the checks above ran on the raw text on purpose
    let q = correctQuery(raw);
    if (isOffTopic(q)) return { answer: OFF_TOPIC_REPLY, sources: [], kind: "off-topic" };
    if (INTRO.test(q)) q = "summary overview profile background about";
    else if (BARE_PROJECTS.test(q)) q = "how many projects list all major portfolio built worked on products";
    else if (BARE_EXPERIENCE.test(q)) q = "summary overview profile background work history";
    else if (STRONGEST.test(q)) q = "strongest best top highest strength skills";
    else if (SKILLS_GENERIC.test(q) && !/\b(python|react|node|next|java|mongo|mysql|aws|stripe)\b/i.test(q)) q = "tech stack technologies main skills overview";
    // "when did he join Zibtek?" is about his dates there, not his notice period ("when can he join?")
    const company = q.match(/\b(zibtek|raw ?conscious)\b/i)?.[1];
    if (company && /\b(when|since when|which (month|year)|what (date|month|year))\b[^?]*\b(join(ed)?|start(ed)?|began|begin)\b/i.test(q)) {
        q = `${company} work role period dates`;
    }
    // "what does he do at Zibtek?" / "his role at Raw Conscious" is about the role, not the list of projects there
    else if (company && !/\bprojects?\b/i.test(q) && /\b(what (does|did) he do|his (role|job|position|work)|(role|job|position|responsibilities) (at|in)|work(s|ed|ing)? (at|for))\b/i.test(q)) {
        q = `${company} work job role position experience employer`;
    }
    hits ??= retrieve(q);

    const skill = skillAnswer(q, raw);
    if (skill) return { ...skill, hits };

    // "salary and when can he join" -> answer both
    const multi = multiPartAnswer(q);
    if (multi) return multi;

    const top = hits[0];
    if (!top || top.score < MIN_SCORE) return { answer: UNKNOWN_REPLY, sources: [], kind: "unknown" };
    // one stray word matching one chunk ("script", "table") is not an answer: junk like "'; DROP TABLE users" lands here
    if (top.total >= 2 && top.matched / top.total < 0.5 && top.score < 4) return { answer: UNKNOWN_REPLY, sources: [], kind: "unknown" };

    // lead with the best chunk; add a runner-up only when it is nearly as relevant
    const picked = [top];
    const second = hits[1];
    if (second && second.score >= top.score * 0.75 && second.chunk.topic !== top.chunk.topic) picked.push(second);

    const answer = fitFacts(picked.map((h) => h.chunk.text));
    return { answer, sources: picked.map((h) => h.chunk.id), kind: "answer", hits };
}

export { recruiterFacts };
