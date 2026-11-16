import { recruiterFacts } from "@/lib/chat/knowledge";
import { MIN_SCORE, retrieve, type Hit } from "@/lib/chat/retrieve";
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

// obvious attempts to use the bot as a general assistant or to override it
const OFF_TOPIC =
    /\b(ignore (all |any |the )?(previous|prior|above)|system prompt|your instructions|jailbreak|pretend (to be|you)|act as|you are now|write (me )?(a |an )?(poem|story|essay|song|joke|code|script|function|email to)|tell me a joke|weather|stock price|bitcoin|recipe|capital of|translate|solve|homework|who (is|was) the (president|prime minister)|what is \d+\s*[+\-*/x]\s*\d+)\b/i;

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
};

export function isOffTopic(question: string): boolean {
    return OFF_TOPIC.test(question);
}

export function answerFromFacts(question: string, hits: Hit[] = retrieve(question)): Reply {
    const q = question.trim();
    if (GREETING.test(q) || THANKS.test(q)) return { answer: GREETING_REPLY, sources: [], kind: "greeting" };
    if (isOffTopic(q)) return { answer: OFF_TOPIC_REPLY, sources: [], kind: "off-topic" };

    const skill = skillAnswer(q);
    if (skill) return skill;

    const top = hits[0];
    if (!top || top.score < MIN_SCORE) return { answer: UNKNOWN_REPLY, sources: [], kind: "unknown" };

    // lead with the best chunk; add a runner-up only when it is nearly as relevant
    const picked = [top];
    const second = hits[1];
    if (second && second.score >= top.score * 0.75 && second.chunk.topic !== top.chunk.topic) picked.push(second);

    let answer = picked.map((h) => h.chunk.text).join("\n\n");
    if (answer.length > 900) answer = answer.slice(0, 880).replace(/\s+\S*$/, "") + "…";
    return { answer, sources: picked.map((h) => h.chunk.id), kind: "answer" };
}

export { recruiterFacts };
