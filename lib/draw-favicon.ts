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

  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

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

  ctx.fillStyle = fontColor;
  ctx.textAlign = "center";

  ctx.textBaseline = "alphabetic";

  const scaledFontSize = Math.round((fontSize / 100) * size);

  ctx.font = `${fontWeight} ${scaledFontSize}px ${getCSSFontFamily(
    selectedFont
  )}`;

  const textContent = text;
  const metrics = ctx.measureText(textContent);
  const ascent = metrics.actualBoundingBoxAscent;
  const descent = metrics.actualBoundingBoxDescent;
  const verticalOffset = (ascent - descent) / 2;

  ctx.fillText(textContent, size / 2, size / 2 + verticalOffset);
};
