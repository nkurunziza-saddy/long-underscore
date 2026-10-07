/**
 * The studio's own identity, in one place. The header draws the mark from
 * here, the page's metadata is worded from here, and `bun run brand` builds
 * every icon and the social card in `app/` and `public/` from here with the
 * studio's own kit builder.
 */
export const BRAND = {
  name: "long underscore",
  /** What it is, in the fewest words. */
  tagline: "One mark. Every surface it has to live on.",
  description:
    "Design one mark and get the whole kit: a real .ico, a dark-mode-aware SVG, Apple and maskable icons, a manifest and a matching social card. Ten files, not sixty.",
  /** The description at the length a social card has room for. */
  summary: "A favicon studio that ships ten files, not sixty.",
  url: "https://longunderscore.vercel.app",
  author: "Nkurunziza Saddy",
  handle: "@nk_saddy",
  /** A dark neutral plate and a pale glyph: the studio's default look. */
  plate: "#171717",
  glyph: "#e4e4e4",
  /** The plate's corners, on the studio's own scale: its Soft. */
  corners: 22,
} as const;

/**
 * The mark: a long underscore that breaks into cells, each a step smaller
 * than the last, as a halftone's are. Drawn in a 24 unit box that is the
 * whole plate, so the glyph keeps the same 3.4 units clear on both sides.
 */
export const MARK_PATH =
  "M3.4 14.4h8.8v3.2h-8.8zM13.4 14.8h2.4v2.4h-2.4zM17 15.2h1.6v1.6h-1.6zM19.8 15.6h.8v.8h-.8z";

/** The glyph alone as an SVG file, for the kit builder to set on its plate. */
export function markGlyphSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${BRAND.glyph}"><path d="${MARK_PATH}"/></svg>`;
}
