import { chunks as allChunks, type Chunk } from "@/lib/chat/knowledge";

/** Small BM25 over the fact chunks. No dependencies, no model, runs anywhere. */

const STOPWORDS = new Set(
    "a an the and or but of to in on at for from with by is are was were be been being do does did you your yours he his him she her it its i me my we our they their this that these those what which who whom how when where why can could would should will shall may might about any some have has had tell please sharath s".split(
        " "
    )
);

// light, rule-based stemming so "projects" matches "project", "worked" matches "work"
function stem(word: string): string {
    return word
        .replace(/(ing|ed|es|s)$/i, (m, _s, offset) => (offset >= 3 ? "" : m))
        .replace(/(.)\1$/, "$1");
}

export function tokenize(text: string): string[] {
    return (
        text
            .toLowerCase()
            // keep c++, c#, .net style tokens readable; otherwise split on non-alphanumerics
            .replace(/next\.js/g, "nextjs")
            .replace(/node\.js/g, "nodejs")
            .replace(/react\.js/g, "react")
            .replace(/express\.js/g, "express")
            .replace(/[^a-z0-9+#]+/g, " ")
            .split(" ")
            .filter((t) => t.length > 1 && !STOPWORDS.has(t))
            // "sequidocs3" should also match a question that says "sequidocs"
            .flatMap((t) => (/^[a-z]{4,}\d+$/.test(t) ? [t, t.replace(/\d+$/, "")] : [t]))
            .map(stem)
    );
}

interface Indexed {
    chunk: Chunk;
    termFreq: Map<string, number>;
    length: number;
}

const K1 = 1.4;
const B = 0.6;

const index: Indexed[] = allChunks.map((chunk) => {
    // topic and keywords are repeated so they weigh more than body text
    const tokens = tokenize(`${chunk.topic} ${chunk.topic} ${chunk.keywords} ${chunk.text}`);
    const termFreq = new Map<string, number>();
    for (const t of tokens) termFreq.set(t, (termFreq.get(t) ?? 0) + 1);
    return { chunk, termFreq, length: tokens.length };
});

const avgLength = index.reduce((sum, d) => sum + d.length, 0) / index.length;

const docFreq = new Map<string, number>();
for (const d of index) for (const term of d.termFreq.keys()) docFreq.set(term, (docFreq.get(term) ?? 0) + 1);

export interface Hit {
    chunk: Chunk;
    score: number;
}

export function retrieve(query: string, limit = 4): Hit[] {
    const terms = [...new Set(tokenize(query))];
    if (terms.length === 0) return [];
    const n = index.length;

    const hits: Hit[] = [];
    for (const doc of index) {
        let score = 0;
        for (const term of terms) {
            const tf = doc.termFreq.get(term);
            if (!tf) continue;
            const df = docFreq.get(term) ?? 0;
            const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
            score += idf * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * doc.length) / avgLength)));
        }
        if (score > 0) hits.push({ chunk: doc.chunk, score });
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Below this the question is treated as "not covered by my facts". */
export const MIN_SCORE = 2.2;

// ---------------------------------------------------------------- typo tolerance
// Recruiters type fast: "pyhon", "salry", "notise". Words that are not in our own
// vocabulary are snapped to the closest vocabulary word (one edit, two for long words).

const VOCAB = new Map<string, number>(); // word -> number of chunks containing it
for (const chunk of allChunks) {
    const words = new Set(`${chunk.topic} ${chunk.keywords} ${chunk.text}`.toLowerCase().match(/[a-z0-9+#]{5,}/g) ?? []);
    for (const w of words) VOCAB.set(w, (VOCAB.get(w) ?? 0) + 1);
}
const VOCAB_WORDS = [...VOCAB.keys()];

/** Optimal-string-alignment distance (insert, delete, substitute, swap), capped. */
function editDistance(a: string, b: string, cap: number): number {
    if (Math.abs(a.length - b.length) > cap) return cap + 1;
    const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 0; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
    }
    return d[a.length][b.length];
}

export function correctQuery(query: string): string {
    // "reactjs" / "node js" / "nextjs" -> "react.js" ... so they match the technology names
    query = query.replace(/\b(react|node|next|express|vue)\.?\s*js\b/gi, "$1.js");
    return query.replace(/[A-Za-z0-9+#]{5,}/g, (word) => {
        const w = word.toLowerCase();
        if (VOCAB.has(w) || STOPWORDS.has(w) || /^\d+$/.test(w)) return word;
        const cap = w.length >= 9 ? 2 : 1;
        let best: string | null = null;
        let bestDist = cap + 1;
        for (const candidate of VOCAB_WORDS) {
            const dist = editDistance(w, candidate, cap);
            if (dist < bestDist || (dist === bestDist && best !== null && (VOCAB.get(candidate) ?? 0) > (VOCAB.get(best) ?? 0))) {
                best = candidate;
                bestDist = dist;
            }
        }
        return best && bestDist <= cap ? best : word;
    });
}
