import { FONTS, getCSSFontFamily, getFontLink } from "./fonts";

export interface SvgConfig {
  text: string;
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
    text,
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

  // Calculate vertical position for centered text
  // Using dominant-baseline="central" for better cross-browser text centering
  const centerY = size / 2;
  const centerX = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <style>
    @import url('${fontImportUrl}');
  </style>
  <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${radius}" ry="${radius}"/>
  <text 
    x="${centerX}" 
    y="${centerY}" 
    font-family="${fontFamily}" 
    font-size="${scaledFontSize}" 
    font-weight="${fontWeight}" 
    fill="${fontColor}" 
    text-anchor="middle" 
    dominant-baseline="central"
  >${escapeXml(textContent)}</text>
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
