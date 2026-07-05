// Ambient types for the WebMCP draft spec (W3C Web Machine Learning Community
// Group, https://webmachinelearning.github.io/webmcp/). Not yet in TS lib.dom
// — the spec is still a draft (~100 open issues), so this is a minimal
// hand-written surface covering only what this codebase calls.

interface ModelContextToolResult {
    content: Array<{ type: "text"; text: string }>;
}

interface ModelContextTool {
    name: string;
    title?: string;
    description: string;
    inputSchema?: Record<string, unknown>;
    execute: (input: Record<string, unknown>) => Promise<ModelContextToolResult> | ModelContextToolResult;
    annotations?: {
        readOnlyHint?: boolean;
        untrustedContentHint?: boolean;
    };
}

interface ModelContextRegisterToolOptions {
    signal?: AbortSignal;
    exposedTo?: string[];
}

interface ModelContext {
    registerTool: (tool: ModelContextTool, options?: ModelContextRegisterToolOptions) => Promise<undefined>;
}

interface Document {
    readonly modelContext?: ModelContext;
}
