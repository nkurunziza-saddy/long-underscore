import { createCanvas } from "./canvas";
import { contrast, mix, readableOn, tone, withAlpha } from "./color";
import {
  backedColors,
  brandColor,
  cardTagline,
  cardTitle,
  type Design,
  type MarkColors,
  type OgLayout,
  resolveColors,
  siteHost,
  siteName,
} from "./design";
import {
  type FontCategory,
  getCSSFontFamily,
  getFont,
  nearestWeight,
} from "./fonts";
import type { HalftoneCell } from "./halftone";
import { drawGlyph, drawMark, type MarkAssets, plateFill } from "./render-mark";

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const W = CARD_WIDTH;
const H = CARD_HEIGHT;
/** The margin everything keeps from the card's edge. */
const PAD = 80;
/** The small mark that signs a card. */
const SIGN = 48;

/** How much of the text colour each quieter kind of text keeps. */
const MUTED = 0.62;
const FAINT = 0.5;

interface CardPalette {
  bg: string;
  bg2: string | null;
  text: string;
  /** The brand's own colour where it reads on the card: the glow is lit with it. */
  accent: string;
  /** How the small mark is drawn so it never dissolves into the card. */
  mark: MarkColors;
  /** Plate and glyph of the big panel in the split layout. */
  panel: MarkColors;
}

/**
 * Three tones, all derived from the mark. `brand` floods the card with the
 * plate colour, so the mark itself is drawn inverted; `ink` and `paper` are
 * near-black and near-white tints of the brand hue.
 */
function cardPalette(design: Design): CardPalette {
  const colors = resolveColors(design, "light");
  // The mark with something behind it, for where the card needs it whole.
  const solid = backedColors(design, colors);
  const brand = brandColor(design);

  if (design.ogTone === "brand") {
    const middle = solid.bg2 ? mix(solid.bg, solid.bg2, 0.5) : solid.bg;
    const text =
      contrast(solid.fg, middle) >= 3 ? solid.fg : readableOn(middle);
    // A mark with a plate is turned inside out, so it stands off the flood.
    // One without stays bare: a plate is what it was designed not to have.
    const inverse: MarkColors = colors.transparent
      ? { ...colors, fg: text }
      : { fg: middle, bg: text, bg2: null, transparent: false };
    return {
      bg: solid.bg,
      bg2: solid.bg2,
      text,
      accent: text,
      mark: inverse,
      panel: inverse,
    };
  }

  const dark = design.ogTone === "ink";
  // Barely tinted: the card is a neutral for the mark to stand on.
  const bg = dark ? tone(brand, 5.5, 22) : tone(brand, 98, 36);
  const text = dark ? "#fafafa" : tone(brand, 8, 28);
  const accent =
    contrast(brand, bg) >= 2.5 ? brand : tone(brand, dark ? 62 : 42);

  // A bare glyph that is too close to the card colour borrows the text
  // colour. Imported art has no colour to change, so art that close is given
  // its backing instead.
  const lost = contrast(colors.fg, bg) < 3;
  const mark: MarkColors = !colors.transparent
    ? solid
    : lost && design.source === "svg"
      ? solid
      : { ...colors, fg: lost ? accent : colors.fg };
  // A panel that matches the card would not read as a panel; flip it. A mark
  // with no plate gets none here either, only larger.
  const panel: MarkColors = colors.transparent
    ? mark
    : contrast(mix(solid.bg, solid.bg2 ?? solid.bg, 0.5), bg) >= 1.35
      ? solid
      : { fg: readableOn(accent), bg: accent, bg2: null, transparent: false };

  return { bg, bg2: null, text, accent, mark, panel };
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n+/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (!line || ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

const widest = (ctx: CanvasRenderingContext2D, lines: string[]) =>
  Math.max(0, ...lines.map((line) => ctx.measureText(line).width));

/**
 * The same number of lines, as even in length as they will go: the narrowest
 * column that does not add a line. A headline broken this way has no word
 * left alone on its last line.
 */
function balanceLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  lines: string[],
  maxWidth: number,
): string[] {
  if (lines.length < 2) return lines;
  let best = lines;
  let narrow = 0;
  let wide = maxWidth;
  for (let pass = 0; pass < 12; pass++) {
    const width = (narrow + wide) / 2;
    const tried = wrapLines(ctx, text, width);
    if (tried.length <= lines.length && widest(ctx, tried) <= maxWidth) {
      best = tried;
      wide = width;
    } else {
      narrow = width;
    }
  }
  return best;
}

function clampLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxLines: number,
  maxWidth: number,
): string[] {
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last && ctx.measureText(`${last}…`).width > maxWidth) {
    last = last.slice(0, -1).trimEnd();
  }
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

/**
 * How tightly each kind of face is set when it is large, in ems. A sans
 * headline wants pulling together; a script or a mono face must be left as
 * it was drawn.
 */
const TRACKING: Record<FontCategory, number> = {
  "sans-serif": -0.03,
  display: -0.015,
  serif: -0.02,
  mono: 0,
  script: 0,
};

/** Set type at a size, tracked by `tracking` ems. */
function setType(
  ctx: CanvasRenderingContext2D,
  font: string,
  px: number,
  tracking = 0,
) {
  ctx.font = font;
  // Where a browser has no letter spacing on canvas, this sets nothing.
  ctx.letterSpacing = `${(px * tracking).toFixed(2)}px`;
}

interface FitOptions {
  font: (px: number) => string;
  tracking: number;
  maxWidth: number;
  maxLines: number;
  max: number;
  min: number;
  /** Tallest the block may get, given `lineHeight` as a multiple of size. */
  maxHeight?: number;
  lineHeight: number;
}

/**
 * The largest size at which the text fits the box, broken into balanced
 * lines; headlines never overflow. Leaves the context set in that type.
 */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  {
    font,
    tracking,
    maxWidth,
    maxLines,
    max,
    min,
    maxHeight = Number.POSITIVE_INFINITY,
    lineHeight,
  }: FitOptions,
) {
  for (let px = max; px > min; px -= 2) {
    setType(ctx, font(px), px, tracking);
    const lines = wrapLines(ctx, text, maxWidth);
    if (
      lines.length <= maxLines &&
      widest(ctx, lines) <= maxWidth &&
      lines.length * px * lineHeight <= maxHeight
    ) {
      return { px, lines: balanceLines(ctx, text, lines, maxWidth) };
    }
  }
  setType(ctx, font(min), min, tracking);
  const lines = clampLines(
    ctx,
    wrapLines(ctx, text, maxWidth),
    maxLines,
    maxWidth,
  );
  return { px: min, lines };
}

/** How strongly a texture shows at a point of the card, 0 to 1. */
type Falloff = (x: number, y: number) => number;

const ease = (t: number) => {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
};

/**
 * Where a card's texture gathers: in the corner furthest from the words, and
 * gone by the time it would reach them. Centred words are left the middle,
 * so the texture takes both top corners.
 */
function falloff(layout: OgLayout): Falloff {
  if (layout === "centered") {
    return (x, y) => ease(1 - Math.hypot(Math.min(x, W - x), y) / 560);
  }
  return (x, y) => ease(1 - Math.hypot(W - x, y) / 860);
}

/** The cells of the halftone texture, as one path at a given step of size. */
function halftoneField(
  cell: HalftoneCell,
  strength: Falloff,
  pitch: number,
): Path2D {
  const path = new Path2D();
  for (let y = pitch / 2; y < H; y += pitch) {
    for (let x = pitch / 2; x < W; x += pitch) {
      // Four sizes and no more, as in the mark.
      const step = Math.ceil(strength(x, y) * 4 - 0.35) / 4;
      if (step <= 0) continue;
      const side = pitch * 0.7 * step;
      if (cell === "dot") {
        path.moveTo(x + side / 2, y);
        path.arc(x, y, side / 2, 0, Math.PI * 2);
      } else {
        path.roundRect(
          x - side / 2,
          y - side / 2,
          side,
          side,
          cell === "soft" ? side * 0.3 : 0,
        );
      }
    }
  }
  return path;
}

/**
 * The card's texture: one quiet layer in the text colour, strongest where
 * `falloff` says and absent under the words.
 */
function drawPattern(
  ctx: CanvasRenderingContext2D,
  design: Design,
  palette: CardPalette,
) {
  const strength = falloff(design.ogLayout);

  if (design.ogPattern === "grid") {
    const pitch = 60;
    const fade = (x0: number, y0: number, x1: number, y1: number) => {
      const line = ctx.createLinearGradient(x0, y0, x1, y1);
      for (let stop = 0; stop <= 6; stop++) {
        const t = stop / 6;
        line.addColorStop(
          t,
          withAlpha(
            palette.text,
            0.13 * strength(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t),
          ),
        );
      }
      return line;
    };
    ctx.lineWidth = 1;
    for (let x = PAD + 0.5; x < W; x += pitch) {
      ctx.strokeStyle = fade(x, 0, x, H);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = PAD + 0.5; y < H; y += pitch) {
      ctx.strokeStyle = fade(0, y, W, y);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  } else if (design.ogPattern === "dots") {
    const pitch = 24;
    // One path for each of a few strengths, so a thousand dots are six fills.
    const levels = Array.from({ length: 6 }, () => new Path2D());
    for (let y = PAD % pitch; y < H; y += pitch) {
      for (let x = PAD % pitch; x < W; x += pitch) {
        const level = Math.ceil(strength(x, y) * levels.length) - 1;
        if (level < 0) continue;
        levels[level].moveTo(x + 1.4, y);
        levels[level].arc(x, y, 1.4, 0, Math.PI * 2);
      }
    }
    levels.forEach((dots, level) => {
      ctx.fillStyle = withAlpha(
        palette.text,
        (0.36 * (level + 1)) / levels.length,
      );
      ctx.fill(dots);
    });
  } else if (design.ogPattern === "glow") {
    const [x, y] = design.ogLayout === "centered" ? [W / 2, -140] : [W, -60];
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 820);
    glow.addColorStop(0, withAlpha(palette.accent, 0.36));
    glow.addColorStop(0.5, withAlpha(palette.accent, 0.1));
    glow.addColorStop(1, withAlpha(palette.accent, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  } else if (design.ogPattern === "halftone") {
    // The mark's own cells where it is a halftone; squares otherwise.
    const cell = design.source === "halftone" ? design.htCell : "square";
    // Dark cells on a pale card carry further than pale ones on a dark card.
    ctx.fillStyle = withAlpha(
      palette.text,
      design.ogTone === "paper" ? 0.07 : 0.1,
    );
    ctx.fill(halftoneField(cell, strength, 30));
  }
}

/** A hairline round a mark whose plate would otherwise dissolve into the card. */
function outlineMark(
  ctx: CanvasRenderingContext2D,
  design: Design,
  palette: CardPalette,
  colors: MarkColors,
  x: number,
  y: number,
  size: number,
) {
  if (colors.transparent) return;
  const plate = mix(colors.bg, colors.bg2 ?? colors.bg, 0.5);
  if (contrast(plate, palette.bg) >= 1.2) return;
  ctx.strokeStyle = withAlpha(palette.text, 0.16);
  ctx.lineWidth = Math.max(1, size / 48);
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, (design.radius / 100) * (size / 2));
  ctx.stroke();
}

/** The roles type plays on a card, each a function of its size. */
interface CardType {
  headline: (px: number) => string;
  label: (px: number) => string;
  body: (px: number) => string;
  /** How tightly large type is set, in ems. */
  tracking: number;
}

/** Mark and site name: the signature in a card's top left corner. */
function drawSignature(
  ctx: CanvasRenderingContext2D,
  design: Design,
  assets: MarkAssets,
  palette: CardPalette,
  type: CardType,
) {
  drawMark(ctx, design, assets, {
    x: PAD,
    y: PAD,
    size: SIGN,
    colors: palette.mark,
  });
  outlineMark(ctx, design, palette, palette.mark, PAD, PAD, SIGN);
  ctx.fillStyle = palette.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  setType(ctx, type.label(26), 26, type.tracking / 2);
  ctx.fillText(siteName(design), PAD + SIGN + 16, PAD + SIGN / 2 + 1, 640);
}

/** The site's address, small and quiet. Nothing where none was given. */
function drawHost(
  ctx: CanvasRenderingContext2D,
  design: Design,
  palette: CardPalette,
  type: CardType,
  x: number,
  y: number,
  align: CanvasTextAlign,
) {
  const host = siteHost(design);
  if (!host) return;
  ctx.fillStyle = withAlpha(palette.text, FAINT);
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  setType(ctx, type.body(22), 22);
  ctx.fillText(host, x, y, 420);
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  firstBaseline: number,
  lineHeight: number,
) {
  lines.forEach((line, index) => {
    ctx.fillText(line, x, firstBaseline + index * lineHeight);
  });
}

/** A headline over its tagline, as measured: what a layout then places. */
interface Words {
  title: { px: number; lines: string[]; line: number };
  tagline: { px: number; lines: string[]; line: number };
  /** From the headline's last baseline to the tagline's first. */
  gap: number;
  /** From the top of the headline's capitals to the last baseline of all. */
  height: number;
}

interface WordsOptions {
  maxWidth: number;
  /** The headline's largest size, and how many lines it may take. */
  max: number;
  maxLines: number;
  /** The tagline's size, and how many lines it may take. */
  small: number;
  smallLines: number;
  /** The widest the tagline may run, where something shares its line. */
  smallWidth?: number;
  /** The tallest the two may be together. */
  maxHeight?: number;
}

/** Measure a card's headline and tagline for a column `maxWidth` wide. */
function setWords(
  ctx: CanvasRenderingContext2D,
  design: Design,
  type: CardType,
  {
    maxWidth,
    max,
    maxLines,
    small,
    smallLines,
    smallWidth = maxWidth,
    maxHeight,
  }: WordsOptions,
): Words {
  // A line of small type is read comfortably up to about thirty ems.
  const measure = Math.min(maxWidth, smallWidth, small * 30);
  setType(ctx, type.body(small), small);
  const wrapped = wrapLines(ctx, cardTagline(design), measure);
  const taglineLines =
    wrapped.length > smallLines
      ? clampLines(ctx, wrapped, smallLines, measure)
      : balanceLines(ctx, cardTagline(design), wrapped, measure);
  const tagline = { px: small, lines: taglineLines, line: small * 1.4 };
  // Room for the headline's descenders, a clear gap, then the tagline's own
  // height; the headline's part of it is added once its size is known.
  const clear = taglineLines.length > 0 ? 26 + small * 0.72 : 0;
  const rest = Math.max(0, taglineLines.length - 1) * tagline.line;

  const fitted = fitText(ctx, cardTitle(design), {
    font: type.headline,
    tracking: type.tracking,
    maxWidth,
    maxLines,
    max,
    min: 44,
    maxHeight:
      maxHeight === undefined ? undefined : maxHeight - clear - rest - 20,
    lineHeight: 1.06,
  });
  const title = { ...fitted, line: fitted.px * 1.06 };
  const gap = clear > 0 ? clear + title.px * 0.22 : 0;
  const below = gap + rest;
  return {
    title,
    tagline,
    gap,
    // Capitals stand about 0.72 of the size above the baseline.
    height: title.px * 0.72 + (title.lines.length - 1) * title.line + below,
  };
}

/**
 * Draw measured words with the top of the headline's capitals at `top`.
 * `x` is the left edge, or the middle where `align` is centre.
 */
function drawWords(
  ctx: CanvasRenderingContext2D,
  palette: CardPalette,
  type: CardType,
  words: Words,
  x: number,
  top: number,
  align: CanvasTextAlign,
) {
  const { title, tagline, gap } = words;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  const first = top + title.px * 0.72;
  ctx.fillStyle = palette.text;
  setType(ctx, type.headline(title.px), title.px, type.tracking);
  drawLines(ctx, title.lines, x, first, title.line);
  const last = first + (title.lines.length - 1) * title.line;
  ctx.fillStyle = withAlpha(palette.text, MUTED);
  setType(ctx, type.body(tagline.px), tagline.px);
  drawLines(ctx, tagline.lines, x, last + gap, tagline.line);
}

/**
 * Draw the 1200×630 social card. Pass `scale` below 1 for thumbnails; the
 * layout is identical at every size because it is scaled, not reflowed.
 *
 * Every layout is the same few things, set with room round them: the mark,
 * the name, a headline, a line under it and the address. Nothing is drawn
 * that is not one of them, bar one texture kept clear of the words.
 */
export function drawCard(
  ctx: CanvasRenderingContext2D,
  design: Design,
  assets: MarkAssets,
  scale = 1,
) {
  const palette = cardPalette(design);
  const family = getCSSFontFamily(design.font);
  const font = (weight: number) => (px: number) =>
    `${nearestWeight(design.font, weight)} ${px}px ${family}`;
  const type: CardType = {
    headline: font(headlineWeight(design)),
    label: font(600),
    body: font(400),
    tracking: TRACKING[getFont(design.font).category],
  };

  ctx.save();
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();

  ctx.fillStyle = plateFill(
    ctx,
    { fg: palette.text, bg: palette.bg, bg2: palette.bg2, transparent: false },
    Math.max(W, H),
  );
  ctx.fillRect(0, 0, W, H);
  drawPattern(ctx, design, palette);

  const layout = design.ogLayout;

  if (layout === "statement" || layout === "poster") {
    // The signature along the top, the words along the bottom, and all the
    // room between them left empty.
    const poster = layout === "poster";
    if (poster) {
      // The mark's glyph, run off the right edge, as a watermark.
      ctx.save();
      ctx.globalAlpha = 0.07;
      drawGlyph(ctx, design, assets, {
        cx: W - 210,
        cy: H / 2 + 24,
        box: 940,
        color: palette.text,
      });
      ctx.restore();
    }
    drawSignature(ctx, design, assets, palette, type);
    // The address shares the words' last line, at the far end of it: the
    // corner above is left to the texture.
    drawHost(ctx, design, palette, type, W - PAD, H - PAD - 14, "right");
    // The tagline stops short of the address, however long that is.
    setType(ctx, type.body(22), 22);
    const hostWidth = Math.min(420, ctx.measureText(siteHost(design)).width);

    const words = setWords(ctx, design, type, {
      maxWidth: poster ? 860 : 900,
      max: poster ? 104 : 84,
      maxLines: 3,
      small: 30,
      smallLines: 2,
      smallWidth: W - PAD * 2 - hostWidth - 56,
      maxHeight: H - PAD * 2 - SIGN - 56,
    });
    // The last baseline sits a descender's depth above the margin.
    drawWords(
      ctx,
      palette,
      type,
      words,
      PAD,
      H - PAD - 6 - words.height,
      "left",
    );
  } else if (layout === "centered") {
    // One column down the middle: mark, words, and the name at the foot.
    const markSize = 88;
    const words = setWords(ctx, design, type, {
      maxWidth: 940,
      max: 76,
      maxLines: 2,
      small: 28,
      smallLines: 2,
    });
    const foot = H - 62;
    const block = markSize + 48 + words.height;
    const top = Math.max(52, (foot - 28 - block) / 2 + 6);

    const markX = (W - markSize) / 2;
    drawMark(ctx, design, assets, {
      x: markX,
      y: top,
      size: markSize,
      colors: palette.mark,
    });
    outlineMark(ctx, design, palette, palette.mark, markX, top, markSize);
    drawWords(ctx, palette, type, words, W / 2, top + markSize + 48, "center");

    const host = siteHost(design);
    ctx.fillStyle = withAlpha(palette.text, FAINT);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setType(ctx, type.body(22), 22);
    ctx.fillText(
      host ? `${siteName(design)}  ·  ${host}` : siteName(design),
      W / 2,
      foot,
      W - PAD * 2,
    );
  } else {
    // Split: the words on the left, and on the right the mark itself, large,
    // with the corners it was given.
    const tile = 380;
    const tileX = W - PAD - tile;
    const tileY = (H - tile) / 2;
    drawMark(ctx, design, assets, {
      x: tileX,
      y: tileY,
      size: tile,
      colors: palette.panel,
    });
    outlineMark(ctx, design, palette, palette.panel, tileX, tileY, tile);

    const maxWidth = tileX - PAD - 64;
    ctx.fillStyle = palette.text;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    setType(ctx, type.label(26), 26, type.tracking / 2);
    ctx.fillText(siteName(design), PAD, PAD + SIGN / 2 + 1, maxWidth);
    drawHost(ctx, design, palette, type, PAD, H - PAD - 10, "left");

    const words = setWords(ctx, design, type, {
      maxWidth,
      max: 68,
      maxLines: 4,
      small: 26,
      smallLines: 3,
      maxHeight: H - PAD * 2 - 2 * 64,
    });
    drawWords(ctx, palette, type, words, PAD, (H - words.height) / 2, "left");
  }

  ctx.restore();
}

/**
 * The headline's weight: the mark's own where the mark is a letter, kept
 * between semibold and bold. Heavier than that shouts.
 */
function headlineWeight(design: Pick<Design, "source" | "weight">): number {
  return design.source === "letter"
    ? Math.min(Math.max(design.weight, 600), 700)
    : 600;
}

export function renderCard(
  design: Design,
  assets: MarkAssets,
): HTMLCanvasElement {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  if (ctx) drawCard(ctx, design, assets);
  return canvas;
}

/** Every font weight the card may draw with, for preloading. */
export function cardWeights(design: Pick<Design, "font" | "weight">): number[] {
  const wanted = [400, 600, 700];
  return [
    ...new Set(wanted.map((weight) => nearestWeight(design.font, weight))),
  ];
}
