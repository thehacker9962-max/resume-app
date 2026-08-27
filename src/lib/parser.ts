import { z } from "zod";

interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

interface Education {
  degree: string;
  school: string;
  period: string;
  detail: string;
}

interface Project {
  name: string;
  tech: string;
  description: string;
}

function cleanText(text: string): string {
  return text.replace(/[ \t]+/g, ' ').trim();
}

function extractContactInfo(text: string) {
  const info = {
    email: "",
    phone: "",
    website: "",
    linkedin: "",
    location: ""
  };
  
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  if (emailMatch) {
    info.email = emailMatch[0];
  }
  
  const phoneMatch = text.match(/\+?\d[\d\-\s\(\)]{8,}\d/);
  if (phoneMatch) {
    info.phone = cleanText(phoneMatch[0]);
  }
  
  const linkedinMatch = text.match(/(linkedin\.com\/in\/[\w\-]+|linkedin\.com\/profile\/[\w\-]+)/i);
  if (linkedinMatch) {
    info.linkedin = linkedinMatch[0];
  }
  
  const webMatch = text.match(/(https?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.dev|[a-zA-Z0-9\-]+\.io|[a-zA-Z0-9\-]+\.me|[a-zA-Z0-9\-]+\.com)(\/[a-zA-Z0-9\-_]+)?/i);
  if (webMatch) {
    const url = webMatch[0];
    if (!url.toLowerCase().includes("linkedin")) {
      info.website = url;
    }
  }
  
  return info;
}

function segmentSections(text: string) {
  const lines = text.split('\n').map(line => line.trim());
  const sections: Record<string, string[]> = {
    basics: [],
    summary: [],
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    leadership: [],
    keyAchievements: [],
    internships: []
  };
  
  let currentSection = "basics";
  
  const headings: Record<string, string[]> = {
    summary: ["summary", "profile", "professional summary", "about me", "objective", "career objective"],
    experience: ["experience", "work experience", "employment history", "professional experience", "work history", "employment"],
    education: ["education", "academic history", "academic background", "qualification", "qualifications"],
    projects: ["projects", "personal projects", "academic projects", "key projects"],
    skills: ["skills", "technical skills", "core competencies", "key skills", "expertise"],
    certifications: ["certifications", "licenses", "courses", "certification"],
    leadership: ["leadership", "extracurricular", "community", "volunteer", "leadership experience"],
    keyAchievements: ["achievements", "awards", "key achievements", "honors"],
    internships: ["internships", "internship"]
  };
  
  for (const line of lines) {
    if (!line) continue;
    
    let isHeading = false;
    const lowerLine = line.toLowerCase().replace(/[: \t*#]/g, '').trim();
    
    if (lowerLine.length < 30) {
      for (const [sec, keywords] of Object.entries(headings)) {
        if (keywords.includes(lowerLine)) {
          currentSection = sec;
          isHeading = true;
          break;
        }
      }
    }
    
    if (isHeading) continue;
    sections[currentSection].push(line);
  }
  
  return sections;
}

function parseExperience(lines: string[]): Experience[] {
  const experiences: Experience[] = [];
  let currentJob: Experience | null = null;
  
  const dateRegex = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[-—–to\s]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present|current)/i;
  
  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    const hasHeaderKeywords = line.length < 60 && (
      /engineer/i.test(line) ||
      /developer/i.test(line) ||
      /manager/i.test(line) ||
      /lead/i.test(line) ||
      /analyst/i.test(line) ||
      /designer/i.test(line) ||
      /intern/i.test(line) ||
      /consultant/i.test(line) ||
      /director/i.test(line)
    );
    
    if (dateMatch || hasHeaderKeywords) {
      if (currentJob) {
        experiences.push(currentJob);
      }
      
      const period = dateMatch ? dateMatch[0] : "";
      const cleanedLine = line.replace(period, "").replace(/^[, \-—–]+|[, \-—–]+$/g, "").trim();
      
      let company = "";
      let role = cleanedLine;
      
      const delims = [" at ", " @ ", " - ", " | "];
      for (const delim of delims) {
        if (cleanedLine.includes(delim)) {
          const parts = cleanedLine.split(delim);
          role = parts[0].trim();
          company = parts.slice(1).join(delim).trim();
          break;
        }
      }
      
      currentJob = {
        role,
        company,
        location: "",
        period,
        bullets: []
      };
    } else {
      if (currentJob) {
        const cleanedBullet = line.replace(/^[•\-\*\s]+/g, "").trim();
        if (cleanedBullet) {
          currentJob.bullets.push(cleanedBullet);
        }
      } else {
        currentJob = {
          role: "Professional Experience",
          company: "",
          location: "",
          period: "",
          bullets: [line.replace(/^[•\-\*\s]+/g, "").trim()]
        };
      }
    }
  }
  
  if (currentJob) {
    experiences.push(currentJob);
  }
  
  return experiences;
}

function parseEducation(lines: string[]): Education[] {
  const educationList: Education[] = [];
  let currentEdu: Education | null = null;
  
  const dateRegex = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[-—–to\s]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present|current)/i;
  const degreeKeywords = ["bachelor", "master", "phd", "b.tech", "m.tech", "b.s", "m.s", "degree", "diploma", "bsc", "msc", "bba", "mba", "hsc", "ssc", "engineering", "science"];
  
  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    const hasDegreeKeyword = degreeKeywords.some(kw => line.toLowerCase().includes(kw));
    const isNewEdu = dateMatch || hasDegreeKeyword;
    
    if (isNewEdu && line.length < 80) {
      if (currentEdu) {
        educationList.push(currentEdu);
      }
      
      const period = dateMatch ? dateMatch[0] : "";
      const cleanedLine = line.replace(period, "").replace(/^[, \-—–]+|[, \-—–]+$/g, "").trim();
      
      let degree = cleanedLine;
      let school = "";
      
      const delims = [" from ", " at ", " - ", " | ", ", "];
      for (const delim of delims) {
        if (cleanedLine.includes(delim)) {
          const parts = cleanedLine.split(delim);
          degree = parts[0].trim();
          school = parts.slice(1).join(delim).trim();
          break;
        }
      }
      
      currentEdu = {
        degree,
        school,
        period,
        detail: ""
      };
    } else {
      if (currentEdu) {
        if (currentEdu.detail) {
          currentEdu.detail += ", " + line.trim();
        } else {
          currentEdu.detail = line.trim();
        }
      } else {
        currentEdu = {
          degree: "Academic Qualification",
          school: line.trim(),
          period: "",
          detail: ""
        };
      }
    }
  }
  
  if (currentEdu) {
    educationList.push(currentEdu);
  }
  
  return educationList;
}

function parseProjects(lines: string[]): Project[] {
  const projects: Project[] = [];
  let currentProj: Project | null = null;
  
  for (const line of lines) {
    if (line.length < 60 && !line.startsWith("-") && !line.startsWith("•") && !line.startsWith("*")) {
      if (currentProj) {
        projects.push(currentProj);
      }
      
      let tech = "";
      let name = line;
      
      const techMatch = line.match(/\((.*?)\)/);
      if (techMatch) {
        tech = techMatch[1];
        name = line.replace(techMatch[0], "").trim();
      } else if (line.includes(":")) {
        const parts = line.split(":");
        name = parts[0].trim();
        tech = parts.slice(1).join(":").trim();
      }
      
      currentProj = {
        name,
        tech,
        description: ""
      };
    } else {
      const cleanedDesc = line.replace(/^[•\-\*\s]+/g, "").trim();
      if (currentProj) {
        if (currentProj.description) {
          currentProj.description += " " + cleanedDesc;
        } else {
          currentProj.description = cleanedDesc;
        }
      } else {
        currentProj = {
          name: "Project",
          tech: "",
          description: cleanedDesc
        };
      }
    }
  }
  
  if (currentProj) {
    projects.push(currentProj);
  }
  
  return projects;
}

export function parseResumeTextLocally(text: string) {
  if (!text) {
    return { error: "No text provided" };
  }
  
  const sections = segmentSections(text);
  const contact = extractContactInfo(text);
  
  let name = "";
  let headline = "";
  const basicsLines = sections.basics || [];
  
  const nonContactLines = [];
  for (const line of basicsLines) {
    const clean = line.trim();
    if (!clean) continue;
    if (clean.includes("@") || /linkedin\.com/i.test(clean) || /github\.com/i.test(clean) || /http/i.test(clean) || clean.includes("+") || /phone/i.test(clean)) {
      continue;
    }
    nonContactLines.push(clean);
  }
  
  if (nonContactLines.length >= 1) {
    name = nonContactLines[0];
  }
  if (nonContactLines.length >= 2) {
    headline = nonContactLines[1];
  }
  
  const skillsRaw = sections.skills || [];
  const skills: string[] = [];
  for (const s of skillsRaw) {
    const parts = s.split(/[,|•\t]+/);
    for (const part of parts) {
      const cleaned = part.trim();
      if (cleaned) {
        skills.push(cleaned);
      }
    }
  }
  
  const summary = (sections.summary || []).join(" ");
  
  const experience = parseExperience(sections.experience || []);
  const education = parseEducation(sections.education || []);
  const projects = parseProjects(sections.projects || []);
  
  const certifications = (sections.certifications || [])
    .map(c => c.replace(/^[•\-\*\s]+/g, "").trim())
    .filter(Boolean);
    
  const internships = parseExperience(sections.internships || []);
  const leadership = parseExperience(sections.leadership || []);
  const keyAchievements = (sections.keyAchievements || [])
    .map(a => a.replace(/^[•\-\*\s]+/g, "").trim())
    .filter(Boolean);
    
  return {
    name,
    headline,
    email: contact.email,
    phone: contact.phone,
    location: contact.location,
    website: contact.website,
    linkedin: contact.linkedin,
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    internships,
    leadership,
    keyAchievements
  };
}
