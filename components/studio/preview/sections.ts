import type { StudioTab } from "@/stores/studio-store";

/** The parts of the preview page that can be scrolled to. */
export const PREVIEW = {
  browser: "preview-browser",
  card: "preview-card",
} as const;

/**
 * The part of the page a tab's fields change, where that is one part and not
 * the whole page. Mark and Colour change everything, so they have none.
 */
const SHOWN_BY: Partial<Record<StudioTab, string>> = {
  card: PREVIEW.card,
  site: PREVIEW.browser,
};

/**
 * Bring what a tab changes into view, if it is not already. Only where the
 * page scrolls beside the controls: on a small screen the two are stacked,
 * and scrolling would carry off the fields that were just opened.
 */
export function showPreview(tab: StudioTab) {
  const id = SHOWN_BY[tab];
  if (!id || !window.matchMedia("(width >= 64rem)").matches) return;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ block: "nearest", behavior: calm ? "auto" : "smooth" });
}
