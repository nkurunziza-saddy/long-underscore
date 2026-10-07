import { cn } from "@/lib/utils";

/**
 * Shared looks for floating surfaces. `shadow-pop` carries a 1px ring, so
 * none of them need a border.
 */

/**
 * How a floating thing arrives and leaves. A transition and not a keyframe
 * animation, so one closed while it is still opening turns back from where it
 * is. Base UI holds it at `data-starting-style` for its first frame and at
 * `data-ending-style` until it has gone.
 */
export const popClass =
  "transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-97 data-ending-style:opacity-0 data-starting-style:scale-97 data-starting-style:opacity-0";

/** The dimmed layer behind a dialog. */
export const backdropClass =
  "fixed inset-0 z-50 min-h-dvh bg-black/25 backdrop-blur-[3px] dark:bg-black/55";

/** A dialog card. */
export const surfaceClass =
  "rounded-3xl bg-popover text-popover-foreground shadow-pop outline-none";

/** What an anchored popup stands in: over the page, in a stacking context of its own. */
export const positionerClass = "isolate z-50 outline-none";

/** An anchored popup: a menu, a select list, a tooltip. It grows from its anchor. */
export const popupClass = cn(
  "origin-(--transform-origin) rounded-menu bg-popover text-popover-foreground shadow-pop outline-none",
  popClass,
);

/**
 * A row of a menu or a select list: quiet until the pointer or the keyboard
 * is on it, which Base UI reports as `data-highlighted`.
 */
export const menuRowClass =
  "relative flex h-7 cursor-default items-center gap-2 rounded-control px-2.5 text-sm text-fg-2 outline-hidden select-none data-highlighted:bg-control data-highlighted:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5";
