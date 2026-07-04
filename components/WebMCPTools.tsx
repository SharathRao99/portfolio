"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { personalInfo } from "@/lib/data";

const PAGES: Record<string, string> = {
    home: "/",
    about: "/about",
    skills: "/skills",
    projects: "/projects",
};

/**
 * Registers this site's actions as WebMCP tools (draft W3C spec:
 * https://webmachinelearning.github.io/webmcp/) so an AI browser agent can
 * discover and call them directly instead of guessing at the UI.
 *
 * Pure progressive enhancement: `document.modelContext` only exists in
 * Chrome today (origin trial / experimental flag), so this is a no-op
 * everywhere else — no polyfill, no bundle cost, no behavior change for the
 * overwhelming majority of visitors.
 *
 * The tool set mirrors the ⌘K command palette (CommandPalette.tsx) one-to-one
 * so there's a single source of truth for "what can this site do" — each
 * `execute` below calls the same router/theme/data the palette already uses.
 */
export default function WebMCPTools() {
    const router = useRouter();
    const { setTheme, resolvedTheme } = useTheme();

    useEffect(() => {
        if (typeof document === "undefined" || !("modelContext" in document) || !document.modelContext) {
            return;
        }

        const controller = new AbortController();
        const mc = document.modelContext;
        const options = { signal: controller.signal };

        mc.registerTool(
            {
                name: "navigate_to_page",
                description: "Navigate the site to Home, About, Skills, or Projects.",
                inputSchema: {
                    type: "object",
                    properties: {
                        page: { type: "string", enum: Object.keys(PAGES) },
                    },
                    required: ["page"],
                },
                execute: async (input) => {
                    const page = String(input.page ?? "home");
                    router.push(PAGES[page] ?? "/");
                    return { content: [{ type: "text", text: `Navigated to ${page}.` }] };
                },
            },
            options
        );

        mc.registerTool(
            {
                name: "get_contact_email",
                description: "Get the site owner's contact email address.",
                annotations: { readOnlyHint: true },
                execute: async () => ({
                    content: [{ type: "text", text: personalInfo.email }],
                }),
            },
            options
        );

        mc.registerTool(
            {
                name: "get_resume_link",
                description: "Get the URL to download the site owner's resume.",
                annotations: { readOnlyHint: true },
                execute: async () => ({
                    content: [{ type: "text", text: personalInfo.resumeLink }],
                }),
            },
            options
        );

        mc.registerTool(
            {
                name: "get_linkedin_url",
                description: "Get the site owner's LinkedIn profile URL.",
                annotations: { readOnlyHint: true },
                execute: async () => ({
                    content: [
                        { type: "text", text: "https://www.linkedin.com/in/sharath-b-c-45ba01203" },
                    ],
                }),
            },
            options
        );

        mc.registerTool(
            {
                name: "toggle_theme",
                description: "Switch the site between light and dark theme.",
                execute: async () => {
                    const next = resolvedTheme === "dark" ? "light" : "dark";
                    setTheme(next);
                    return { content: [{ type: "text", text: `Switched to ${next} theme.` }] };
                },
            },
            options
        );

        return () => controller.abort();
    }, [router, setTheme, resolvedTheme]);

    return null;
}
