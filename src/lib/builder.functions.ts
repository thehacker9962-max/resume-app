"use server";

import { streamText, Output } from "ai";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";
import { z } from "zod";
import { headers } from "next/headers";
import {
  createLovableAiGatewayProvider,
  CHAT_MODEL,
  requireLovableApiKey,
} from "./ai-gateway.server";
import {
  BuildInput,
  PolishInput,
  AiResumeSchema,
  BUILD_SYSTEM,
  POLISH_SYSTEM,
} from "./builder.schemas";

const execAsync = promisify(exec);

import { parseResumeTextLocally } from "./parser";

export async function parseResumeText(input: { text: string }) {
  const data = z.object({ text: z.string() }).parse(input);
  try {
    return parseResumeTextLocally(data.text);
  } catch (error: any) {
    return {
      error: `Parsing failed: ${error.message || String(error)}`
    };
  }
}

export async function buildResume(input: unknown) {
  const data = BuildInput.parse(input);
  const gateway = createLovableAiGatewayProvider(requireLovableApiKey(), undefined, {
    structuredOutputs: true,
  });
  const result = streamText({
    model: gateway(CHAT_MODEL),
    system: BUILD_SYSTEM,
    output: Output.object({ schema: AiResumeSchema }),
    prompt: [
      data.targetRole ? `TARGET ROLE: ${data.targetRole.slice(0, 500)}` : "",
      `CANDIDATE INPUT:\n${data.brief.slice(0, 20000)}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  });
  try {
    return await result.output;
  } catch (error: any) {
    console.error("AI Build detailed error:", error);
    const causeMessage = error.cause?.message || (error.cause ? String(error.cause) : "");
    throw new Error(
      `AI Build failed: ${error.message || String(error)}${
        causeMessage ? ` (Cause: ${causeMessage})` : ""
      }`
    );
  }
}

export async function polishResume(input: unknown) {
  const data = PolishInput.parse(input);
  const gateway = createLovableAiGatewayProvider(requireLovableApiKey(), undefined, {
    structuredOutputs: true,
  });
  const result = streamText({
    model: gateway(CHAT_MODEL),
    system: POLISH_SYSTEM,
    output: Output.object({ schema: AiResumeSchema }),
    prompt: [
      data.targetRole ? `TARGET ROLE: ${data.targetRole.slice(0, 500)}` : "",
      `CURRENT RESUME JSON:\n${JSON.stringify(data.data).slice(0, 20000)}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  });
  try {
    return await result.output;
  } catch (error: any) {
    console.error("AI Polish detailed error:", error);
    const causeMessage = error.cause?.message || (error.cause ? String(error.cause) : "");
    throw new Error(
      `AI Polish failed: ${error.message || String(error)}${
        causeMessage ? ` (Cause: ${causeMessage})` : ""
      }`
    );
  }
}
