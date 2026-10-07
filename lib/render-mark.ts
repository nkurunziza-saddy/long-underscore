import { createCanvas } from "./canvas";
import {
  backedColors,
  type Design,
  halftoneOf,
  type MarkColors,
  resolveColors,
  type Theme,
} from "./design";
import { getCSSFontFamily } from "./fonts";
import { type CellMask, halftonePath } from "./halftone";
import { FALLBACK_ICONS, type IconNode, strokeIcon } from "./icons";
import type { SvgSource } from "./svg-source";

/** Things a mark needs that are loaded asynchronously. */
export interface MarkAssets {
  iconNodes: IconNode[] | null;
  svg: SvgSource | null;
  svgImage: HTMLImageElement | null;
  /** The cells the letter covers, when the mark is a letter in halftone. */
  mask: CellMask | null;
}

export const NO_ASSETS: MarkAssets = {
  iconNodes: null,
  svg: null,
  svgImage: null,
  mask: null,
};

/**
 * - `favicon`: exactly as designed.
 * - `apple`: iOS rounds the corners itself and turns transparency black, so
 *   the plate is opaque, square and the glyph gets some breathing room.
 * - `maskable`: Android may crop to a circle 80% wide; the glyph stays inside.
 */
export type MarkVariant = "favicon" | "apple" | "maskable";

export const CONTENT_SCALE: Record<MarkVariant, number> = {
  favicon: 1,
  apple: 0.84,
  maskable: 0.7,
};

/** Text placement as fractions of the box, so canvas and SVG agree exactly. */
export interface TextLayout {
  fontSize: number;
  /** Offsets from the box centre to the text anchor (middle, alphabetic). */
  dx: number;
  dy: number;
}

/** How much of the box width a run of text may occupy before it shrinks. */
const MAX_TEXT_WIDTH = 0.86;

/**
 * Centre text by its ink, not its em box: a logo letter should sit optically
 * centred whatever the font's metrics claim. Long text shrinks to fit.
 */
export function layoutText(
  ctx: CanvasRenderingContext2D,
  design: Design,
  box: number,
): TextLayout | null {
  if (!design.text) return null;
  const family = getCSSFontFamily(design.font);
  let fontPx = (design.scale / 100) * box;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `${design.weight} ${fontPx}px ${family}`;
  let metrics = ctx.measureText(design.text);
  const inkWidth =
    metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
  if (inkWidth > box * MAX_TEXT_WIDTH) {
    fontPx *= (box * MAX_TEXT_WIDTH) / inkWidth;
    ctx.font = `${design.weight} ${fontPx}px ${family}`;
    metrics = ctx.measureText(design.text);
  }
  return {
    fontSize: fontPx / box,
    dx:
      (metrics.actualBoundingBoxLeft - metrics.actualBoundingBoxRight) /
      2 /
      box,
    dy:
      (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) /
      2 /
      box,
  };
}

/** Measure once at high resolution; used to place text in the SVG export. */
export function measureText(design: Design): TextLayout | null {
  const ctx = createCanvas(1, 1).getContext("2d");
  return ctx ? layoutText(ctx, design, 1024) : null;
}

interface GlyphOptions {
  cx: number;
  cy: number;
  /** Side of the square the glyph is laid out in. */
  box: number;
  color: string;
}

/** The letter, icon, halftone or imported art on its own, without a plate. */
export function drawGlyph(
  ctx: CanvasRenderingContext2D,
  design: Design,
  assets: MarkAssets,
  { cx, cy, box, color }: GlyphOptions,
) {
  ctx.save();
  if (design.source === "letter") {
    const layout = layoutText(ctx, design, box);
    if (layout) {
      ctx.fillStyle = color;
      ctx.fillText(design.text, cx + layout.dx * box, cy + layout.dy * box);
    }
  } else if (design.source === "icon") {
    const nodes = assets.iconNodes ?? FALLBACK_ICONS.zap;
    const unit = ((design.scale / 100) * box) / 24;
    ctx.translate(cx - 12 * unit, cy - 12 * unit);
    ctx.scale(unit, unit);
    strokeIcon(ctx, nodes, color, design.stroke);
  } else if (design.source === "halftone") {
    // The same path the SVG export writes, so the two agree exactly.
    const side = (design.scale / 100) * box;
    ctx.fillStyle = color;
    ctx.fill(
      new Path2D(
        halftonePath(
          halftoneOf(design),
          cx - side / 2,
          cy - side / 2,
          side,
          assets.mask,
        ),
      ),
    );
  } else if (assets.svgImage && assets.svg) {
    const [, , vw, vh] = assets.svg.viewBox;
    const side = (design.scale / 100) * box;
    const width = vw >= vh ? side : side * (vw / vh);
    const height = vh >= vw ? side : side * (vh / vw);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      assets.svgImage,
      cx - width / 2,
      cy - height / 2,
      width,
      height,
    );
  }
  ctx.restore();
}

export function plateFill(
  ctx: CanvasRenderingContext2D,
  colors: MarkColors,
  size: number,
): string | CanvasGradient {
  if (!colors.bg2) return colors.bg;
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, colors.bg);
  gradient.addColorStop(1, colors.bg2);
  return gradient;
}

interface MarkOptions {
  x?: number;
  y?: number;
  size: number;
  variant?: MarkVariant;
  theme?: Theme;
  /** Override the design's colours, e.g. to invert the mark on a card. */
  colors?: MarkColors;
}

/** Draw the complete mark, plate and glyph, into a square region. */
export function drawMark(
  ctx: CanvasRenderingContext2D,
  design: Design,
  assets: MarkAssets,
  { x = 0, y = 0, size, variant = "favicon", theme, colors }: MarkOptions,
) {
  const opaque = variant !== "favicon";
  const drawn = colors ?? resolveColors(design, theme);
  // Where the mark may not be transparent, a bare glyph is given a backing.
  const resolved = opaque ? backedColors(design, drawn) : drawn;

  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.roundRect(
    0,
    0,
    size,
    size,
    opaque ? 0 : (design.radius / 100) * (size / 2),
  );
  if (opaque || !resolved.transparent) {
    ctx.fillStyle = plateFill(ctx, resolved, size);
    ctx.fill();
    ctx.clip();
  }
  drawGlyph(ctx, design, assets, {
    cx: size / 2,
    cy: size / 2,
    box: size * CONTENT_SCALE[variant],
    color: resolved.fg,
  });
  ctx.restore();
}

/** Render the mark to a fresh canvas of exactly `size` device pixels. */
export function renderMark(
  design: Design,
  assets: MarkAssets,
  size: number,
  options: Omit<MarkOptions, "size" | "x" | "y"> = {},
): HTMLCanvasElement {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (ctx) drawMark(ctx, design, assets, { ...options, size });
  return canvas;
}
