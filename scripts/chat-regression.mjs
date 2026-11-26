#!/usr/bin/env node
/**
 * Runs scripts/chat-questions.mjs against a running server and reports pass/fail per category.
 *
 *   npm run build && npm run start        # in one terminal
 *   npm run test:chat                     # in another
 *
 *   BASE_URL=https://your-preview.vercel.app npm run test:chat   # test a deployment (incl. the model, if configured)
 *   node scripts/chat-regression.mjs --only skills               # one category
 *   node scripts/chat-regression.mjs --min 0.95                  # fail the run below 95% (default 1.0)
 *
 * No dependencies. Each request uses a random x-forwarded-for so the per-IP rate limit does not
 * interfere, and a "regress-" session id so the question log can ignore these runs.
 */
import { questions } from "./chat-questions.mjs";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const args = process.argv.slice(2);
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const only = flag("--only");
const min = Number(flag("--min") ?? 1);
const verbose = args.includes("--verbose");

const UNKNOWN = /(don't|do not) have (that|his|a phone|that link)|isn't something i have|that isn't something/i;
const OFFTOPIC = /can only (answer|help)/i;
const GREETING = /^hi! i'm sharath's/i;

function classify(answer) {
    if (GREETING.test(answer)) return "greeting";
    if (OFFTOPIC.test(answer)) return "offtopic";
    if (UNKNOWN.test(answer)) return "unknown";
    return "answer";
}

async function ask(q, i) {
    const started = Date.now();
    const res = await fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": `10.${(i >> 8) & 255}.${i & 255}.${Math.floor(Math.random() * 250) + 1}` },
        body: JSON.stringify({ message: q, sid: `regress-${Date.now().toString(36)}` }),
    });
    const data = await res.json();
    return { status: res.status, answer: data.answer ?? data.error ?? "", source: data.source, ms: Date.now() - started };
}

function judge([category, q, expect, required = [], forbidden = []], got) {
    const problems = [];
    const low = got.answer.toLowerCase();
    const kind = classify(got.answer);
    if (got.status !== 200) problems.push(`HTTP ${got.status}`);
    if (expect !== "any" && kind !== expect) problems.push(`expected ${expect}, got ${kind}`);
    if (expect === "any" && kind === "answer" && /undefined|\[object/.test(got.answer)) problems.push("broken output");
    for (const group of required) {
        if (!group.some((p) => low.includes(p.toLowerCase()))) problems.push(`missing ${group.map((p) => `"${p}"`).join(" or ")}`);
    }
    for (const p of forbidden) if (low.includes(p.toLowerCase())) problems.push(`contains forbidden "${p}"`);
    if (got.ms > 15000) problems.push(`slow (${got.ms}ms)`);
    // an answer must never be chopped off mid-sentence
    if (got.answer.includes("…")) problems.push("answer was cut off (contains …)");
    return problems;
}

const selected = questions.filter((e) => !only || e[0] === only);
const byCat = new Map();
const failures = [];
let i = 0;
for (const entry of selected) {
    let got;
    try {
        got = await ask(entry[1], i++);
    } catch (e) {
        console.error(`\nCannot reach ${BASE}/api/chat: ${e.message}\nStart the server first (npm run build && npm run start) or set BASE_URL.`);
        process.exit(2);
    }
    const problems = judge(entry, got);
    const c = byCat.get(entry[0]) ?? { pass: 0, total: 0 };
    c.total++;
    if (!problems.length) c.pass++;
    byCat.set(entry[0], c);
    if (problems.length) failures.push({ entry, got, problems });
    else if (verbose) console.log(`ok   [${entry[0]}] ${entry[1]}`);
}

const total = selected.length;
const passed = total - failures.length;
console.log(`\nChat regression against ${BASE}: ${passed}/${total} passed (${((passed / total) * 100).toFixed(1)}%)\n`);
for (const [cat, c] of byCat) console.log(`  ${cat.padEnd(15)} ${String(c.pass).padStart(3)}/${String(c.total).padEnd(3)} ${c.pass === c.total ? "ok" : "FAILING"}`);

for (const { entry, got, problems } of failures) {
    console.log(`\nFAIL [${entry[0]}] ${entry[1]}\n   ${problems.join("; ")}\n   answer (${got.source ?? "?"}): ${got.answer.slice(0, 220).replace(/\n/g, " ")}`);
}
process.exit(passed / total >= min ? 0 : 1);
