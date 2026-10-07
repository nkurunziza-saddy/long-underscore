import { contrast, hexToHsl, mix, tone } from "./color";
import { FONTS, heaviestWeight, nearestWeight } from "./fonts";
import {
  HALFTONE_CELLS,
  HALFTONE_FLOWS,
  HALFTONE_PRESETS,
  type Halftone,
  type HalftoneCell,
  type HalftoneFlow,
  type HalftoneMode,
  type HalftoneShape,
} from "./halftone";
import { colorPalettes } from "./palettes";

export type MarkSource = "letter" | "icon" | "halftone" | "svg";
export type Treatment =
  | "solid"
  | "fade"
  | "ink"
  | "soft"
  | "paper"
  | "ghost"
  | "custom";
export type OgLayout = "statement" | "centered" | "split" | "poster";
export type OgTone = "brand" | "ink" | "paper";
export type OgPattern = "none" | "grid" | "dots" | "glow" | "halftone";
export type Target = "html" | "next";
export type Theme = "light" | "dark";
export type Hue = keyof typeof colorPalettes;

/**
 * Everything the studio knows about a brand. One mark, one palette, one
 * typeface; every exported file is derived from this object.
 */
export interface Design {
  source: MarkSource;
  text: string;
  icon: string;
  font: string;
  weight: number;
  /** Glyph size as a percentage of the canvas. */
  scale: number;
  /** 0 is a square, 100 a circle. */
  radius: number;
  /** Icon stroke width in Lucide's 24px grid. */
  stroke: number;
  /** The halftone mark: what its cells add up to, and which of them are drawn. */
  htShape: HalftoneShape;
  htMode: HalftoneMode;
  /** What one cell is. */
  htCell: HalftoneCell;
  /** Cells along one side. */
  htGrid: number;
  /** The space between two cells, as a percentage of a cell: 0 joins them. */
  htGap: number;
  /** Where the cells grow towards. */
  htFlow: HalftoneFlow;
  /** How far they shrink across the mark, 0 to 100. */
  htFade: number;

  hue: Hue;
  treatment: Treatment;
  fg: string;
  bg: string;
  /** Second gradient stop; null for a flat background. */
  bg2: string | null;
  transparent: boolean;
  /** Ship an SVG that restyles itself for dark browser chrome. */
  adaptive: boolean;

  name: string;
  description: string;
  url: string;

  ogLayout: OgLayout;
  ogTone: OgTone;
  ogPattern: OgPattern;
  /** Empty means "use the site name". */
  ogTitle: string;
  /** Empty means "use the description". */
  ogTagline: string;

  target: Target;
}

export interface MarkColors {
  fg: string;
  bg: string;
  bg2: string | null;
  transparent: boolean;
}

/** The hues with next to no colour in them, darkest and plainest first. */
const NEUTRALS: Hue[] = [
  "obsidian",
  "carbon",
  "slate",
  "mist",
  "taupe",
  "bronze",
  "mocha",
];

/** Every hue, the neutrals leading: they are what most marks should wear. */
export const HUES: Hue[] = [
  ...NEUTRALS,
  ...(Object.keys(colorPalettes) as Hue[]).filter(
    (hue) => !NEUTRALS.includes(hue),
  ),
];

export const TREATMENTS: {
  value: Exclude<Treatment, "custom">;
  label: string;
  hint: string;
}[] = [
  { value: "ink", label: "Ink", hint: "Near-black plate, pale glyph" },
  { value: "solid", label: "Solid", hint: "Brand colour plate, quiet glyph" },
  { value: "fade", label: "Fade", hint: "Two-stop diagonal gradient" },
  { value: "soft", label: "Soft", hint: "Pastel plate, deep glyph" },
  { value: "paper", label: "Paper", hint: "White plate, coloured glyph" },
  { value: "ghost", label: "Ghost", hint: "No plate, glyph only" },
];

export function hueLabel(hue: string): string {
  return hue.replace(/_/g, " ");
}

/** How well `color` reads on its weakest background. */
function worstContrast(color: string, backgrounds: string[]): number {
  return Math.min(...backgrounds.map((stop) => contrast(color, stop)));
}

/**
 * White if it reads on the plate, since white on colour looks cleanest;
 * otherwise whichever end of the hue's own scale reads best.
 */
function glyphOn(plate: string[], shade: readonly string[]): string {
  if (worstContrast("#ffffff", plate) >= 3) return "#ffffff";
  return worstContrast(shade[9], plate) >= worstContrast(shade[0], plate)
    ? shade[9]
    : shade[0];
}

/** First shade at or after `from` that clears `ratio` against `background`. */
function shadeOn(
  shade: readonly string[],
  from: number,
  background: string,
  ratio: number,
): string {
  for (let index = from; index < shade.length; index++) {
    if (contrast(shade[index], background) >= ratio) return shade[index];
  }
  return shade[shade.length - 1];
}

/**
 * Resolve a hue and a treatment into concrete colours. Shades are picked by
 * measured contrast, not by index, so pale hues like lime and gold come out
 * as legible as deep ones.
 */
export function applyTreatment(
  hue: Hue,
  treatment: Exclude<Treatment, "custom">,
): Pick<Design, "hue" | "treatment" | "fg" | "bg" | "bg2" | "transparent"> {
  const shade = colorPalettes[hue] ?? colorPalettes.emerald;
  const base = { hue, treatment, bg2: null, transparent: false };
  switch (treatment) {
    case "solid":
      return { ...base, bg: shade[6], fg: glyphOn([shade[6]], shade) };
    case "fade": {
      // Try gradients from the richest outward until one glyph colour reads
      // on both stops; very pale or very dark hues need a shifted pair.
      const pairs = [
        [4, 7],
        [5, 8],
        [3, 6],
        [6, 9],
        [2, 5],
      ].map(([from, to]) => [shade[from], shade[to]]);
      const reads = (stops: string[]) =>
        worstContrast(glyphOn(stops, shade), stops);
      const stops =
        pairs.find((pair) => reads(pair) >= 3) ??
        pairs.reduce((best, pair) => (reads(pair) > reads(best) ? pair : best));
      return {
        ...base,
        bg: stops[0],
        bg2: stops[1],
        fg: glyphOn(stops, shade),
      };
    }
    case "ink": {
      const bg = tone(shade[9], 9, 45);
      return { ...base, bg, fg: shadeOn([...shade].reverse(), 7, bg, 7) };
    }
    case "soft":
      return { ...base, bg: shade[1], fg: shadeOn(shade, 6, shade[1], 4.5) };
    case "paper":
      return { ...base, bg: "#ffffff", fg: shadeOn(shade, 6, "#ffffff", 4.5) };
    case "ghost":
      return {
        ...base,
        bg: "#ffffff",
        fg: shadeOn(shade, 5, "#ffffff", 3.5),
        transparent: true,
      };
  }
}

/** The halftone a design holds, as the generator takes it. */
export function halftoneOf(design: Design): Halftone {
  return {
    shape: design.htShape,
    mode: design.htMode,
    cell: design.htCell,
    grid: design.htGrid,
    gap: design.htGap,
    flow: design.htFlow,
    fade: design.htFade,
  };
}

type HalftoneFields =
  | "htShape"
  | "htMode"
  | "htCell"
  | "htGrid"
  | "htGap"
  | "htFlow"
  | "htFade";

/** The patch that gives a design this halftone. */
export function withHalftone(halftone: Halftone): Pick<Design, HalftoneFields> {
  return {
    htShape: halftone.shape,
    htMode: halftone.mode,
    htCell: halftone.cell,
    htGrid: halftone.grid,
    htGap: halftone.gap,
    htFlow: halftone.flow,
    htFade: halftone.fade,
  };
}

export const DEFAULT_DESIGN: Design = {
  source: "letter",
  text: "S",
  icon: "zap",
  font: "poppins",
  weight: 700,
  scale: 64,
  radius: 44,
  stroke: 2,
  ...withHalftone(HALFTONE_PRESETS[0].halftone),
  // A dark neutral: the look a mark is least likely to regret.
  ...applyTreatment("obsidian", "ink"),
  adaptive: true,
  name: "",
  description: "",
  url: "",
  ogLayout: "statement",
  ogTone: "ink",
  ogPattern: "grid",
  ogTitle: "",
  ogTagline: "",
  target: "html",
};

/** Browser tab strips the mark has to survive on. */
export const TAB_LIGHT = "#ffffff";
export const TAB_DARK = "#202124";

/**
 * Colours for a given browser theme. Light is the design as drawn. Dark is
 * derived, never hand-picked: a pale plate drops to a dark one in the same
 * hue, and a bare glyph too dim for dark chrome is lifted until it reads.
 */
export function resolveColors(
  design: Design,
  theme: Theme = "light",
): MarkColors {
  const colors: MarkColors = {
    fg: design.fg,
    bg: design.bg,
    bg2: design.bg2,
    transparent: design.transparent,
  };
  if (theme === "light" || !design.adaptive) return colors;

  if (colors.transparent) {
    if (contrast(colors.fg, TAB_DARK) < 4.5) {
      colors.fg = tone(colors.fg, Math.max(hexToHsl(colors.fg).l, 78));
    }
    return colors;
  }

  // Only a bright plate glares in dark chrome; saturated and dark ones stay.
  const plate = colors.bg2 ? mix(colors.bg, colors.bg2, 0.5) : colors.bg;
  if (hexToHsl(plate).l > 82) {
    const source =
      hexToHsl(colors.fg).s > hexToHsl(plate).s ? colors.fg : plate;
    colors.bg = tone(source, 13, 40);
    colors.bg2 = null;
    colors.fg = tone(source, 86, 80);
  }
  return colors;
}

/** True when the dark variant really differs, i.e. `adaptive` earns its bytes. */
export function hasDarkVariant(design: Design): boolean {
  if (!design.adaptive) return false;
  const light = resolveColors(design, "light");
  const dark = resolveColors(design, "dark");
  return light.fg !== dark.fg || light.bg !== dark.bg || light.bg2 !== dark.bg2;
}

/** The dark neutral a bare glyph is set on wherever it must have something behind it. */
export const BACKING = "#171717";

/**
 * The mark's colours where it cannot be transparent: a home screen, which
 * fills what is left clear with a colour of its own choosing, and a card
 * flooded with the mark's colour. A plate is kept as it is. A bare glyph is
 * set on a dark neutral, and where it is too dark to be read there it is
 * lifted, as it is for a dark tab strip. Imported art cannot be recoloured,
 * so for art that dark it is the backing that turns pale.
 */
export function backedColors(
  design: Pick<Design, "source">,
  colors: MarkColors,
): MarkColors {
  if (!colors.transparent) return colors;
  const backed = { bg: BACKING, bg2: null, transparent: false };
  if (contrast(colors.fg, BACKING) >= 3) return { ...backed, fg: colors.fg };
  if (design.source === "svg") {
    return { ...backed, bg: "#ffffff", fg: colors.fg };
  }
  return {
    ...backed,
    fg: tone(colors.fg, Math.max(hexToHsl(colors.fg).l, 78)),
  };
}

/** The colour behind the mark where transparency is not allowed. */
export function matteFor(
  design: Pick<Design, "source">,
  colors: MarkColors,
): string {
  return backedColors(design, colors).bg;
}

/** The colour that says "this brand": plate if it has one, glyph otherwise. */
export function brandColor(design: Design): string {
  if (design.transparent) return design.fg;
  return hexToHsl(design.bg).s >= hexToHsl(design.fg).s ? design.bg : design.fg;
}

/**
 * Tints the browser UI on mobile: the plate. With none, the glyph's colour
 * where it has one, and otherwise what a home screen sets it on, so a pale
 * grey glyph does not turn the browser white.
 */
export function themeColor(design: Design): string {
  if (!design.transparent) return design.bg;
  return hexToHsl(design.fg).s >= 20
    ? design.fg
    : matteFor(design, resolveColors(design));
}

export function siteName(design: Design): string {
  return design.name.trim() || "Untitled";
}

/** Manifest `short_name`: home screens truncate around twelve characters. */
export function shortName(design: Design): string {
  const name = siteName(design);
  if (name.length <= 12) return name;
  let short = "";
  for (const word of name.split(/\s+/)) {
    const candidate = short ? `${short} ${word}` : word;
    if (candidate.length > 12) break;
    short = candidate;
  }
  // "Fable &" is worse than "Fable": drop a dangling connector.
  short = short.replace(/\s+(&|\+|-|–|—|\||and|of|the|for)$/i, "");
  return short.length >= 3 ? short : name.slice(0, 12).trim();
}

export function siteHost(design: Design): string {
  const url = design.url.trim();
  if (!url) return "";
  try {
    return new URL(/^https?:\/\//.test(url) ? url : `https://${url}`).host;
  } catch {
    return url;
  }
}

/** Absolute origin with no trailing slash, or "" when no URL was given. */
export function siteOrigin(design: Design): string {
  const url = design.url.trim();
  if (!url) return "";
  try {
    const parsed = new URL(/^https?:\/\//.test(url) ? url : `https://${url}`);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

export function cardTitle(design: Design): string {
  return design.ogTitle.trim() || siteName(design);
}

export function cardTagline(design: Design): string {
  return design.ogTagline.trim() || design.description.trim();
}

/** Faces that hold up as a one-letter logo; shuffle only draws from these. */
const SHUFFLE_FONTS = FONTS.filter(
  (font) => font.category !== "script" && heaviestWeight(font.value) >= 700,
).map((font) => font.value);
const SHUFFLE_TREATMENTS: Exclude<Treatment, "custom">[] = [
  "solid",
  "solid",
  "solid",
  "fade",
  "fade",
  "ink",
  "ink",
  "soft",
  "soft",
  "paper",
  "ghost",
];
const SHUFFLE_RADII = [0, 22, 44, 44, 100];

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

/** A new look for the same brand: the content stays, the styling is redrawn. */
export function shuffleDesign(
  design: Design,
  random: () => number = Math.random,
): Design {
  const next: Design = {
    ...design,
    ...applyTreatment(pick(HUES, random), pick(SHUFFLE_TREATMENTS, random)),
    radius: pick(SHUFFLE_RADII, random),
  };
  if (design.source === "letter") {
    next.font = pick(SHUFFLE_FONTS, random);
    next.weight = heaviestWeight(next.font);
  }
  if (design.source === "halftone") {
    // The shape and its grid are the mark; what the cells are and which way
    // they grow is its styling, as a typeface is a letter's.
    next.htCell = pick(HALFTONE_CELLS, random).value;
    next.htFlow = pick(HALFTONE_FLOWS, random).value;
  }
  return next;
}

export function withFont(design: Design, font: string): Partial<Design> {
  return { font, weight: nearestWeight(font, design.weight) };
}
