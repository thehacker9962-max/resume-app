import type { ResumeData } from "./builder.schemas";
import samplePortrait from "@/assets/sample-portrait.jpg";

export const SAMPLE_RESUME: ResumeData = {
  name: "Aditi Sharma",
  headline: "Senior Frontend Engineer",
  photo: samplePortrait,
  email: "aditi.sharma@email.com",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  website: "aditi.dev",
  linkedin: "linkedin.com/in/aditisharma",
  summary:
    "Frontend engineer with 6 years building high-traffic React and TypeScript products. Led a checkout rewrite that lifted conversion 18% and mentors four engineers on performance and accessibility.",
  skills: [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "GraphQL",
    "Testing Library",
    "Web Performance",
    "Accessibility (WCAG 2.2)",
    "CI/CD",
    "PostgreSQL",
  ],
  experience: [
    {
      role: "Senior Frontend Engineer",
      company: "Zeta Payments",
      location: "Bengaluru",
      period: "Mar 2022 — Present",
      bullets: [
        "Led a 4-engineer rewrite of the checkout flow, lifting conversion 18% on 2.4M monthly sessions.",
        "Cut initial bundle size 41% through route-level code splitting and image optimisation.",
        "Introduced a design-system package now used by 9 product squads.",
      ],
    },
    {
      role: "Frontend Engineer",
      company: "Kite Analytics",
      location: "Remote",
      period: "Jul 2019 — Feb 2022",
      bullets: [
        "Shipped a real-time dashboard handling 50k events/min with virtualised tables.",
        "Raised automated test coverage from 22% to 78%, halving production regressions.",
      ],
    },
  ],
  education: [
    {
      degree: "B.Tech, Computer Science",
      school: "VIT Vellore",
      period: "2015 — 2019",
      detail: "CGPA 8.7 / 10",
    },
  ],
  projects: [
    {
      name: "Chartkit",
      tech: "TypeScript, Canvas",
      description:
        "Open-source charting library with 1.8k GitHub stars and 40k monthly npm downloads.",
    },
  ],
  certifications: ["AWS Certified Developer — Associate (2024)"],
  internships: [],
  leadership: [],
  keyAchievements: [],
};
