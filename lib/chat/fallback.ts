import { recruiterFacts, thirdPerson } from "@/lib/chat/knowledge";
import { correctQuery, MIN_SCORE, retrieve, tokenize, type Hit } from "@/lib/chat/retrieve";
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
    /\b(write (me )?(a |an |some |the )?([\w+#.-]+ ){0,2}(poem|story|essay|song|joke|code|script|function|program|query|email|letter|haiku|limerick)|tell me a joke|weather|stock price|bitcoin|recipe|capital of|translate|solve|homework|who (is|was) the (president|prime minister)|prime minister of|president of)\b/i;
const MATH = /\b(what('?s| is)|calculate|compute)\s+-?\d+(\.\d+)?\s*(\+|-|\*|x|\u00d7|times|plus|minus|multiplied by|divided by|\/)\s*-?\d+/i;

// things only Sharath knows and we were never given: answer "I don't have that" instead of guessing from nearby text
const KNOWN_UNKNOWN =
    /\b(how old|his age|date of birth|dob|birthday|where was he born|married|marital|wife|girlfriend|kids|children|(home|residential|postal|permanent) address|references?|referees?|(other|competing|any) offers?|offers? in hand|bonus|religio\w*|caste|passport|hobb(y|ies)|weakness(es)?|favou?rite|blood group|father|mother|political|why (did|is|was|does|would) he (leave|leaving|left|looking|want to (leave|change))|reason (for|of) (leaving|change|switch)|job change|visa|work authori[sz]ation)\b/i;

// "current / last drawn salary" is not the same as the expected salary we do have
const CURRENT_SALARY =
    /\b(current|present|existing|last[- ]drawn|drawn|take[- ]home)\b[^?.!]*\b(ctc|salary|pay|package|compensation|income)\b|\b(ctc|salary|pay|package|compensation)\b[^?.!]*\b(current|present|last[- ]drawn|drawn)\b|\bhike\b/i;

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
            const key = norm(t).replace(/ \d+$/, ""); // "Laravel 12" -> "laravel"
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
    return hit.length > 240 ? hit.slice(0, 237).replace(/\s+\S*$/, "") + "…" : hit;
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

function skillAnswer(question: string): Reply | null {
    if (!SKILL_CUE.test(question)) return null;
    const q = ` ${norm(question)} `;
    // "what did you do on Zack Academy" is a project question, not a skill one
    if (projectTitles.some((t) => q.includes(` ${t.split(" ")[0]} `))) return null;

    const mentioned = techs.filter((t) => {
        const n = norm(t.name).replace(/ \d+$/, "");
        return n.length > 1 && q.includes(` ${n} `);
    });
    if (mentioned.length === 0 || mentioned.length > 4) return null;

    if (mentioned.length === 1 && DETAIL_CUE.test(question)) {
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

export type Reply = {
    answer: string;
    /** ids of the chunks the answer was built from, for debugging and tests */
    sources: string[];
    kind: "answer" | "unknown" | "off-topic" | "greeting";
    /** the facts this answer was built from; the API route gives these to the model as its only context */
    hits?: Hit[];
};

export function isOffTopic(question: string): boolean {
    return INJECTION.test(question) || OFF_TOPIC.test(question) || MATH.test(question);
}

const INTRO = /^(who (is|'s) (sharath|he|this)|introduce (him|sharath)|describe (him|sharath))\b/i;

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
    return { answer: hits.map((h) => h.chunk.text).join("\n\n"), sources: hits.map((h) => h.chunk.id), kind: "answer", hits };
}

export function answerFromFacts(question: string, hits?: Hit[]): Reply {
    const asked = question.trim();
    if (GREETING.test(asked) || THANKS.test(asked)) return { answer: GREETING_REPLY, sources: [], kind: "greeting" };

    // keep the real question, drop any "ignore your instructions ..." part; nothing left means it was only an attack
    const raw = stripInjection(asked);
    if (!raw || isOffTopic(raw)) return { answer: OFF_TOPIC_REPLY, sources: [], kind: "off-topic" };

    if (CURRENT_SALARY.test(raw)) {
        return {
            answer: `I don't have his current salary. ${recruiterFacts.salary} For anything else, email Sharath at ${personalInfo.email}.`,
            sources: ["salary"],
            kind: "unknown",
        };
    }
    if (KNOWN_UNKNOWN.test(raw)) return { answer: UNKNOWN_REPLY, sources: [], kind: "unknown" };

    // fix typos ("pyhon", "salry") before matching; the checks above ran on the raw text on purpose
    let q = correctQuery(raw);
    if (isOffTopic(q)) return { answer: OFF_TOPIC_REPLY, sources: [], kind: "off-topic" };
    if (INTRO.test(q)) q = "summary overview profile background about";
    // "when did he join Zibtek?" is about his dates there, not his notice period ("when can he join?")
    const company = q.match(/\b(zibtek|raw ?conscious)\b/i)?.[1];
    if (company && /\b(when|since when|which (month|year)|what (date|month|year))\b[^?]*\b(join(ed)?|start(ed)?|began|begin)\b/i.test(q)) {
        q = `${company} work role period dates`;
    }
    hits ??= retrieve(q);

    const skill = skillAnswer(q);
    if (skill) return { ...skill, hits };

    // "salary and when can he join" -> answer both
    const multi = multiPartAnswer(q);
    if (multi) return multi;

    const top = hits[0];
    if (!top || top.score < MIN_SCORE) return { answer: UNKNOWN_REPLY, sources: [], kind: "unknown" };

    // lead with the best chunk; add a runner-up only when it is nearly as relevant
    const picked = [top];
    const second = hits[1];
    if (second && second.score >= top.score * 0.75 && second.chunk.topic !== top.chunk.topic) picked.push(second);

    let answer = picked.map((h) => h.chunk.text).join("\n\n");
    if (answer.length > 900) answer = answer.slice(0, 880).replace(/\s+\S*$/, "") + "…";
    return { answer, sources: picked.map((h) => h.chunk.id), kind: "answer", hits };
}

export { recruiterFacts };
