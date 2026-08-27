import json
import base64
import os
import tempfile
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
    return re.sub(r'[ \t]+', ' ', text).strip()

def extract_contact_info(text):
    info = {
        "email": "",
        "phone": "",
        "website": "",
        "linkedin": "",
        "location": ""
    }
    
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    if email_match:
        info["email"] = email_match.group(0)
        
    phone_match = re.search(r'\+?\d[\d\-\s\(\)]{8,}\d', text)
    if phone_match:
        info["phone"] = clean_text(phone_match.group(0))
        
    linkedin_match = re.search(r'(linkedin\.com/in/[\w\-]+|linkedin\.com/profile/[\w\-]+)', text, re.IGNORECASE)
    if linkedin_match:
        info["linkedin"] = linkedin_match.group(0)
        
    web_match = re.search(r'(https?://)?(www\.)?([a-zA-Z0-9\-]+\.dev|[a-zA-Z0-9\-]+\.io|[a-zA-Z0-9\-]+\.me|[a-zA-Z0-9\-]+\.com)(/[a-zA-Z0-9\-_]+)?', text, re.IGNORECASE)
    if web_match:
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
            
        is_heading = False
        lower_line = line.lower().strip(': \t*#')
        
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
    experiences = []
    current_job = None
    
    date_regex = re.compile(r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[-—–to\s]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present|current)', re.IGNORECASE)
    
    for line in lines:
        date_match = date_regex.search(line)
        
        if date_match or (len(line) < 60 and ("engineer" in line.lower() or "developer" in line.lower() or "manager" in line.lower() or "lead" in line.lower() or "analyst" in line.lower() or "designer" in line.lower() or "intern" in line.lower() or "consultant" in line.lower() or "director" in line.lower())):
            if current_job:
                experiences.append(current_job)
            
            period = date_match.group(0) if date_match else ""
            cleaned_line = line.replace(period, "").strip(', -—–')
            
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
            if current_job:
                cleaned_bullet = re.sub(r'^[•\-\*\s]+', '', line).strip()
                if cleaned_bullet:
                    current_job["bullets"].append(cleaned_bullet)
            else:
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
        if len(line) < 60 and not line.startswith(('-', '•', '*')):
            if current_proj:
                projects.append(current_proj)
                
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
    
    name = ""
    headline = ""
    basics_lines = sections.get("basics", [])
    
    non_contact_lines = []
    for line in basics_lines:
        clean = line.strip()
        if not clean:
            continue
        if "@" in clean or any(kw in clean.lower() for kw in ["linkedin.com", "github.com", "http", "+", "phone"]):
            continue
        non_contact_lines.append(clean)
        
    if len(non_contact_lines) >= 1:
        name = non_contact_lines[0]
    if len(non_contact_lines) >= 2:
        headline = non_contact_lines[1]
        
    skills_raw = sections.get("skills", [])
    skills = []
    for s in skills_raw:
        parts = re.split(r'[,|•\t]+', s)
        for part in parts:
            cleaned = part.strip()
            if cleaned:
                skills.append(cleaned)
                
    summary = " ".join(sections.get("summary", []))
    
    experience = parse_experience(sections.get("experience", []))
    education = parse_education(sections.get("education", []))
    projects = parse_projects(sections.get("projects", []))
    
    certifications = [re.sub(r'^[•\-\*\s]+', '', c).strip() for c in sections.get("certifications", []) if c.strip()]
    internships = parse_experience(sections.get("internships", []))
    leadership = parse_experience(sections.get("leadership", []))
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

def handler(event, context):
    try:
        body_str = event.get("body", "")
        if not body_str:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({"error": "No body provided"})
            }
            
        try:
            if event.get("isBase64Encoded", False):
                # Request body is base64 encoded by API gateway, decode it
                body_bytes = base64.b64decode(body_str)
                body_str = body_bytes.decode("utf-8")
            body = json.loads(body_str)
        except Exception as parse_err:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({"error": f"Invalid JSON body: {str(parse_err)}"})
            }
            
        pdf_base64 = body.get("pdfBase64", "")
        if not pdf_base64:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({"error": "Missing pdfBase64 field"})
            }
            
        pdf_bytes = base64.b64decode(pdf_base64)
        
        # Write to temp file
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_pdf:
            temp_pdf.write(pdf_bytes)
            temp_pdf_path = temp_pdf.name
            
        try:
            result = parse_pdf(temp_pdf_path)
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps(result)
            }
        finally:
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)
                
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)})
        }
