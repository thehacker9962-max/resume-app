import sys
import json
import re
from pypdf import PdfReader

def extract_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

def clean_text(text):
    # Remove excessive whitespaces
    return re.sub(r'[ \t]+', ' ', text).strip()

def extract_contact_info(text):
    info = {
        "email": "",
        "phone": "",
        "website": "",
        "linkedin": "",
        "location": ""
    }
    
    # Regex matching
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    if email_match:
        info["email"] = email_match.group(0)
        
    phone_match = re.search(r'\+?\d[\d\-\s\(\)]{8,}\d', text)
    if phone_match:
        info["phone"] = clean_text(phone_match.group(0))
        
    linkedin_match = re.search(r'(linkedin\.com/in/[\w\-]+|linkedin\.com/profile/[\w\-]+)', text, re.IGNORECASE)
    if linkedin_match:
        info["linkedin"] = linkedin_match.group(0)
        
    # Check for github or portfolio sites
    web_match = re.search(r'(https?://)?(www\.)?([a-zA-Z0-9\-]+\.dev|[a-zA-Z0-9\-]+\.io|[a-zA-Z0-9\-]+\.me|[a-zA-Z0-9\-]+\.com)(/[a-zA-Z0-9\-_]+)?', text, re.IGNORECASE)
    if web_match:
        # Ignore linkedin in website if we extracted it already
        url = web_match.group(0)
        if "linkedin" not in url.lower():
            info["website"] = url

    return info

def segment_sections(text):
    lines = [line.strip() for line in text.split('\n')]
    
    sections = {
        "basics": [],
        "summary": [],
        "experience": [],
        "education": [],
        "projects": [],
        "skills": [],
        "certifications": [],
        "leadership": [],
        "keyAchievements": [],
        "internships": []
    }
    
    current_section = "basics"
    
    # Headings keyword maps
    headings = {
        "summary": ["summary", "profile", "professional summary", "about me", "objective", "career objective"],
        "experience": ["experience", "work experience", "employment history", "professional experience", "work history", "employment"],
        "education": ["education", "academic history", "academic background", "qualification", "qualifications"],
        "projects": ["projects", "personal projects", "academic projects", "key projects"],
        "skills": ["skills", "technical skills", "core competencies", "key skills", "expertise"],
        "certifications": ["certifications", "licenses", "courses", "certification"],
        "leadership": ["leadership", "extracurricular", "community", "volunteer", "leadership experience"],
        "keyAchievements": ["achievements", "awards", "key achievements", "honors"],
        "internships": ["internships", "internship"]
    }
    
    for line in lines:
        if not line:
            continue
            
        # Check if line is a section heading
        is_heading = False
        lower_line = line.lower().strip(': \t*#')
        
        # Heading lines are typically short
        if len(lower_line) < 30:
            for sec, keywords in headings.items():
                if lower_line in keywords or any(lower_line == kw for kw in keywords):
                    current_section = sec
                    is_heading = True
                    break
            
        if is_heading:
            continue
            
        sections[current_section].append(line)
        
    return sections

def parse_experience(lines):
    # Rule-based segmenting of experience
    # Typically, a job starts with a Job Title / Company, has a date range (period) and bullet points.
    experiences = []
    current_job = None
    
    # Common date regex: "Jan 2020 - Present", "2018 - 2021", etc.
    date_regex = re.compile(r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[-—–to\s]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present|current)', re.IGNORECASE)
    
    for line in lines:
        # Detect if this line has a date/period and looks like a header line
        date_match = date_regex.search(line)
        
        # A line starting a job often has a company name or role and a date
        # If we detect a new job, save the current one and start a new one
        if date_match or (len(line) < 60 and ("engineer" in line.lower() or "developer" in line.lower() or "manager" in line.lower() or "lead" in line.lower() or "analyst" in line.lower() or "designer" in line.lower() or "intern" in line.lower() or "consultant" in line.lower() or "director" in line.lower())):
            if current_job:
                experiences.append(current_job)
            
            period = date_match.group(0) if date_match else ""
            cleaned_line = line.replace(period, "").strip(', -—–')
            
            # Split role and company if separated by common delimiters
            company = ""
            role = cleaned_line
            for delim in [" at ", " @ ", " - ", " | "]:
                if delim in cleaned_line:
                    parts = cleaned_line.split(delim, 1)
                    role = parts[0].strip()
                    company = parts[1].strip()
                    break
            
            current_job = {
                "role": role,
                "company": company,
                "location": "",
                "period": period,
                "bullets": []
            }
        else:
            # Bullet point or description
            if current_job:
                # Strip leading bullet characters
                cleaned_bullet = re.sub(r'^[•\-\*\s]+', '', line).strip()
                if cleaned_bullet:
                    current_job["bullets"].append(cleaned_bullet)
            else:
                # If we have text before any job header, start an empty one
                current_job = {
                    "role": "Professional Experience",
                    "company": "",
                    "location": "",
                    "period": "",
                    "bullets": [re.sub(r'^[•\-\*\s]+', '', line).strip()]
                }
                
    if current_job:
        experiences.append(current_job)
        
    return experiences

def parse_education(lines):
    education_list = []
    current_edu = None
    
    date_regex = re.compile(r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[-—–to\s]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present|current)', re.IGNORECASE)
    
    for line in lines:
        date_match = date_regex.search(line)
        # Degree keywords
        degree_keywords = ["bachelor", "master", "phd", "b.tech", "m.tech", "b.s", "m.s", "degree", "diploma", "bsc", "msc", "bba", "mba", "hsc", "ssc", "engineering", "science"]
        
        is_new_edu = date_match or any(kw in line.lower() for kw in degree_keywords)
        
        if is_new_edu and len(line) < 80:
            if current_edu:
                education_list.append(current_edu)
                
            period = date_match.group(0) if date_match else ""
            cleaned_line = line.replace(period, "").strip(', -—–')
            
            degree = cleaned_line
            school = ""
            for delim in [" from ", " at ", " - ", " | ", ", "]:
                if delim in cleaned_line:
                    parts = cleaned_line.split(delim, 1)
                    degree = parts[0].strip()
                    school = parts[1].strip()
                    break
                    
            current_edu = {
                "degree": degree,
                "school": school,
                "period": period,
                "detail": ""
            }
        else:
            if current_edu:
                if current_edu["detail"]:
                    current_edu["detail"] += ", " + line.strip()
                else:
                    current_edu["detail"] = line.strip()
            else:
                current_edu = {
                    "degree": "Academic Qualification",
                    "school": line.strip(),
                    "period": "",
                    "detail": ""
                }
                
    if current_edu:
        education_list.append(current_edu)
        
    return education_list

def parse_projects(lines):
    projects = []
    current_proj = None
    
    for line in lines:
        # A project heading is usually short and may contain tech stack in parentheses
        if len(line) < 60 and not line.startswith(('-', '•', '*')):
            if current_proj:
                projects.append(current_proj)
                
            # Extract tech stack in parentheses if exists
            tech = ""
            name = line
            tech_match = re.search(r'\((.*?)\)', line)
            if tech_match:
                tech = tech_match.group(1)
                name = line.replace(tech_match.group(0), "").strip()
            elif ":" in line:
                parts = line.split(":", 1)
                name = parts[0].strip()
                tech = parts[1].strip()
                
            current_proj = {
                "name": name,
                "tech": tech,
                "description": ""
            }
        else:
            if current_proj:
                cleaned_desc = re.sub(r'^[•\-\*\s]+', '', line).strip()
                if current_proj["description"]:
                    current_proj["description"] += " " + cleaned_desc
                else:
                    current_proj["description"] = cleaned_desc
            else:
                current_proj = {
                    "name": "Project",
                    "tech": "",
                    "description": re.sub(r'^[•\-\*\s]+', '', line).strip()
                }
                
    if current_proj:
        projects.append(current_proj)
        
    return projects

def parse_pdf(pdf_path):
    text = extract_text(pdf_path)
    if not text:
        return {"error": "Could not extract text from PDF"}
        
    sections = segment_sections(text)
    contact = extract_contact_info(text)
    
    # Try to extract candidate name from the first few lines of basics
    name = ""
    headline = ""
    basics_lines = sections.get("basics", [])
    
    # Filter out empty or pure contact info lines to find the name
    non_contact_lines = []
    for line in basics_lines:
        clean = line.strip()
        if not clean:
            continue
        # Skip if looks like email, phone, or website
        if "@" in clean or any(kw in clean.lower() for kw in ["linkedin.com", "github.com", "http", "+", "phone"]):
            continue
        non_contact_lines.append(clean)
        
    if len(non_contact_lines) >= 1:
        name = non_contact_lines[0]
    if len(non_contact_lines) >= 2:
        headline = non_contact_lines[1]
        
    # Extract skills: flat list of strings
    skills_raw = sections.get("skills", [])
    skills = []
    for s in skills_raw:
        # Split by common delimiters like comma, pipe, bullet
        parts = re.split(r'[,|•\t]+', s)
        for part in parts:
            cleaned = part.strip()
            if cleaned:
                skills.append(cleaned)
                
    # Extract summary as a single text block
    summary = " ".join(sections.get("summary", []))
    
    # Parse lists
    experience = parse_experience(sections.get("experience", []))
    education = parse_education(sections.get("education", []))
    projects = parse_projects(sections.get("projects", []))
    
    # Certifications: clean list
    certifications = [re.sub(r'^[•\-\*\s]+', '', c).strip() for c in sections.get("certifications", []) if c.strip()]
    
    # Internships: parse similar to experience
    internships = parse_experience(sections.get("internships", []))
    
    # Leadership: parse similar to experience
    leadership = parse_experience(sections.get("leadership", []))
    
    # Key Achievements
    key_achievements = [re.sub(r'^[•\-\*\s]+', '', a).strip() for a in sections.get("keyAchievements", []) if a.strip()]
    
    resume_data = {
        "name": name,
        "headline": headline,
        "email": contact.get("email", ""),
        "phone": contact.get("phone", ""),
        "location": contact.get("location", ""),
        "website": contact.get("website", ""),
        "linkedin": contact.get("linkedin", ""),
        "summary": summary,
        "skills": skills,
        "experience": experience,
        "education": education,
        "projects": projects,
        "certifications": certifications,
        "internships": internships,
        "leadership": leadership,
        "keyAchievements": key_achievements
    }
    
    return resume_data

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file specified"}))
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    try:
        data = parse_pdf(pdf_path)
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
