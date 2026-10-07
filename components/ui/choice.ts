/**
 * The looks of what is picked from a grid by eye. The chosen one wears the
 * selection colour (`ring`), as a focused field does.
 */

/** A tile holding a preview and its name: a small card. */
export const tileClass =
  "edge-card group flex flex-col rounded-lg bg-panel text-fg-2 transition-colors duration-100 hover:bg-panel-hover hover:text-foreground aria-pressed:border-ring aria-pressed:bg-page aria-pressed:font-medium aria-pressed:text-foreground aria-pressed:ring-1 aria-pressed:ring-ring";

/** A cell of a dense grid inside a card: a glyph, a letter. */
export const cellClass =
  "flex items-center justify-center rounded-md text-fg-2 transition-colors duration-100 hover:bg-control hover:text-foreground aria-pressed:bg-page aria-pressed:text-foreground aria-pressed:ring-1 aria-pressed:ring-ring";

/** The card such a grid scrolls in. */
export const wellClass =
  "edge-card relative overflow-y-auto rounded-xl bg-panel p-1";
