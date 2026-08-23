import { z } from "zod";

export const CoverLetterInput = z.object({
  resumeData: z.string(),
  jobDescription: z.string(),
  tone: z.enum(["professional", "confident", "creative", "academic", "warm"]).default("professional"),
});

export const CoverLetterOutputSchema = z.object({
  subjectLine: z.string(),
  letterBody: z.string(),
  tailoringRecommendations: z.array(z.string()),
});

export const InterviewPrepInput = z.object({
  resumeData: z.string(),
  jobDescription: z.string(),
});

export const InterviewQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["behavioral", "technical", "situational"]),
  reason: z.string(),
  tips: z.string(),
  idealKeywords: z.array(z.string()),
});

export const InterviewPrepOutputSchema = z.object({
  roleTitle: z.string(),
  questions: z.array(InterviewQuestionSchema),
});

export const AnswerEvaluationInput = z.object({
  question: z.string(),
  userAnswer: z.string(),
  tips: z.string(),
});

export const AnswerEvaluationOutputSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.string(),
  sampleAnswer: z.string(),
});
