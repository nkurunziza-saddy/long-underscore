import { ICONS } from "./draw-favicon";
import { FONTS, getCSSFontFamily, getFontLink } from "./fonts";

export interface SvgConfig {
  mode?: "text" | "icon" | "svg" | "og";
  text: string;
  iconName?: string;
  iconNodes?: any[] | null;
  fontColor: string;
  backgroundColor: string;
  selectedFont: string;
  fontWeight: number;
  fontSize: number;
  borderRadius: number;
  size?: number;
}

export function generateSvg(config: SvgConfig): string {
  const {
    mode = "text",
    text,
    iconName = "Zap",
    iconNodes = null,
    fontColor,
    backgroundColor,
    selectedFont,
    fontWeight,
    fontSize,
    borderRadius,
    size = 256,
  } = config;

  const textContent = text.toUpperCase().slice(0, 2);
  const fontFamily = getCSSFontFamily(selectedFont);

  const fontData = FONTS.find((f) => f.value === selectedFont);
  const weights = fontData?.weight || [400, 700];
  const fontImportUrl = getFontLink(selectedFont, weights);

  const radius = (borderRadius / 100) * (size / 2);
  const scaledFontSize = Math.round((fontSize / 100) * size);

  const centerY = size / 2;
  const centerX = size / 2;

  let backgroundDef = "";
  let backgroundFill = backgroundColor;

  if (backgroundColor.includes("gradient")) {
    const matches = backgroundColor.match(/#[a-fA-F0-9]{3,6}|rgba?\([^)]+\)/g);
    if (matches && matches.length >= 2) {
      const gradId = "bg-gradient";
      backgroundDef = `
      <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${matches[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${matches[matches.length - 1]};stop-opacity:1" />
      </linearGradient>`;
      backgroundFill = `url(#${gradId})`;
    }
  }

  let content = "";
  if (mode === "text") {
    content = `<text 
    x="${centerX}" 
    y="${centerY}" 
    font-family="${fontFamily}" 
    font-size="${scaledFontSize}" 
    font-weight="${fontWeight}" 
    fill="${fontColor}" 
    text-anchor="middle" 
    dominant-baseline="central"
  >${escapeXml(textContent)}</text>`;
  } else if (mode === "icon") {
    const pathData = ICONS[iconName];
    const nodes = iconNodes || (pathData ? [["path", { d: pathData }]] : null);

    if (nodes) {
      const iconSize = (fontSize / 100) * size;
      const scale = iconSize / 24;
      const translate = (size - iconSize) / 2;

      const elements = nodes
        .map((node) => {
          const [tag, attrs] = node as [string, Record<string, string>];
          const attrStr = Object.entries(attrs)
            .map(([k, v]) => `${k}="${v}"`)
            .join(" ");
          return `<${tag} ${attrStr} />`;
        })
        .join("");

      content = `<g transform="translate(${translate}, ${translate}) scale(${scale})" stroke="${fontColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        ${elements}
      </g>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>${backgroundDef}</defs>
  <style>
    @import url('${fontImportUrl}');
  </style>
  <rect width="${size}" height="${size}" fill="${backgroundFill}" rx="${radius}" ry="${radius}"/>
  ${content}
</svg>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
