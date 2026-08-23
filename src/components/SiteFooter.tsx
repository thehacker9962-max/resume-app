import { Link } from "@tanstack/react-router";
import { LEGAL_LINKS, NAV_LINKS, SITE_NAME, CONTACT_EMAIL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border pt-8 text-sm">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-base font-semibold">{SITE_NAME}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Free AI ATS resume checker, resume optimiser and LaTeX resume editor. Your resume is
            analysed on demand and never stored.
          </p>
        </div>
        <nav aria-label="Site" className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Product
          </p>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Legal" className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Legal
          </p>
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="block text-muted-foreground transition-colors hover:text-foreground"
          >
            {CONTACT_EMAIL}
          </a>
        </nav>
      </div>
      <p className="mt-8 pb-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE_NAME}. Not affiliated with Workday, Greenhouse, Taleo or
        Google.
      </p>
    </footer>
  );
}