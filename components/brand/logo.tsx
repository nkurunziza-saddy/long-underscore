import { BRAND, MARK_PATH } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * The studio's mark as it sits in the interface: its own dark plate and pale
 * glyph in both colour modes, with a hairline so the plate keeps an edge on
 * a dark page.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-5 shrink-0 ring-1 ring-border", className)}
      // The plate's own corners, which the hairline follows.
      style={{ borderRadius: `${BRAND.corners / 2}%` }}
    >
      <rect width="24" height="24" fill={BRAND.plate} />
      <path d={MARK_PATH} fill={BRAND.glyph} />
    </svg>
  );
}

/** Mark and name together. Below `sm` the name is kept for screen readers alone. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn("flex items-center gap-2 text-sm font-medium", className)}
    >
      <LogoMark />
      <span className="sr-only sm:not-sr-only">{BRAND.name}</span>
    </span>
  );
}
