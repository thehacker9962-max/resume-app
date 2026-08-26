import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Menu, X, LogOut } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/lib/site";
import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const initials = user
    ? (user.name || user.email).split("@")[0].slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className="border-b border-border relative bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <Gauge className="size-5 text-primary" /> {SITE_NAME}
        </Link>
        
        {/* Desktop Nav */}
        <nav aria-label="Main" className="hidden gap-5 text-sm sm:flex items-center">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                href={link.to}
                className={cn(
                  "text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "text-foreground font-medium"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="ml-2 h-4 w-px bg-border" />
          
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Avatar className="size-7 border border-border">
                <AvatarImage 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || "U")}&background=0D9488&color=fff&bold=true`} 
                  alt={user?.name || "User profile"} 
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-foreground text-xs" onClick={logout}>
                <LogOut className="size-3.5" /> Logout
              </Button>
            </div>
          ) : (
            <Button size="sm" asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground sm:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {open && (
        <nav aria-label="Mobile Navigation" className="border-t border-border bg-background px-4 py-3 flex flex-col gap-3 sm:hidden absolute top-full left-0 right-0 z-50 shadow-md">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-muted-foreground transition-colors hover:text-foreground py-1.5 text-sm",
                  isActive && "text-foreground font-medium"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="h-px bg-border my-1" />
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Avatar className="size-8 border border-border">
                  <AvatarImage 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || "U")}&background=0D9488&color=fff&bold=true`} 
                    alt={user?.name || "User profile"} 
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <Button size="sm" variant="outline" className="justify-center gap-2 flex-1" onClick={() => { logout(); setOpen(false); }}>
                  <LogOut className="size-4" /> Logout
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" asChild className="w-full justify-center">
              <Link href="/auth" onClick={() => setOpen(false)}>Sign In</Link>
            </Button>
          )}
        </nav>
      )}
    </header>
  );
}