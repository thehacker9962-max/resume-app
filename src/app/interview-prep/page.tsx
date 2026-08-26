"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, MessageSquare, Check, Brain, Loader2, ArrowRight, Lock, Zap, Award, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/hooks/use-auth";
import { generateInterviewQuestions, evaluateInterviewAnswer } from "@/lib/pro.functions";
import { UpgradeModal } from "@/components/UpgradeModal";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useNavigate } from "@/hooks/use-navigate";

type Question = {
  id: string;
  question: string;
  type: "behavioral" | "technical" | "situational";
  reason: string;
  tips: string;
  idealKeywords: string[];
};

type Evaluation = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string;
  sampleAnswer: string;
};

export default function InterviewPrepPage() {
  const {
    isAuthenticated,
    subscriptionTier,
    upgradeToTier,
    canPrepInterview,
    registerInterviewPrep,
  } = useAuth();
  const navigate = useNavigate();

  const [resumeData, setResumeData] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const isPremium = subscriptionTier === "pro" || subscriptionTier === "elite";

  const generate = useMutation({
    mutationFn: () => generateInterviewQuestions({ resumeData, jobDescription }),
    onSuccess: (result) => {
      setQuestions(result.questions);
      setSelectedQuestion(result.questions[0] || null);
      setEvaluations({});
      setUserAnswer("");
      registerInterviewPrep();
      toast.success("Mock interview questions ready!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate interview questions.");
    },
  });

  const handleGenerate = () => {
    if (!canPrepInterview()) {
      setIsUpgradeModalOpen(true);
      return;
    }
    generate.mutate();
  };

  const evaluate = useMutation({
    mutationFn: (q: Question) =>
      evaluateInterviewAnswer({
        question: q.question,
        userAnswer,
        tips: q.tips,
      }),
    onSuccess: (result, q) => {
      setEvaluations((prev) => ({ ...prev, [q.id]: result }));
      toast.success("Answer evaluated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to evaluate answer.");
    },
  });

  const loadSampleData = () => {
    setResumeData(
      `Name: Jane Doe\nSkills: React, Node.js, TypeScript, PostgreSQL, AWS\nExperience: 3 years as Fullstack Engineer at Techcorp. Led checkout rewrite, reducing bounce rates by 12%. Automated deployments on AWS, reducing release cycles from days to hours.\nEducation: B.S. in Computer Science`
    );
    setJobDescription(
      `We are looking for a Senior Full Stack Engineer proficient in React, Node.js, and TypeScript. Experience with AWS cloud infrastructure and optimizing user experiences is highly desired.`
    );
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        
        {/* Header */}
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Brain className="size-3.5 text-primary" /> Pro Feature
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            AI Interview Prep Assistant
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Generate custom behavioral and technical questions matching your background. Submit responses for instant score-based evaluations.
          </p>
        </header>

        {/* Access Gate */}
        {!isPremium ? (
          <div className="panel mt-10 p-8 text-center max-w-2xl mx-auto border-2 border-primary/30 relative overflow-hidden bg-card">
            <div className="absolute inset-0 bg-surface-glow pointer-events-none opacity-20" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-3 bg-primary/10 rounded-full text-primary mb-4">
                <Lock className="size-6" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Unlock Interview Prep Tool</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Mock interview question generation and instant evaluation is a premium feature. Upgrade to Pro or Elite to practice and excel.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
                {isAuthenticated ? (
                  <Button className="w-full font-semibold bg-gradient-brand shadow-md text-black" size="lg" onClick={() => upgradeToTier("pro")}>
                    <Zap className="size-4 mr-2 fill-black" /> Upgrade to Pro
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" onClick={() => navigate({ to: "/auth", search: { redirect: "/interview-prep" } })}>
                    Sign In to Upgrade
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/pricing" })}>
                  View Pricing Plans <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </div>

              <div className="mt-8 border-t border-border w-full pt-6 grid grid-cols-2 gap-4 text-left max-w-md text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>Behavioral & Tech Scenarios</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>Score Diagnostics (0-100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>Suggestions for Improvement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>Sample Model Answers</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10">
            {questions.length === 0 ? (
              /* Step 1: Input Page */
              <div className="panel p-6 bg-card border border-border max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-semibold text-sm">Mock Interview Setup</h3>
                  <Button variant="ghost" size="sm" onClick={loadSampleData} className="text-xs text-primary hover:text-primary/80">
                    Load Sample Data
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="resume" className="text-xs">Your Resume highlights</Label>
                  <Textarea
                    id="resume"
                    value={resumeData}
                    onChange={(e) => setResumeData(e.target.value)}
                    placeholder="Paste resume skills, projects, and work history highlights..."
                    className="min-h-36 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job" className="text-xs">Job Description / Target Role</Label>
                  <Textarea
                    id="job"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description of the position you are targeting..."
                    className="min-h-36 text-xs"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generate.isPending || !resumeData.trim() || !jobDescription.trim()}
                  className="w-full font-semibold shadow-md shadow-primary/10"
                >
                  {generate.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2 size-4" />
                      Generating custom questions...
                    </>
                  ) : (
                    <>
                      <Brain className="size-4 mr-2" />
                      Start Mock Interview
                    </>
                  )}
                </Button>
              </div>
            ) : (
              /* Step 2: Practice Dashboard */
              <div className="grid gap-6 md:grid-cols-12">
                
                {/* Left side: Questions selector */}
                <div className="md:col-span-4 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Questions</span>
                    <Button variant="ghost" size="sm" onClick={() => setQuestions([])} className="h-7 text-xs px-2">
                      Reset Setup
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {questions.map((q, idx) => {
                      const evaluated = !!evaluations[q.id];
                      const score = evaluations[q.id]?.score;
                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setSelectedQuestion(q);
                            setUserAnswer("");
                          }}
                          className={cn(
                            "w-full text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer flex flex-col gap-1.5 bg-card",
                            selectedQuestion?.id === q.id
                              ? "border-primary ring-1 ring-primary"
                              : "border-border hover:border-border/80"
                          )}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                              Q{idx + 1} &bull; {q.type}
                            </span>
                            {evaluated && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                <Award className="size-3" /> {score}/100
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-foreground/90 line-clamp-2">{q.question}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right side: Practice and Evaluation area */}
                <div className="md:col-span-8 space-y-6">
                  {selectedQuestion && (
                    <div className="space-y-6">
                      
                      {/* Question focus block */}
                      <div className="panel p-5 bg-card border border-border">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{selectedQuestion.type} Scenario</span>
                        <h2 className="mt-1 font-display text-base font-bold text-foreground">{selectedQuestion.question}</h2>
                        
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs border-t border-border pt-4">
                          <div>
                            <span className="font-semibold text-muted-foreground flex items-center gap-1">
                              <HelpCircle className="size-3.5 text-primary" /> Recruiter's Intent:
                            </span>
                            <p className="mt-1 text-muted-foreground/80 leading-relaxed">{selectedQuestion.reason}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground flex items-center gap-1">
                              <Sparkles className="size-3.5 text-primary" /> Strategy Tips:
                            </span>
                            <p className="mt-1 text-muted-foreground/80 leading-relaxed">{selectedQuestion.tips}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-semibold text-muted-foreground mr-1">Suggested terms:</span>
                          {selectedQuestion.idealKeywords.map((kw, i) => (
                            <span key={i} className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Practice inputs */}
                      <div className="panel p-5 bg-card border border-border space-y-4">
                        <Label htmlFor="answer" className="text-xs font-bold text-foreground">Draft Your Response</Label>
                        <Textarea
                          id="answer"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Type or paste your response here. For behavioral prompts, try using the STAR format (Situation, Task, Action, Result)..."
                          className="min-h-32 text-xs"
                          disabled={evaluate.isPending}
                        />

                        <div className="flex justify-end">
                          <Button
                            onClick={() => evaluate.mutate(selectedQuestion)}
                            disabled={evaluate.isPending || userAnswer.trim().length < 10}
                            className="font-semibold"
                          >
                            {evaluate.isPending ? (
                              <>
                                <Loader2 className="animate-spin size-4 mr-2" />
                                Evaluating response...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="size-4 mr-2" />
                                Submit Answer for Evaluation
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Evaluation results */}
                      {evaluations[selectedQuestion.id] && (
                        <div className="panel p-6 bg-card border border-border space-y-5 animate-fade-in-down">
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                              <Award className="size-4.5 text-primary" /> Evaluation Diagnostic
                            </h3>
                            <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1 text-xs font-extrabold text-primary">
                              Score: {evaluations[selectedQuestion.id].score}/100
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2 text-xs">
                            <div className="space-y-1.5">
                              <span className="font-bold text-emerald-600 uppercase tracking-wide">Strengths</span>
                              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                {evaluations[selectedQuestion.id].strengths.map((str, i) => (
                                  <li key={i}>{str}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-1.5">
                              <span className="font-bold text-destructive uppercase tracking-wide">Areas to Improve</span>
                              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                {evaluations[selectedQuestion.id].weaknesses.map((weak, i) => (
                                  <li key={i}>{weak}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-1 border-t border-border pt-4 text-xs">
                            <span className="font-bold text-foreground block">AI Rewrite Suggestions:</span>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{evaluations[selectedQuestion.id].suggestions}</p>
                          </div>

                          <div className="space-y-2 border-t border-border pt-4 text-xs">
                            <span className="font-bold text-foreground block">Ideal Response Model:</span>
                            <article className="rounded-lg bg-secondary/35 border border-border p-4 text-muted-foreground leading-relaxed italic">
                              "{evaluations[selectedQuestion.id].sampleAnswer}"
                            </article>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

      </main>
      <SiteFooter />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason="Upgrade to Pro to unlock mock interview prep and evaluation metrics."
      />
    </>
  );
}
