import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogle } from "@ai-sdk/google";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;

  return {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) {
        headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      }
      const response = await fetch(input, { ...init, headers });
      const next = response.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim();
      if (!runId && next) runId = next;
      return response;
    },
    getRunId: () => runId,
  };
}

export function createLovableAiGatewayProvider(
  lovableApiKey: string,
  initialRunId?: string,
  options?: { structuredOutputs?: boolean },
) {
  // If user has an OpenRouter API key, support it
  if (process.env["OPENROUTER_API_KEY"]) {
    const openrouter = createOpenAICompatible({
      name: "openrouter",
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env["OPENROUTER_API_KEY"],
      supportsStructuredOutputs: options?.structuredOutputs ?? false,
      headers: {
        "HTTP-Referer": "https://fixmyresume.app",
        "X-Title": "FixMyResume Builder",
      },
      fetch: async (url, init) => {
        if (init && init.body && typeof init.body === "string") {
          try {
            const body = JSON.parse(init.body);
            // OpenRouter estimates credit cost based on max_tokens. If undefined or too large,
            // it can fail with credit errors. Intercept and cap at 2000.
            if (!body.max_tokens || body.max_tokens > 2000) {
              body.max_tokens = 2000;
              init.body = JSON.stringify(body);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        return fetch(url, init);
      }
    });
    return (modelId: string) => {
      let cleanModelId = process.env["OPENROUTER_MODEL"] || modelId;
      if (!process.env["OPENROUTER_MODEL"]) {
        // Fallback mapping if no custom model is defined
        if (cleanModelId === "google/gemini-3.6-flash" || cleanModelId === "google/gemini-1.5-flash" || cleanModelId === "gemini-1.5-flash") {
          cleanModelId = "google/gemini-2.5-flash";
        }
      }
      return openrouter(cleanModelId);
    };
  }

  // If user has a direct Gemini API key (any key NOT starting with the Lovable 'sk_' prefix), bypass the Lovable AI Gateway
  if (process.env["GEMINI_API_KEY"] && !process.env["GEMINI_API_KEY"].startsWith("sk_")) {
    const google = createGoogle({
      apiKey: process.env["GEMINI_API_KEY"],
    });
    return (modelId: string) => {
      let cleanModelId = modelId;
      if (modelId.startsWith("google/")) {
        cleanModelId = modelId.replace("google/", "");
      }
      // Map custom/placeholder models to valid official Gemini models
      if (cleanModelId.startsWith("gemini-")) {
        // Keep specific versioned models
      } else if (cleanModelId.includes("flash")) {
        cleanModelId = "gemini-3.6-flash";
      } else if (cleanModelId.includes("pro")) {
        cleanModelId = "gemini-2.5-pro";
      } else {
        cleanModelId = "gemini-3.6-flash";
      }
      return google(cleanModelId);
    };
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);

  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    supportsStructuredOutputs: options?.structuredOutputs ?? false,
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch,
  });
}

export const CHAT_MODEL = "google/gemini-3.6-flash";

export function requireLovableApiKey() {
  const openrouterKey = process.env["OPENROUTER_API_KEY"];
  if (openrouterKey) return openrouterKey;

  const directKey = process.env["GEMINI_API_KEY"];
  if (directKey) return directKey;

  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project. Please set GEMINI_API_KEY, OPENROUTER_API_KEY, or LOVABLE_API_KEY.");
  return key;
}