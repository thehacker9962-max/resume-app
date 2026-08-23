import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, HelpCircle, Sparkles, Star, Zap, Shield, HelpCircle as HelpIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { useLocationPricing } from "@/hooks/use-location-pricing";
import { createPaymentOrder, verifyPaymentSignature } from "@/lib/payment.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: `Pricing Plans — Unlock Pro Features | ${SITE_NAME}` },
      {
        name: "description",
        content: `Choose the perfect plan to boost your job applications. Upgrade to ${SITE_NAME} Pro for unlimited AI resume builders, ATS score optimizations, and professional templates.`,
      },
      { property: "og:title", content: `Pricing Plans — Unlock Pro Features | ${SITE_NAME}` },
      {
        property: "og:description",
        content: "Check pricing options for our advanced AI resume builder, cover letter generator, and ATS checker.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/pricing` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/pricing` }],
  }),
  component: PricingPage,
});

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function PricingPage() {
  const { user, isAuthenticated, subscriptionTier, upgradeToTier } = useAuth();
  const { currency, symbol, proPrice, elitePrice, gateway, loading } = useLocationPricing();

  const createOrderFn = useServerFn(createPaymentOrder);
  const verifySigFn = useServerFn(verifyPaymentSignature);

  const handleUpgrade = async (tier: "pro" | "elite") => {
    if (!isAuthenticated) {
      toast.error("Please sign in or register an account before upgrading.");
      return;
    }
    
    const toastId = toast.loading("Initializing secure payment session...");
    try {
      const order = await createOrderFn({ data: { tier, gateway } });
      
      if (gateway === "razorpay") {
        const loaded = await loadRazorpay();
        if (!loaded) {
          toast.error("Failed to load payment checkout script. Please check your network.", { id: toastId });
          return;
        }

        toast.dismiss(toastId);

        const options = {
          key: "rzp_test_dummyKeyId", // Simulated test Razorpay Key ID
          amount: order.amount * 100, // amount in paisa
          currency: order.currency,
          name: SITE_NAME,
          description: `Upgrade account to ${tier.toUpperCase()}`,
          order_id: order.orderId,
          handler: async function (response: any) {
            const verifyId = toast.loading("Verifying transaction credentials...");
            try {
              const verification = await verifySigFn({
                data: {
                  tier,
                  gateway: "razorpay",
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }
              });
              if (verification.success) {
                upgradeToTier(tier);
                toast.success(`Welcome to the ${tier.toUpperCase()} Plan!`, { id: verifyId });
              }
            } catch (err) {
              toast.error("Payment verification signature error.", { id: verifyId });
            }
          },
          prefill: {
            email: user?.email || "",
            name: user?.name || "",
          },
          theme: {
            color: "#0D9488",
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        toast.success("Redirecting to secure Stripe checkout portal...", { id: toastId });
        setTimeout(async () => {
          const verification = await verifySigFn({
            data: {
              tier,
              gateway: "stripe",
              stripe_session_id: order.orderId,
            }
          });
          if (verification.success) {
            upgradeToTier(tier);
            toast.success(`Welcome to the ${tier.toUpperCase()} Plan!`);
          }
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize order.", { id: toastId });
    }
  };

  return (
    <>
      <SiteHeader />
      
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-accent opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.187rem]" />
      </div>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="size-3.5 fill-primary" /> Premium Capabilities
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Choose the right plan for <br />
            <span className="text-gradient-brand">your career growth</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Get premium resume designs, advanced AI cover letters, mock interviews, and exports to accelerate your job hunt.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          
          {/* Free Tier */}
          <div className="flex flex-col justify-between rounded-3xl bg-card border border-border p-8 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Free Starter</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Perfect for testing the waters and creating a single CV.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">{symbol}0</span>
                <span className="text-sm font-semibold text-muted-foreground">/ forever</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span>1 PDF Import / A4 Edit (Anonymous)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span>2 AI Resume Drafts (After Signup)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span>2 AI Polishes (After Signup)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span>1 ATS Score & Keyword Scan</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span>1 LaTeX Code Generation</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Button variant="outline" className="w-full" disabled={isAuthenticated}>
                {isAuthenticated ? "Active Free Tier" : "Get Started Free"}
              </Button>
            </div>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="relative flex flex-col justify-between rounded-3xl bg-card border-2 border-primary p-8 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-4 py-1 text-xs font-semibold text-primary-foreground tracking-wide uppercase flex items-center gap-1">
              <Star className="size-3.5 fill-current" /> Most Popular
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Pro Plan</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Complete tools for active job seekers looking for an edge.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">{symbol}{proPrice}</span>
                <span className="text-sm font-semibold text-muted-foreground">/ month</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">Unlimited PDF Imports & A4 Edits</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">5 AI Resume Drafting</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">5 AI Bullet Point Polish</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">5 ATS Score Scans & Fixes</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">5 LaTeX Code Downloads</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span>Access all 11+ Premium Templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span>5 AI Cover Letters & 5 Interview Preps</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-8">
              {subscriptionTier === "pro" ? (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" disabled>
                  Active Pro Member
                </Button>
              ) : (
                <Button className="w-full font-semibold shadow-md shadow-primary/10 bg-gradient-brand hover:opacity-90 cursor-pointer text-black" onClick={() => handleUpgrade("pro")}>
                  {isAuthenticated ? "Upgrade to Pro" : "Sign In to Upgrade"}
                </Button>
              )}
            </div>
          </div>

          {/* Elite Tier */}
          <div className="flex flex-col justify-between rounded-3xl bg-card border border-border p-8 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Elite Plan</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">For aggressive job applicants looking for maximum assistance.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">{symbol}{elitePrice}</span>
                <span className="text-sm font-semibold text-muted-foreground">/ month</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">Unlimited PDF Imports & A4 Edits</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">25 AI Resume Drafting</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">25 AI Bullet Point Polish</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">10 ATS Score Scans & Fixes</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">10 LaTeX Code Downloads</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span>Access all 11+ Premium Templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0" />
                  <span>15 AI Cover Letters & 15 Interview Preps</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              {subscriptionTier === "elite" ? (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" disabled>
                  Active Elite Member
                </Button>
              ) : (
                <Button variant="outline" className="w-full cursor-pointer" onClick={() => handleUpgrade("elite")}>
                  {isAuthenticated ? "Upgrade to Elite" : "Sign In to Upgrade"}
                </Button>
              )}
            </div>
          </div>

        </div>

        {/* FAQ Accordion Section */}
        <div className="mx-auto mt-24 max-w-4xl">
          <h2 className="text-center font-display text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              {
                q: "Can I cancel my subscription at any time?",
                a: "Yes. You can cancel your subscription from your settings dashboard at any time. You will continue to have access to your plan until the end of your billing period.",
              },
              {
                q: "How does the ATS score scan work?",
                a: "Our algorithm checks your CV formatting, section titles, headers, and keyword presence against applicant tracking system standards and compares them to your target role to generate recommendations.",
              },
              {
                q: "Is my personal data secure?",
                a: "Absolutely. We encrypt all information. Free tier scans are kept strictly in memory, and Pro/Elite documents are securely stored in your personal account.",
              },
              {
                q: "How do I practice mock interviews?",
                a: "Simply head over to the Interview Prep page after subscribing, input your resume & target role, and our AI will generate personalized questions and grade your answers.",
              },
            ].map((faq, i) => (
              <div key={i} className="panel p-5 bg-card border border-border">
                <h4 className="font-semibold text-sm text-foreground flex items-start gap-2">
                  <HelpIcon className="size-4 text-primary shrink-0 mt-0.5" />
                  {faq.q}
                </h4>
                <p className="mt-2 text-xs text-muted-foreground pl-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security / trust badge */}
        <div className="mt-16 flex items-center justify-center gap-2 text-xs text-muted-foreground border-t border-border/60 pt-8">
          <Shield className="size-4 text-primary" />
          <span>Secure checkout via Stripe. All data protected under GDPR guidelines.</span>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
