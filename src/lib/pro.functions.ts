import { createServerFn } from "@tanstack/react-start";
import { streamText, Output } from "ai";
import {
  createLovableAiGatewayProvider,
  CHAT_MODEL,
  requireLovableApiKey,
} from "./ai-gateway.server";
import {
  CoverLetterInput,
  CoverLetterOutputSchema,
  InterviewPrepInput,
  InterviewPrepOutputSchema,
  AnswerEvaluationInput,
  AnswerEvaluationOutputSchema,
} from "./pro.schemas";

export const generateCoverLetter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CoverLetterInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = createLovableAiGatewayProvider(requireLovableApiKey(), undefined, {
      structuredOutputs: true,
    });
    
    const systemPrompt = `You are a professional executive writer and career advisor.
Generate a tailored, high-converting cover letter based on the candidate's resume and target job description.
The cover letter should speak in the requested tone:
- 'professional': Objective, polished, standard corporate.
- 'confident': Strong assertion of impact, leadership, direct and active language.
- 'creative': Engaging, storytelling focus, conversational but professional.
- 'academic': Methodical, detail-oriented, research/credentials focused.
- 'warm': Friendly, relational, emphasizing culture fit and enthusiasm.

Structure the letter body with proper greetings, introduction, 2-3 body paragraphs highlighting relevant experience and impact, and a strong call-to-action closing.
In addition, provide 3 actionable tailoring recommendations to help the candidate stand out.`;

    const result = streamText({
      model: gateway(CHAT_MODEL),
      system: systemPrompt,
      output: Output.object({ schema: CoverLetterOutputSchema }),
      prompt: `RESUME DETAILS:\n${data.resumeData}\n\nJOB DESCRIPTION:\n${data.jobDescription}\n\nREQUESTED TONE: ${data.tone}`,
    });

    try {
      return await result.output;
    } catch (error: any) {
      console.error("AI Cover Letter Generation failed:", error);
      throw new Error(`Cover Letter Generation failed: ${error.message || String(error)}`);
    }
  });

export const generateInterviewQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InterviewPrepInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = createLovableAiGatewayProvider(requireLovableApiKey(), undefined, {
      structuredOutputs: true,
    });
    
    const systemPrompt = `You are a senior hiring manager and tech recruiter.
Analyze the candidate's resume and the target job description to generate 5 high-yield interview questions:
- 2 behavioral questions (using typical STAR-method prompts).
- 2 technical/role-specific questions targeting the core skills required.
- 1 situational/problem-solving question.

For each question:
- Explain why this is being asked (the recruiter's underlying motive).
- Provide structural tips on how to frame the response.
- Specify 3-4 ideal keywords/concepts to include in the answer.`;

    const result = streamText({
      model: gateway(CHAT_MODEL),
      system: systemPrompt,
      output: Output.object({ schema: InterviewPrepOutputSchema }),
      prompt: `RESUME DETAILS:\n${data.resumeData}\n\nJOB DESCRIPTION:\n${data.jobDescription}`,
    });

    try {
      return await result.output;
    } catch (error: any) {
      console.error("AI Interview Prep Generation failed:", error);
      throw new Error(`Interview Prep Generation failed: ${error.message || String(error)}`);
    }
  });

export const evaluateInterviewAnswer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AnswerEvaluationInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = createLovableAiGatewayProvider(requireLovableApiKey(), undefined, {
      structuredOutputs: true,
    });
    
    const systemPrompt = `You are an expert mock interview evaluator.
Evaluate the user's response to the interview question.
Analyze for:
- Completeness and structure (ideally following the STAR method for behavioral questions).
- Use of positive impact, active language, and metrics.
- Clarity and professional demeanor.

Provide:
- A score from 0 to 100.
- A list of clear strengths.
- A list of specific weaknesses.
- Actionable suggestions to rewrite or expand sections.
- A sample answer showing how they could ideally express their experiences to hit the key points.`;

    const result = streamText({
      model: gateway(CHAT_MODEL),
      system: systemPrompt,
      output: Output.object({ schema: AnswerEvaluationOutputSchema }),
      prompt: `QUESTION: ${data.question}\n\nTIPS PROVIDED: ${data.tips}\n\nCANDIDATE ANSWER:\n${data.userAnswer}`,
    });

    try {
      return await result.output;
    } catch (error: any) {
      console.error("AI Answer Evaluation failed:", error);
      throw new Error(`Answer Evaluation failed: ${error.message || String(error)}`);
    }
  });
