import { Check, Sparkles, X, ShieldCheck, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocationPricing } from "@/hooks/use-location-pricing";
import { Link, useNavigate } from "@tanstack/react-router";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
};

export function UpgradeModal({ isOpen, onClose, reason }: Props) {
  const { isAuthenticated } = useAuth();
  const { symbol, proPrice, elitePrice } = useLocationPricing();
  const navigate = useNavigate();

  const handleUpgrade = (tier: "pro" | "elite") => {
    onClose();
    navigate({ to: "/pricing" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-surface-glow pointer-events-none opacity-40" />

        <div className="p-6 relative">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5 fill-primary" /> Premium Upgrade Options
            </span>
          </div>

          <DialogHeader className="mt-4 text-left">
            <DialogTitle className="font-display text-2xl font-bold tracking-tight">
              Unlock FixMyResume Premium Tiers
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-muted-foreground">
              {reason || "You've reached your free usage limit. Choose a plan to continue building the perfect resume."}
            </DialogDescription>
          </DialogHeader>

          {/* Cards wrapper */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            
            {/* Pro Plan Card */}
            <div className="rounded-xl border border-border bg-secondary/20 p-5 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Pro Plan</h4>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-2xl font-extrabold tracking-tight">{symbol}{proPrice}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">/ month</span>
                </div>
                
                <ul className="mt-4 space-y-2 text-[11px] text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary shrink-0" />
                    <span>Unlimited PDF Imports & Edits</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary shrink-0" />
                    <span>5 AI Resume Drafts & Polishes</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary shrink-0" />
                    <span>5 ATS scans & 5 LaTeX downloads</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary shrink-0" />
                    <span>5 AI Cover Letters & 5 Interview Preps</span>
                  </li>
                </ul>
              </div>

              <Button className="mt-5 w-full text-xs font-semibold shadow-sm cursor-pointer text-black" size="sm" onClick={() => handleUpgrade("pro")}>
                <Zap className="size-3 mr-1.5 fill-black" />
                {isAuthenticated ? "Upgrade to Pro" : "Sign In to Upgrade"}
              </Button>
            </div>

            {/* Elite Plan Card */}
            <div className="rounded-xl border-2 border-primary bg-secondary/10 p-5 flex flex-col justify-between relative">
              <div className="absolute -top-3 right-3 rounded-full bg-primary px-2 py-0.5 text-[8px] font-extrabold uppercase text-primary-foreground tracking-widest">
                Best Value
              </div>
              
              <div>
                <h4 className="font-bold text-sm text-foreground">Elite Plan</h4>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-2xl font-extrabold tracking-tight">{symbol}{elitePrice}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">/ month</span>
                </div>
                
                <ul className="mt-4 space-y-2 text-[11px] text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary shrink-0" />
                    <span>Unlimited PDF Imports & Edits</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary shrink-0" />
                    <span>25 AI Resume Drafts & Polishes</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary shrink-0" />
                    <span>10 ATS scans & 10 LaTeX downloads</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary shrink-0" />
                    <span>15 AI Cover Letters & 15 Interview Preps</span>
                  </li>
                </ul>
              </div>

              <Button className="mt-5 w-full text-xs font-semibold shadow-md bg-gradient-brand cursor-pointer" size="sm" onClick={() => handleUpgrade("elite")}>
                <Zap className="size-3 mr-1.5 fill-primary-foreground" />
                {isAuthenticated ? "Upgrade to Elite" : "Sign In to Upgrade"}
              </Button>
            </div>

          </div>

          <div className="mt-6 flex justify-between items-center text-xs text-muted-foreground px-1 border-t border-border pt-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-primary" /> 100% Secure Checkout
            </span>
            <Link to="/pricing" onClick={onClose} className="hover:underline text-primary font-medium">
              View Detailed Plan Options &rarr;
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
