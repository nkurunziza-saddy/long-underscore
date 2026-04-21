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

export const drawFavicon = (
  canvas: HTMLCanvasElement,
  size: number,
  config: {
    mode: "text" | "icon" | "svg";
    text: string;
    iconName: string;
    iconNodes?: any[] | null;
    fontColor: string;
    backgroundColor: string;
    backgroundType?: "solid" | "gradient";
    gradientColors?: [string, string];
    selectedFont: string;
    fontWeight: number;
    fontSize: number;
    borderRadius: number;
  }
) => {
  const {
    mode,
    text,
    iconName,
    iconNodes = null,
    fontColor,
    backgroundColor,
    backgroundType = "solid",
    gradientColors = ["#000000", "#ffffff"],
    selectedFont,
    fontWeight,
    fontSize,
    borderRadius,
  } = config;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false,
  });
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  // Draw background
  const radius = (borderRadius / 100) * (size / 2);

  ctx.beginPath();
  if (backgroundType === "gradient") {
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, gradientColors[0]);
    gradient.addColorStop(1, gradientColors[1]);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = backgroundColor;
  }

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

  if (mode === "text") {
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
  } else if (mode === "icon") {
    const pathData = ICONS[iconName];
    const nodes = iconNodes || (pathData ? [["path", { d: pathData }]] : null);

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
      ctx.translate(-12, -12); // Center the 24x24 icon

      for (const [tag, attrs] of nodes) {
        if (tag === "path") {
          ctx.stroke(new Path2D(attrs.d));
        } else if (tag === "circle") {
          ctx.beginPath();
          ctx.arc(attrs.cx, attrs.cy, attrs.r, 0, Math.PI * 2);
          ctx.stroke();
        } else if (tag === "line") {
          ctx.beginPath();
          ctx.moveTo(attrs.x1, attrs.y1);
          ctx.lineTo(attrs.x2, attrs.y2);
          ctx.stroke();
        } else if (tag === "rect") {
          ctx.strokeRect(attrs.x, attrs.y, attrs.width, attrs.height);
        } else if (tag === "polyline" || tag === "polygon") {
          const points = attrs.points
            .split(" ")
            .map((p: string) => p.split(",").map(Number));
          ctx.beginPath();
          ctx.moveTo(points[0][0], points[0][1]);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
          }
          if (tag === "polygon") ctx.closePath();
          ctx.stroke();
        } else if (tag === "ellipse") {
          ctx.beginPath();
          ctx.ellipse(attrs.cx, attrs.cy, attrs.rx, attrs.ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
};
