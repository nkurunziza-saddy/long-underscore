import { getCSSFontFamily } from "./fonts";

export const ICONS: Record<string, string> = {
  Zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  Heart:
    "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 000-7.78z",
  Star: "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  Smile:
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-5c-2.5 0-4-2-4-2s1.5-2 4-2 4 2 4 2-1.5 2-4 2zm-3.5-9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm7 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z",
  Code: "m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16",
  Flame:
    "M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z",
  Coffee:
    "M17 8h1a4 4 0 110 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v2M10 2v2M14 2v2",
  Globe:
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0 0V2m10 10H2m18 0a18 18 0 00-16 0",
  Github:
    "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 00-.94 2.58V22",
  Twitter:
    "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
};

/**
 * Helper to apply background color or gradient to canvas
 */
export function applyBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  radius: number,
) {
  if (color === "transparent") return;

  ctx.beginPath();
  if (color.includes("gradient")) {
    const matches = color.match(/#[a-fA-F0-9]{3,6}|rgba?\([^)]+\)/g);
    if (matches && matches.length >= 2) {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, matches[0]);
      gradient.addColorStop(1, matches[matches.length - 1]);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = color;
    }
  } else {
    ctx.fillStyle = color;
  }

  ctx.roundRect(0, 0, width, height, radius);
  ctx.fill();
}

export function drawFavicon(
  canvas: HTMLCanvasElement,
  size: number,
  config: {
    mode: "text" | "icon" | "svg";
    text: string;
    iconName: string;
    iconNodes?: unknown[] | null;
    fontColor: string;
    backgroundColor: string;
    selectedFont: string;
    fontWeight: number;
    fontSize: number;
    borderRadius: number;
  },
) {
  const {
    mode,
    text,
    iconName,
    iconNodes = null,
    fontColor,
    backgroundColor,
    selectedFont,
    fontWeight,
    fontSize,
    borderRadius,
  } = config;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  const radius = (borderRadius / 100) * (size / 2);
  applyBackground(ctx, size, size, backgroundColor, radius);

  if (mode === "text") {
    ctx.fillStyle = fontColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    const scaledFontSize = Math.round((fontSize / 100) * size);
    ctx.font = `${fontWeight} ${scaledFontSize}px ${getCSSFontFamily(selectedFont)}`;

    // Precise vertical centering
    const metrics = ctx.measureText(text);
    const verticalOffset =
      (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;

    ctx.fillText(text, size / 2, size / 2 + verticalOffset);
  } else if (mode === "icon") {
    const nodes =
      (iconNodes as any[]) ||
      (ICONS[iconName] ? [["path", { d: ICONS[iconName] }]] : null);
    if (nodes) {
      ctx.strokeStyle = fontColor;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const iconSize = (fontSize / 100) * size;
      const scale = iconSize / 24;

      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.scale(scale, scale);
      ctx.translate(-12, -12);

      for (const node of nodes) {
        const [tag, attrs] = node as [string, Record<string, any>];
        if (tag === "path") ctx.stroke(new Path2D(attrs.d));
        else if (tag === "circle") {
          ctx.beginPath();
          ctx.arc(attrs.cx, attrs.cy, attrs.r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
}
