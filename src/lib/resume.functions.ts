"use server";

import { streamText, Output } from "ai";
import {
  createLovableAiGatewayProvider,
  CHAT_MODEL,
  requireLovableApiKey,
} from "./ai-gateway.server";
import {
  AnalyzeInput,
  AnalysisSchema,
  ImproveInput,
  LatexInput,
  ANALYZE_SYSTEM,
  IMPROVE_SYSTEM,
  LATEX_SYSTEM,
} from "./resume.schemas";

export async function analyzeResume(input: unknown) {
  const data = AnalyzeInput.parse(input);
  const gateway = createLovableAiGatewayProvider(requireLovableApiKey(), undefined, {
    structuredOutputs: true,
  });
  const result = streamText({
    model: gateway(CHAT_MODEL),
    system: ANALYZE_SYSTEM,
    output: Output.object({ schema: AnalysisSchema }),
    prompt: [
      data.jobDescription
        ? `TARGET JOB DESCRIPTION:\n${data.jobDescription.slice(0, 8000)}`
        : "No job description provided - evaluate against general industry expectations for the role implied by the resume.",
      `RESUME:\n${data.resume.slice(0, 20000)}`,
    ].join("\n\n"),
  });

  try {
    const output = await result.output;
    return {
      ...output,
      score: Math.max(0, Math.min(100, Math.round(output.score))),
      categories: output.categories
        .slice(0, 6)
        .map((c) => ({ ...c, score: Math.max(0, Math.min(100, Math.round(c.score))) })),
      issues: output.issues.slice(0, 8),
      improvedBullets: output.improvedBullets.slice(0, 5),
    };
  } catch (error: any) {
    console.error("AI Analysis detailed error:", error);
    const causeMessage = error.cause?.message || (error.cause ? String(error.cause) : "");
    throw new Error(
      `AI Analysis failed: ${error.message || String(error)}${
        causeMessage ? ` (Cause: ${causeMessage})` : ""
      }`
    );
  }
}

export async function improveResume(input: unknown) {
  const data = ImproveInput.parse(input);
  const gateway = createLovableAiGatewayProvider(requireLovableApiKey());
  const result = streamText({
    model: gateway(CHAT_MODEL),
    system: IMPROVE_SYSTEM,
    prompt: [
      data.jobDescription ? `TARGET ROLE:\n${data.jobDescription.slice(0, 8000)}` : "",
      `ORIGINAL RESUME:\n${data.resume.slice(0, 20000)}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  });
  return { text: (await result.text).trim() };
}

export async function generateLatex(input: unknown) {
  const data = LatexInput.parse(input);
  const gateway = createLovableAiGatewayProvider(requireLovableApiKey());
  const result = streamText({
    model: gateway(CHAT_MODEL),
    system: LATEX_SYSTEM,
    prompt: [
      `TASK: ${data.instruction}`,
      data.currentCode ? `CURRENT LATEX DOCUMENT:\n${data.currentCode.slice(0, 20000)}` : "",
      data.resume ? `RESUME CONTENT TO USE:\n${data.resume.slice(0, 20000)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  });
  const text = (await result.text).trim();
  const cleaned = text
    .replace(/^```(?:latex|tex)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return { code: cleaned };
}