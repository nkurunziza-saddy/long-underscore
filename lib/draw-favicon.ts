import { getCSSFontFamily } from "./fonts";

export const drawFavicon = (
  canvas: HTMLCanvasElement,
  size: number,
  {
    text,
    fontColor,
    backgroundColor,
    selectedFont,
    fontWeight,
    fontSize,
    borderRadius,
  }: {
    text: string;
    fontColor: string;
    backgroundColor: string;
    selectedFont: string;
    fontWeight: number;
    fontSize: number;
    borderRadius: number;
  }
) => {
  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false,
  });
  if (!ctx) return;

  // 1. Setup Canvas
  // Set dimensions and clear any previous content
  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  // 2. Draw Background
  // Create a rounded rectangle path for the background
  ctx.fillStyle = backgroundColor;
  const radius = (borderRadius / 100) * (size / 2);

  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.arcTo(size, 0, size, radius, radius);
  ctx.lineTo(size, size - radius);
  ctx.arcTo(size, size, size - radius, size, radius);
  ctx.lineTo(radius, size);
  ctx.arcTo(0, size, 0, size - radius, radius);
  ctx.lineTo(0, radius);
  ctx.arcTo(0, 0, radius, 0, radius);
  ctx.fill();

  // 3. Draw Text
  // Configure text rendering
  ctx.fillStyle = fontColor;
  ctx.textAlign = "center";
  // We use 'alphabetic' baseline to have full control over vertical positioning
  // based on the actual text metrics
  ctx.textBaseline = "alphabetic";

  // Calculate font size as a percentage of the canvas size
  // This ensures the text scales perfectly with the favicon size
  const scaledFontSize = Math.round((fontSize / 100) * size);

  ctx.font = `${fontWeight} ${scaledFontSize}px ${getCSSFontFamily(
    selectedFont
  )}`;

  const textContent = text.toUpperCase().slice(0, 2);

  // 4. Center Text
  // Measure the actual rendered text dimensions to center it perfectly
  const metrics = ctx.measureText(textContent);

  // actualBoundingBoxAscent: distance from baseline to top of text
  // actualBoundingBoxDescent: distance from baseline to bottom of text
  // To center vertically, we need to shift the baseline down by half the difference
  // between ascent and descent.
  // Formula: y = center + (ascent - descent) / 2
  const ascent = metrics.actualBoundingBoxAscent;
  const descent = metrics.actualBoundingBoxDescent;
  const verticalOffset = (ascent - descent) / 2;

  ctx.fillText(textContent, size / 2, size / 2 + verticalOffset);
};
