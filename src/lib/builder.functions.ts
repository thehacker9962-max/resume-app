"use server";

import { streamText, Output, generateText } from "ai";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";
import { z } from "zod";
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

export async function parseResumePdfWithPython(input: { pdfBase64: string }) {
  const data = z.object({ pdfBase64: z.string() }).parse(input);
  const tempDir = tmpdir();
  const tempFilePath = path.join(tempDir, `resume_${Date.now()}.pdf`);
  
  // Write base64 buffer to temp file
  const buffer = Buffer.from(data.pdfBase64, "base64");
  await fs.writeFile(tempFilePath, buffer);
  
  try {
    const scriptPath = path.resolve(process.cwd(), "src", "lib", "parser.py");
    
    let stdout = "";
    let stderr = "";
    try {
      const result = await execAsync(`python "${scriptPath}" "${tempFilePath}"`);
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (err: any) {
      stdout = err.stdout || "";
      stderr = err.stderr || "";
      const errorMsg = err.message || String(err);
      return {
        error: `Python execution failed.\nDetails: ${errorMsg}\nStdout: ${stdout}\nStderr: ${stderr}`
      };
    }
    
    if (stderr) {
      console.error("Python parser stderr:", stderr);
    }
    
    try {
      const result = JSON.parse(stdout);
      return result;
    } catch (jsonErr) {
      return {
        error: `Python output could not be parsed as JSON.\nStdout: ${stdout}\nStderr: ${stderr}`
      };
    }
  } finally {
    // Clean up
    await fs.unlink(tempFilePath).catch(() => {});
  }
}

export async function checkAiConfigured() {
  try {
    requireLovableApiKey();
    return true;
  } catch {
    return false;
  }
}

export async function parseResumeTextWithAi(input: { text: string }) {
  const { text } = z.object({ text: z.string() }).parse(input);
  const gateway = createLovableAiGatewayProvider(requireLovableApiKey(), undefined, {
    structuredOutputs: true,
  });

  try {
    const result = await generateText({
      model: gateway(CHAT_MODEL),
      system: `You are an expert resume parser. Extract the structured details of the candidate's resume from the raw text provided.
You must map the extracted content to the fields of the schema.
Return only the structured JSON representation of the resume details.`,
      output: Output.object({ schema: AiResumeSchema }),
      prompt: text.slice(0, 30000),
    });

    return result.output;
  } catch (error: any) {
    console.error("AI Parsing detailed error:", error);
    const causeMessage = error.cause?.message || (error.cause ? String(error.cause) : "");
    return {
      error: `AI Parsing failed: ${error.message || String(error)}${
        causeMessage ? ` (Cause: ${causeMessage})` : ""
      }`
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
