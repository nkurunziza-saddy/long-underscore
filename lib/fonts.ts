export type FontCategory =
  | "sans-serif"
  | "serif"
  | "mono"
  | "display"
  | "script";

export interface FontDef {
  /** Google Fonts family name, also the CSS family name. */
  name: string;
  value: string;
  category: FontCategory;
  weights: number[];
}

export const FONTS: FontDef[] = [
  // Sans
  {
    name: "Inter",
    value: "inter",
    category: "sans-serif",
    weights: [400, 500, 600, 700, 800, 900],
  },
  {
    name: "Poppins",
    value: "poppins",
    category: "sans-serif",
    weights: [400, 500, 600, 700, 800],
  },
  {
    name: "Space Grotesk",
    value: "space-grotesk",
    category: "sans-serif",
    weights: [400, 500, 700],
  },
  {
    name: "Outfit",
    value: "outfit",
    category: "sans-serif",
    weights: [400, 500, 700, 800],
  },
  {
    name: "Sora",
    value: "sora",
    category: "sans-serif",
    weights: [400, 600, 800],
  },
  {
    name: "Bricolage Grotesque",
    value: "bricolage-grotesque",
    category: "sans-serif",
    weights: [400, 600, 800],
  },
  {
    name: "Plus Jakarta Sans",
    value: "plus-jakarta-sans",
    category: "sans-serif",
    weights: [400, 500, 700, 800],
  },
  {
    name: "Manrope",
    value: "manrope",
    category: "sans-serif",
    weights: [400, 600, 700, 800],
  },
  {
    name: "DM Sans",
    value: "dm-sans",
    category: "sans-serif",
    weights: [400, 500, 700],
  },
  {
    name: "Work Sans",
    value: "work-sans",
    category: "sans-serif",
    weights: [400, 600, 800],
  },
  {
    name: "Montserrat",
    value: "montserrat",
    category: "sans-serif",
    weights: [400, 600, 700, 900],
  },
  {
    name: "Roboto",
    value: "roboto",
    category: "sans-serif",
    weights: [400, 500, 700, 900],
  },
  {
    name: "Open Sans",
    value: "open-sans",
    category: "sans-serif",
    weights: [400, 600, 700],
  },
  {
    name: "Lato",
    value: "lato",
    category: "sans-serif",
    weights: [400, 700, 900],
  },
  {
    name: "Raleway",
    value: "raleway",
    category: "sans-serif",
    weights: [400, 600, 700],
  },
  {
    name: "Nunito",
    value: "nunito",
    category: "sans-serif",
    weights: [400, 600, 700, 900],
  },
  {
    name: "Ubuntu",
    value: "ubuntu",
    category: "sans-serif",
    weights: [400, 500, 700],
  },
  {
    name: "Quicksand",
    value: "quicksand",
    category: "sans-serif",
    weights: [400, 600, 700],
  },
  {
    name: "Oxygen",
    value: "oxygen",
    category: "sans-serif",
    weights: [400, 700],
  },
  {
    name: "Source Sans 3",
    value: "source-sans-pro",
    category: "sans-serif",
    weights: [400, 600, 700],
  },
  {
    name: "Josefin Sans",
    value: "josefin-sans",
    category: "sans-serif",
    weights: [400, 600, 700],
  },

  // Serif
  {
    name: "Fraunces",
    value: "fraunces",
    category: "serif",
    weights: [400, 600, 900],
  },
  {
    name: "Playfair Display",
    value: "playfair-display",
    category: "serif",
    weights: [400, 600, 700, 900],
  },
  {
    name: "Instrument Serif",
    value: "instrument-serif",
    category: "serif",
    weights: [400],
  },
  {
    name: "DM Serif Display",
    value: "dm-serif-display",
    category: "serif",
    weights: [400],
  },
  {
    name: "Bodoni Moda",
    value: "bodoni-moda",
    category: "serif",
    weights: [400, 700, 900],
  },
  {
    name: "Merriweather",
    value: "merriweather",
    category: "serif",
    weights: [400, 700, 900],
  },
  { name: "Lora", value: "lora", category: "serif", weights: [400, 600, 700] },
  {
    name: "Crimson Text",
    value: "crimson-text",
    category: "serif",
    weights: [400, 600, 700],
  },
  {
    name: "Cormorant Garamond",
    value: "cormorant-garamond",
    category: "serif",
    weights: [400, 600, 700],
  },
  {
    name: "Libre Baskerville",
    value: "libre-baskerville",
    category: "serif",
    weights: [400, 700],
  },
  {
    name: "EB Garamond",
    value: "eb-garamond",
    category: "serif",
    weights: [400, 500, 700],
  },
  {
    name: "Cinzel",
    value: "cinzel",
    category: "serif",
    weights: [400, 600, 700, 900],
  },
  { name: "Prata", value: "prata", category: "serif", weights: [400] },

  // Mono
  {
    name: "JetBrains Mono",
    value: "jetbrains-mono",
    category: "mono",
    weights: [400, 600, 700, 800],
  },
  {
    name: "Space Mono",
    value: "space-mono",
    category: "mono",
    weights: [400, 700],
  },
  {
    name: "IBM Plex Mono",
    value: "ibm-plex-mono",
    category: "mono",
    weights: [400, 600, 700],
  },
  {
    name: "Roboto Mono",
    value: "roboto-mono",
    category: "mono",
    weights: [400, 500, 700],
  },
  {
    name: "Fira Code",
    value: "fira-code",
    category: "mono",
    weights: [400, 600, 700],
  },
  {
    name: "Source Code Pro",
    value: "source-code-pro",
    category: "mono",
    weights: [400, 700, 900],
  },
  {
    name: "Courier Prime",
    value: "courier-prime",
    category: "mono",
    weights: [400, 700],
  },

  // Display
  {
    name: "Unbounded",
    value: "unbounded",
    category: "display",
    weights: [400, 600, 800],
  },
  {
    name: "Syne",
    value: "syne",
    category: "display",
    weights: [500, 700, 800],
  },
  {
    name: "Archivo Black",
    value: "archivo-black",
    category: "display",
    weights: [400],
  },
  {
    name: "Bebas Neue",
    value: "bebas-neue",
    category: "display",
    weights: [400],
  },
  {
    name: "Alfa Slab One",
    value: "alfa-slab-one",
    category: "display",
    weights: [400],
  },
  {
    name: "Abril Fatface",
    value: "abril-fatface",
    category: "display",
    weights: [400],
  },
  {
    name: "Fredoka",
    value: "fredoka",
    category: "display",
    weights: [400, 500, 600, 700],
  },
  {
    name: "Righteous",
    value: "righteous",
    category: "display",
    weights: [400],
  },
  { name: "Bangers", value: "bangers", category: "display", weights: [400] },

  // Script
  { name: "Pacifico", value: "pacifico", category: "script", weights: [400] },
  { name: "Lobster", value: "lobster", category: "script", weights: [400] },
  {
    name: "Dancing Script",
    value: "dancing-script",
    category: "script",
    weights: [400, 700],
  },
  {
    name: "Great Vibes",
    value: "great-vibes",
    category: "script",
    weights: [400],
  },
  {
    name: "Sacramento",
    value: "sacramento",
    category: "script",
    weights: [400],
  },
  { name: "Satisfy", value: "satisfy", category: "script", weights: [400] },
];

export const FONT_CATEGORIES: { value: FontCategory; label: string }[] = [
  { value: "sans-serif", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
  { value: "display", label: "Display" },
  { value: "script", label: "Script" },
];

export const FONT_WEIGHT_NAMES: Record<number, string> = {
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "Extrabold",
  900: "Black",
};

const GENERIC: Record<FontCategory, string> = {
  "sans-serif": "sans-serif",
  serif: "serif",
  mono: "monospace",
  display: "sans-serif",
  script: "cursive",
};

const BY_VALUE = new Map(FONTS.map((font) => [font.value, font]));

export function getFont(value: string): FontDef {
  return BY_VALUE.get(value) ?? FONTS[0];
}

export function getCSSFontFamily(value: string): string {
  const font = getFont(value);
  return `'${font.name}', ${GENERIC[font.category]}`;
}

/** The weight this font actually ships that sits closest to the one asked for. */
export function nearestWeight(value: string, desired: number): number {
  return getFont(value).weights.reduce((best, weight) =>
    Math.abs(weight - desired) < Math.abs(best - desired) ? weight : best,
  );
}

export function heaviestWeight(value: string): number {
  return Math.max(...getFont(value).weights);
}

/**
 * Google Fonts stylesheet URL. Pass `text` to get a subset holding only those
 * glyphs, which is a kilobyte or two instead of a full font file.
 */
export function getFontLink(
  value: string,
  weights: number[] = getFont(value).weights,
  text?: string,
): string {
  const family = getFont(value).name.replace(/ /g, "+");
  const axis = [...weights].sort((a, b) => a - b).join(";");
  const subset = text ? `&text=${encodeURIComponent(text)}` : "";
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${axis}${subset}&display=block`;
}
