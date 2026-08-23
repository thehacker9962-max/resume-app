import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface User {
  email: string;
  name?: string;
}

export type SubscriptionTier = "free" | "pro" | "elite";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  subscriptionTier: SubscriptionTier;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  upgradeToTier: (tier: "pro" | "elite") => void;
  
  // Quota check & update methods
  canUploadOrEdit: () => boolean;
  registerUploadOrEdit: () => void;
  
  canBuildResume: () => boolean;
  registerBuildResume: () => void;
  getRemainingBuilds: () => number;

  canPolishResume: () => boolean;
  registerPolishResume: () => void;
  getRemainingPolishes: () => number;

  canPerformAtsScan: () => boolean;
  registerAtsScan: () => void;
  getRemainingAtsScans: () => number;

  canGenerateLatex: () => boolean;
  registerLatexGen: () => void;
  getRemainingLatexGens: () => number;

  canGenerateCoverLetter: () => boolean;
  registerCoverLetter: () => void;
  getRemainingCoverLetters: () => number;

  canPrepInterview: () => boolean;
  registerInterviewPrep: () => void;
  getRemainingInterviewPreps: () => number;

  canPerformDownload: () => boolean;
  registerDownload: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free");

  // Sync state with localStorage to persist login session and pro status
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        const tier = localStorage.getItem(`sub_tier_${parsed.email}`) as SubscriptionTier;
        setSubscriptionTier(tier || "free");
      } catch (e) {
        localStorage.removeItem("auth_user");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }
    
    const loggedUser = { email, name: email.split("@")[0] || "User" };
    setUser(loggedUser);
    localStorage.setItem("auth_user", JSON.stringify(loggedUser));
    
    const tier = localStorage.getItem(`sub_tier_${email}`) as SubscriptionTier;
    setSubscriptionTier(tier || "free");
    
    toast.success("Successfully logged in!");
    return true;
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }

    const loggedUser = { email, name: email.split("@")[0] || "User" };
    setUser(loggedUser);
    localStorage.setItem("auth_user", JSON.stringify(loggedUser));
    setSubscriptionTier("free");
    toast.success("Account registered and logged in!");
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    const loggedUser = { email: "google.user@gmail.com", name: "Google User" };
    setUser(loggedUser);
    localStorage.setItem("auth_user", JSON.stringify(loggedUser));
    
    const tier = localStorage.getItem(`sub_tier_${loggedUser.email}`) as SubscriptionTier;
    setSubscriptionTier(tier || "free");
    
    toast.success("Successfully logged in with Google!");
    return true;
  };

  const logout = () => {
    setUser(null);
    setSubscriptionTier("free");
    localStorage.removeItem("auth_user");
    toast.success("Logged out successfully.");
  };

  const upgradeToTier = (tier: "pro" | "elite") => {
    if (!user) {
      toast.error("Please sign in or register to upgrade.");
      return;
    }
    setSubscriptionTier(tier);
    localStorage.setItem(`sub_tier_${user.email}`, tier);
    toast.success(`Welcome to the ${tier.toUpperCase()} Plan! Your new limits are active.`);
  };

  // 1. PDF Imports & A4 Edits: 1 time total anonymous. Unlimited for Pro and Elite.
  const canUploadOrEdit = (): boolean => {
    if (subscriptionTier === "pro" || subscriptionTier === "elite") return true;
    if (user) return true; // signed up free has unlimited/standard upload/edit
    const count = parseInt(localStorage.getItem("anon_upload_edit_count") || "0", 10);
    return count < 1;
  };

  const registerUploadOrEdit = () => {
    if (user) return;
    const count = parseInt(localStorage.getItem("anon_upload_edit_count") || "0", 15);
    localStorage.setItem("anon_upload_edit_count", String(count + 1));
  };

  // 2. AI Resume Drafting: Free: 2, Pro: 5, Elite: 25
  const getRemainingBuilds = (): number => {
    if (!user) return 0;
    const limit = subscriptionTier === "elite" ? 25 : subscriptionTier === "pro" ? 5 : 2;
    const count = parseInt(localStorage.getItem(`builds_${user.email}`) || "0", 10);
    return Math.max(0, limit - count);
  };

  const canBuildResume = (): boolean => {
    if (!user) return false;
    return getRemainingBuilds() > 0;
  };

  const registerBuildResume = () => {
    if (!user) return;
    const count = parseInt(localStorage.getItem(`builds_${user.email}`) || "0", 10);
    localStorage.setItem(`builds_${user.email}`, String(count + 1));
  };

  // 3. AI Bullet Point Polish: Free: 2, Pro: 5, Elite: 25
  const getRemainingPolishes = (): number => {
    if (!user) return 0;
    const limit = subscriptionTier === "elite" ? 25 : subscriptionTier === "pro" ? 5 : 2;
    const count = parseInt(localStorage.getItem(`polishes_${user.email}`) || "0", 10);
    return Math.max(0, limit - count);
  };

  const canPolishResume = (): boolean => {
    if (!user) return false;
    return getRemainingPolishes() > 0;
  };

  const registerPolishResume = () => {
    if (!user) return;
    const count = parseInt(localStorage.getItem(`polishes_${user.email}`) || "0", 10);
    localStorage.setItem(`polishes_${user.email}`, String(count + 1));
  };

  // 4. ATS Scans & Fixes: Free: 1, Pro: 5, Elite: 10
  const getRemainingAtsScans = (): number => {
    if (!user) return 0;
    const limit = subscriptionTier === "elite" ? 10 : subscriptionTier === "pro" ? 5 : 1;
    const count = parseInt(localStorage.getItem(`ats_scans_${user.email}`) || "0", 10);
    return Math.max(0, limit - count);
  };

  const canPerformAtsScan = (): boolean => {
    if (!user) return false;
    return getRemainingAtsScans() > 0;
  };

  const registerAtsScan = () => {
    if (!user) return;
    const count = parseInt(localStorage.getItem(`ats_scans_${user.email}`) || "0", 10);
    localStorage.setItem(`ats_scans_${user.email}`, String(count + 1));
  };

  // 5. LaTeX Code Downloads: Free: 1, Pro: 5, Elite: 10
  const getRemainingLatexGens = (): number => {
    if (!user) return 0;
    const limit = subscriptionTier === "elite" ? 10 : subscriptionTier === "pro" ? 5 : 1;
    const count = parseInt(localStorage.getItem(`latex_gens_${user.email}`) || "0", 10);
    return Math.max(0, limit - count);
  };

  const canGenerateLatex = (): boolean => {
    if (!user) return false;
    return getRemainingLatexGens() > 0;
  };

  const registerLatexGen = () => {
    if (!user) return;
    const count = parseInt(localStorage.getItem(`latex_gens_${user.email}`) || "0", 10);
    localStorage.setItem(`latex_gens_${user.email}`, String(count + 1));
  };

  // 6. Cover Letter Tailoring: Free: 0, Pro: 5, Elite: 15
  const getRemainingCoverLetters = (): number => {
    if (!user) return 0;
    const limit = subscriptionTier === "elite" ? 15 : subscriptionTier === "pro" ? 5 : 0;
    const count = parseInt(localStorage.getItem(`cover_letters_${user.email}`) || "0", 10);
    return Math.max(0, limit - count);
  };

  const canGenerateCoverLetter = (): boolean => {
    if (!user) return false;
    return getRemainingCoverLetters() > 0;
  };

  const registerCoverLetter = () => {
    if (!user) return;
    const count = parseInt(localStorage.getItem(`cover_letters_${user.email}`) || "0", 10);
    localStorage.setItem(`cover_letters_${user.email}`, String(count + 1));
  };

  // 7. Interview Prep: Free: 0, Pro: 5, Elite: 15
  const getRemainingInterviewPreps = (): number => {
    if (!user) return 0;
    const limit = subscriptionTier === "elite" ? 15 : subscriptionTier === "pro" ? 5 : 0;
    const count = parseInt(localStorage.getItem(`interviews_${user.email}`) || "0", 10);
    return Math.max(0, limit - count);
  };

  const canPrepInterview = (): boolean => {
    if (!user) return false;
    return getRemainingInterviewPreps() > 0;
  };

  const registerInterviewPrep = () => {
    if (!user) return;
    const count = parseInt(localStorage.getItem(`interviews_${user.email}`) || "0", 10);
    localStorage.setItem(`interviews_${user.email}`, String(count + 1));
  };

  // 8. Downloads (PDF download limit)
  const canPerformDownload = (): boolean => {
    if (subscriptionTier === "pro" || subscriptionTier === "elite") return true;
    const hasDownloaded = localStorage.getItem(user ? `download_${user.email}` : "free_download_used");
    return !hasDownloaded;
  };

  const registerDownload = () => {
    localStorage.setItem(user ? `download_${user.email}` : "free_download_used", "true");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        subscriptionTier,
        login,
        register,
        loginWithGoogle,
        logout,
        upgradeToTier,
        
        canUploadOrEdit,
        registerUploadOrEdit,
        
        canBuildResume,
        registerBuildResume,
        getRemainingBuilds,
        
        canPolishResume,
        registerPolishResume,
        getRemainingPolishes,
        
        canPerformAtsScan,
        registerAtsScan,
        getRemainingAtsScans,
        
        canGenerateLatex,
        registerLatexGen,
        getRemainingLatexGens,

        canGenerateCoverLetter,
        registerCoverLetter,
        getRemainingCoverLetters,

        canPrepInterview,
        registerInterviewPrep,
        getRemainingInterviewPreps,
        
        canPerformDownload,
        registerDownload,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
