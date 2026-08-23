type Props = {
  /** Human label shown while no ad is served, e.g. "Leaderboard 728x90" */
  label: string;
  /** Tailwind height classes for the reserved space */
  className?: string;
  id?: string;
};

/**
 * Reserved advertising space. Drop your ad network snippet (AdSense, etc.)
 * inside the inner div — the outer box keeps the layout stable.
 */
export function AdSlot({ label, className = "h-24 sm:h-28", id }: Props) {
  return (
    <aside
      id={id}
      aria-label="Advertisement"
      className={`panel flex items-center justify-center border-dashed bg-secondary/40 ${className}`}
    >
      <div className="text-center text-xs tracking-wide text-muted-foreground uppercase">
        <p className="font-medium">Ad space</p>
        <p className="mt-1 font-mono text-[10px] normal-case opacity-70">{label}</p>
      </div>
    </aside>
  );
}