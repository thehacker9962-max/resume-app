import { z } from "zod";

export const ExperienceSchema = z.object({
  role: z.string().default(""),
  company: z.string().default(""),
  location: z.string().default(""),
  period: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
  degree: z.string().default(""),
  school: z.string().default(""),
  period: z.string().default(""),
  detail: z.string().default(""),
});

export const ProjectSchema = z.object({
  name: z.string().default(""),
  tech: z.string().default(""),
  description: z.string().default(""),
});

export const ResumeDataSchema = z.object({
  name: z.string().default(""),
  headline: z.string().default(""),
  photo: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  website: z.string().default(""),
  linkedin: z.string().default(""),
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  certifications: z.array(z.string()).default([]),
  internships: z.array(ExperienceSchema).default([]),
  leadership: z.array(ExperienceSchema).default([]),
  keyAchievements: z.array(z.string()).default([]),
});

/** Schema used for AI output — photo is user-supplied, never generated. */
export const AiResumeSchema = ResumeDataSchema.omit({ photo: true });

export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;

export const BuildInput = z.object({
  brief: z.string().min(20, "Tell us a bit more about your background."),
  targetRole: z.string().default(""),
});

export const PolishInput = z.object({
  data: ResumeDataSchema,
  targetRole: z.string().default(""),
});

export const EMPTY_RESUME: ResumeData = {
  name: "",
  headline: "",
  photo: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  internships: [],
  leadership: [],
  keyAchievements: [],
};

export const BUILD_SYSTEM = `You are an expert resume writer and recruiter.
Turn the candidate's raw notes, pasted old resume or short brief into a complete, structured, ATS-friendly resume.
Rules:
- Never invent details (employers, schools, dates, certifications, projects) not implied by the input; you may sharpen wording and format cleanly.
- Extract information into the correct fields:
  - 'experience': Professional employment history.
  - 'internships': Internship or trainee roles.
  - 'projects': Personal or professional projects (name, tech stack, description).
  - 'education': Degrees, schools, and academic details.
  - 'certifications': Professional certifications/licenses.
  - 'leadership': Leadership roles, student club positions, or community service.
  - 'keyAchievements': Notable high-level achievements, awards, or key highlights.
- Write 3-5 achievement bullets per experience/internship/leadership role, starting with strong past-tense action verbs and including metrics when plausible.
- Summary should be 2-3 sentences, written in the third-person (no "I" or "my").
- Skills should be 8-16 concise, ATS-relevant keywords.
- Leave any field as an empty string or empty array when the corresponding information is genuinely unavailable in the input.`;

export const POLISH_SYSTEM = `You are an expert resume editor. Improve the given structured resume in place:
stronger action verbs, quantified impact, tighter phrasing, better keyword coverage for the target role.
Keep the same jobs, schools, dates and person. Never fabricate employers, degrees or numbers that change meaning.
Return the same JSON structure with improved content.`;
