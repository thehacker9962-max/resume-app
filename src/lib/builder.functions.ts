"use server";

import { streamText, Output } from "ai";
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

  // Helper to invoke the Netlify Python Serverless Function
  async function callNetlifyFunction() {
    const siteUrl = process.env.URL || "";
    const response = await fetch(`${siteUrl}/.netlify/functions/parser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfBase64: data.pdfBase64 }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Netlify Python function failed with status ${response.status}: ${errorText}`);
    }
    return await response.json();
  }

  // 1. Check if running in a serverless environment (Netlify, AWS Lambda, etc.)
  const isServerless = process.env.NETLIFY || process.env.SITE_NAME || process.env.URL || process.env.LAMBDA_TASK_ROOT;
  if (isServerless) {
    try {
      return await callNetlifyFunction();
    } catch (err: any) {
      return {
        error: `Netlify Python function failed: ${err.message || String(err)}`
      };
    }
  }

  // 2. Otherwise (locally), try to run using the local python executable
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
      
      // Fallback: If python is not found, attempt to call the Netlify serverless function
      if (errorMsg.includes("not found") || errorMsg.includes("ENOENT") || errorMsg.includes("command not found")) {
        console.log("Python not found locally, falling back to Netlify function...");
        try {
          return await callNetlifyFunction();
        } catch (fallbackErr: any) {
          return {
            error: `Python command not found locally, and serverless fallback failed: ${fallbackErr.message || String(fallbackErr)}`
          };
        }
      }
      
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
