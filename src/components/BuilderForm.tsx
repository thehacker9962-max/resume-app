import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Education, Experience, Project, ResumeData } from "@/lib/builder.schemas";

type Props = {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function BuilderForm({ data, onChange }: Props) {
  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    onChange({ ...data, [key]: value });

  const updateAt = <T,>(list: T[], index: number, patch: Partial<T>): T[] =>
    list.map((item, i) => (i === index ? { ...item, ...patch } : item));

  function onPhotoFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG or PNG).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Photo must be under 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("photo", String(reader.result ?? ""));
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <section className="panel space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">Basics</h2>
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-4">
          {data.photo ? (
            <img
              src={data.photo}
              alt="Your resume photo"
              width={80}
              height={80}
              loading="lazy"
              className="size-20 rounded-full object-cover"
            />
          ) : (
            <div className="grid size-20 place-items-center rounded-full bg-secondary text-xs text-muted-foreground">
              No photo
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Profile photo — used by the “Photo” templates
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <label className="cursor-pointer">
                  <Upload /> Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPhotoFile(e.target.files?.[0])}
                  />
                </label>
              </Button>
              {data.photo && (
                <Button size="sm" variant="ghost" onClick={() => set("photo", "")}>
                  <Trash2 /> Remove
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tip: many ATS in the US/UK prefer no photo — use a text template there.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={data.name} onChange={(v) => set("name", v)} placeholder="Aditi Sharma" />
          <Field label="Headline" value={data.headline} onChange={(v) => set("headline", v)} placeholder="Senior Frontend Engineer" />
          <Field label="Email" value={data.email} onChange={(v) => set("email", v)} placeholder="you@email.com" />
          <Field label="Phone" value={data.phone} onChange={(v) => set("phone", v)} placeholder="+91 98765 43210" />
          <Field label="Location" value={data.location} onChange={(v) => set("location", v)} placeholder="Bengaluru, India" />
          <Field label="Website / portfolio" value={data.website} onChange={(v) => set("website", v)} placeholder="yoursite.dev" />
          <Field label="LinkedIn" value={data.linkedin} onChange={(v) => set("linkedin", v)} placeholder="linkedin.com/in/you" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Professional summary</Label>
          <Textarea
            value={data.summary}
            onChange={(e) => set("summary", e.target.value)}
            className="min-h-24"
            placeholder="2-3 sentences on your experience, focus areas and biggest wins."
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Skills (comma separated)</Label>
          <Textarea
            value={data.skills.join(", ")}
            onChange={(e) =>
              set(
                "skills",
                e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              )
            }
            className="min-h-20"
            placeholder="React, TypeScript, Node.js, PostgreSQL"
          />
        </div>
      </section>

      <section className="panel space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Experience</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              set("experience", [
                ...data.experience,
                { role: "", company: "", location: "", period: "", bullets: [""] } as Experience,
              ])
            }
          >
            <Plus /> Add role
          </Button>
        </div>
        {data.experience.map((job, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Job title" value={job.role} onChange={(v) => set("experience", updateAt(data.experience, index, { role: v }))} />
              <Field label="Company" value={job.company} onChange={(v) => set("experience", updateAt(data.experience, index, { company: v }))} />
              <Field label="Location" value={job.location} onChange={(v) => set("experience", updateAt(data.experience, index, { location: v }))} />
              <Field label="Period" value={job.period} onChange={(v) => set("experience", updateAt(data.experience, index, { period: v }))} placeholder="Jan 2022 — Present" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Achievement bullets (one per line)</Label>
              <Textarea
                value={job.bullets.join("\n")}
                onChange={(e) =>
                  set("experience", updateAt(data.experience, index, { bullets: e.target.value.split("\n") }))
                }
                className="min-h-24"
                placeholder="Cut page load time 42% by code-splitting the checkout bundle"
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => set("experience", data.experience.filter((_, i) => i !== index))}
            >
              <Trash2 /> Remove role
            </Button>
          </div>
        ))}
      </section>

      <section className="panel space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Education</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => set("education", [...data.education, { degree: "", school: "", period: "", detail: "" } as Education])}
          >
            <Plus /> Add education
          </Button>
        </div>
        {data.education.map((ed, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Degree" value={ed.degree} onChange={(v) => set("education", updateAt(data.education, index, { degree: v }))} />
              <Field label="School" value={ed.school} onChange={(v) => set("education", updateAt(data.education, index, { school: v }))} />
              <Field label="Period" value={ed.period} onChange={(v) => set("education", updateAt(data.education, index, { period: v }))} />
              <Field label="Detail" value={ed.detail} onChange={(v) => set("education", updateAt(data.education, index, { detail: v }))} placeholder="CGPA 8.7 / relevant coursework" />
            </div>
            <Button size="sm" variant="ghost" onClick={() => set("education", data.education.filter((_, i) => i !== index))}>
              <Trash2 /> Remove
            </Button>
          </div>
        ))}
      </section>

      <section className="panel space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Internships</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              set("internships", [
                ...(data.internships || []),
                { role: "", company: "", location: "", period: "", bullets: [""] } as Experience,
              ])
            }
          >
            <Plus /> Add internship
          </Button>
        </div>
        {(data.internships || []).map((job, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Job title" value={job.role} onChange={(v) => set("internships", updateAt(data.internships || [], index, { role: v }))} />
              <Field label="Company / Organization" value={job.company} onChange={(v) => set("internships", updateAt(data.internships || [], index, { company: v }))} />
              <Field label="Location" value={job.location} onChange={(v) => set("internships", updateAt(data.internships || [], index, { location: v }))} />
              <Field label="Period" value={job.period} onChange={(v) => set("internships", updateAt(data.internships || [], index, { period: v }))} placeholder="Jan 2022 — Present" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Achievement bullets (one per line)</Label>
              <Textarea
                value={job.bullets.join("\n")}
                onChange={(e) =>
                  set("internships", updateAt(data.internships || [], index, { bullets: e.target.value.split("\n") }))
                }
                className="min-h-24"
                placeholder="Details of your internship duties and impact"
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => set("internships", (data.internships || []).filter((_, i) => i !== index))}
            >
              <Trash2 /> Remove internship
            </Button>
          </div>
        ))}
      </section>

      <section className="panel space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Projects</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => set("projects", [...data.projects, { name: "", tech: "", description: "" } as Project])}
          >
            <Plus /> Add project
          </Button>
        </div>
        {data.projects.map((project, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Project name" value={project.name} onChange={(v) => set("projects", updateAt(data.projects, index, { name: v }))} />
              <Field label="Tech / stack" value={project.tech} onChange={(v) => set("projects", updateAt(data.projects, index, { tech: v }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={project.description}
                onChange={(e) => set("projects", updateAt(data.projects, index, { description: e.target.value }))}
                className="min-h-20"
              />
            </div>
            <Button size="sm" variant="ghost" onClick={() => set("projects", data.projects.filter((_, i) => i !== index))}>
              <Trash2 /> Remove project
            </Button>
          </div>
        ))}
      </section>

      <section className="panel space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Leadership & Community</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              set("leadership", [
                ...(data.leadership || []),
                { role: "", company: "", location: "", period: "", bullets: [""] } as Experience,
              ])
            }
          >
            <Plus /> Add leadership role
          </Button>
        </div>
        {(data.leadership || []).map((job, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Role title" value={job.role} onChange={(v) => set("leadership", updateAt(data.leadership || [], index, { role: v }))} />
              <Field label="Organization" value={job.company} onChange={(v) => set("leadership", updateAt(data.leadership || [], index, { company: v }))} />
              <Field label="Location" value={job.location} onChange={(v) => set("leadership", updateAt(data.leadership || [], index, { location: v }))} />
              <Field label="Period" value={job.period} onChange={(v) => set("leadership", updateAt(data.leadership || [], index, { period: v }))} placeholder="Jan 2022 — Present" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Bullets (one per line)</Label>
              <Textarea
                value={job.bullets.join("\n")}
                onChange={(e) =>
                  set("leadership", updateAt(data.leadership || [], index, { bullets: e.target.value.split("\n") }))
                }
                className="min-h-24"
                placeholder="Leadership highlights, community service, or student clubs"
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => set("leadership", (data.leadership || []).filter((_, i) => i !== index))}
            >
              <Trash2 /> Remove leadership role
            </Button>
          </div>
        ))}
      </section>

      <section className="panel space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Certifications</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => set("certifications", [...data.certifications, ""])}
          >
            <Plus /> Add certification
          </Button>
        </div>
        <div className="space-y-3">
          {data.certifications.map((cert, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={cert}
                onChange={(e) => {
                  const copy = [...data.certifications];
                  copy[index] = e.target.value;
                  set("certifications", copy);
                }}
                placeholder="AWS Certified Solutions Architect — Associate (2024)"
              />
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => set("certifications", data.certifications.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Key Achievements</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => set("keyAchievements", [...(data.keyAchievements || []), ""])}
          >
            <Plus /> Add achievement
          </Button>
        </div>
        <div className="space-y-3">
          {(data.keyAchievements || []).map((ach, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={ach}
                onChange={(e) => {
                  const copy = [...(data.keyAchievements || [])];
                  copy[index] = e.target.value;
                  set("keyAchievements", copy);
                }}
                placeholder="Highlight your impact, e.g. Led a team of 10..."
              />
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => set("keyAchievements", (data.keyAchievements || []).filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
