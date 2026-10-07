import {
  type Design,
  halftoneOf,
  hasDarkVariant,
  resolveColors,
} from "./design";
import { getCSSFontFamily } from "./fonts";
import { halftonePath } from "./halftone";
import { FALLBACK_ICONS, iconToSvg } from "./icons";
import type { MarkAssets, TextLayout } from "./render-mark";

const VIEW = 64;

const round = (value: number) => Math.round(value * 1000) / 1000;

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface SvgOptions {
  /** Canvas-measured placement; without it the text is centred by em box. */
  textLayout?: TextLayout | null;
  /** Inlined subset font so the letter survives where web fonts cannot load. */
  fontDataUrl?: string | null;
}

/**
 * The mark as a standalone SVG. It carries its own dark-mode styling through
 * `prefers-color-scheme`, which browsers evaluate against their chrome when
 * the file is used as a favicon.
 */
export function buildMarkSvg(
  design: Design,
  assets: MarkAssets,
  { textLayout, fontDataUrl }: SvgOptions = {},
): string {
  const light = resolveColors(design, "light");
  const dark = resolveColors(design, "dark");
  const adaptive = hasDarkVariant(design);
  const hasPlate = !light.transparent;
  const radius = round((design.radius / 100) * (VIEW / 2));
  const half = VIEW / 2;

  const glyphPaint = design.source === "icon" ? "stroke" : "fill";
  const rules = (colors: typeof light) => {
    const out: string[] = [];
    if (hasPlate) {
      if (light.bg2) {
        out.push(`.a{stop-color:${colors.bg}}`);
        out.push(`.b{stop-color:${colors.bg2 ?? colors.bg}}`);
      } else {
        out.push(`.p{fill:${colors.bg}}`);
      }
    }
    if (design.source !== "svg") {
      out.push(`.g{${glyphPaint}:${colors.fg};color:${colors.fg}}`);
    }
    return out.join("");
  };

  let style = rules(light);
  if (adaptive) style += `@media (prefers-color-scheme:dark){${rules(dark)}}`;
  if (design.source === "letter" && fontDataUrl) {
    style += `@font-face{font-family:m;font-weight:${design.weight};src:url(${fontDataUrl}) format("woff2")}`;
  }

  let defs = "";
  if (hasPlate && light.bg2) {
    defs += `<linearGradient id="_p" x1="0" y1="0" x2="1" y2="1"><stop class="a" offset="0"/><stop class="b" offset="1"/></linearGradient>`;
  }
  if (hasPlate && radius > 0) {
    defs += `<clipPath id="_c"><rect width="${VIEW}" height="${VIEW}" rx="${radius}"/></clipPath>`;
  }

  let glyph = "";
  if (design.source === "letter" && design.text) {
    const family = `${fontDataUrl ? "m," : ""}${getCSSFontFamily(design.font)}`;
    const size = round((textLayout?.fontSize ?? design.scale / 100) * VIEW);
    const x = round(half + (textLayout?.dx ?? 0) * VIEW);
    const position = textLayout
      ? `y="${round(half + textLayout.dy * VIEW)}"`
      : `y="${half}" dominant-baseline="central"`;
    glyph = `<text class="g" x="${x}" ${position} font-family="${escapeXml(family)}" font-size="${size}" font-weight="${design.weight}" text-anchor="middle">${escapeXml(design.text)}</text>`;
  } else if (design.source === "icon") {
    const nodes = assets.iconNodes ?? FALLBACK_ICONS.zap;
    const unit = ((design.scale / 100) * VIEW) / 24;
    const offset = round(half - 12 * unit);
    glyph = `<g class="g" fill="none" stroke-width="${design.stroke}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${offset} ${offset}) scale(${round(unit)})">${iconToSvg(nodes)}</g>`;
  } else if (design.source === "halftone") {
    const side = (design.scale / 100) * VIEW;
    const offset = half - side / 2;
    glyph = `<path class="g" d="${halftonePath(halftoneOf(design), offset, offset, side, assets.mask)}"/>`;
  } else if (design.source === "svg" && assets.svg) {
    const [vx, vy, vw, vh] = assets.svg.viewBox;
    const side = (design.scale / 100) * VIEW;
    const width = vw >= vh ? side : side * (vw / vh);
    const height = vh >= vw ? side : side * (vh / vw);
    glyph = `<svg x="${round(half - width / 2)}" y="${round(half - height / 2)}" width="${round(width)}" height="${round(height)}" viewBox="${vx} ${vy} ${vw} ${vh}" ${assets.svg.rootAttrs}>${assets.svg.inner}</svg>`;
  }

  const plate = hasPlate
    ? `<rect ${light.bg2 ? 'fill="url(#_p)"' : 'class="p"'} width="${VIEW}" height="${VIEW}" rx="${radius}"/>`
    : "";
  const clipped =
    hasPlate && radius > 0 ? `<g clip-path="url(#_c)">${glyph}</g>` : glyph;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}">`,
    style ? `<style>${style}</style>` : "",
    defs ? `<defs>${defs}</defs>` : "",
    plate,
    clipped,
    "</svg>",
  ]
    .filter(Boolean)
    .join("\n");
}
