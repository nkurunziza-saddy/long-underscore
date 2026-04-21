import { applyBackground, ICONS } from "./draw-favicon";
import { getCSSFontFamily } from "./fonts";

export type OgLayout = "studio" | "browser" | "hero" | "split" | "minimal";

export interface OgConfig {
  title: string;
  description: string;
  siteName: string;
  fontColor: string;
  backgroundColor: string;
  selectedFont: string;
  fontWeight: number;
  borderRadius: number;
  layout: OgLayout;
  // Branding
  logoMode: "text" | "icon" | "svg";
  logoText: string;
  logoIconName: string;
  logoIconNodes?: unknown[] | null;
  logoSvg?: string | null;
  logoSize: number;
  // Creative
  showGlassCard?: boolean;
  meshOpacity?: number;
}

export async function drawOg(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  config: OgConfig,
) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const {
    title,
    description,
    siteName,
    fontColor,
    backgroundColor,
    selectedFont,
    borderRadius,
    layout,
    logoMode,
    logoText,
    logoIconName,
    logoIconNodes,
    logoSvg,
    logoSize,
    showGlassCard = true,
    meshOpacity = 0.4,
  } = config;

  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  const fontFamily = getCSSFontFamily(selectedFont);

  // 1. Draw Background
  const radius = (borderRadius / 100) * (height / 2);
  applyBackground(ctx, width, height, backgroundColor, radius);

  // 2. Mesh Glow
  if (meshOpacity > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    const glow1 = ctx.createRadialGradient(
      width * 0.8,
      height * 0.2,
      0,
      width * 0.8,
      height * 0.2,
      width * 0.6,
    );
    glow1.addColorStop(0, `rgba(255, 255, 255, ${meshOpacity})`);
    glow1.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const padding = 80;

  if (layout === "browser") {
    const frameW = width * 0.85;
    const frameH = height * 0.7;
    const frameX = (width - frameW) / 2;
    const frameY = height * 0.2;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(frameX, frameY, frameW, frameH, 12);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#f1f5f9";
    ctx.beginPath();
    // [top-left, top-right, bottom-right, bottom-left]
    ctx.roundRect(frameX, frameY, frameW, 40, [12, 12, 0, 0]);
    ctx.fill();
    const colors = ["#ff5f56", "#ffbd2e", "#27c93f"];
    for (let i = 0; i < colors.length; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.arc(frameX + 20 + i * 20, frameY + 20, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textAlign = "center";
    ctx.fillStyle = "#1e293b";
    ctx.font = `600 56px ${fontFamily}`;
    ctx.fillText(title, width / 2, frameY + frameH * 0.45);
    ctx.font = `400 24px ${fontFamily}`;
    ctx.globalAlpha = 0.6;
    ctx.fillText(description, width / 2, frameY + frameH * 0.65);
    ctx.globalAlpha = 1.0;
    ctx.save();
    ctx.translate(width / 2, height * 0.1);
    await renderLogo(
      ctx,
      60,
      logoMode,
      logoText,
      logoIconName,
      logoIconNodes,
      logoSvg,
      fontColor,
    );
    ctx.restore();
  } else if (layout === "hero") {
    ctx.textAlign = "left";
    ctx.fillStyle = fontColor;
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.translate(width * 0.8, height * 0.5);
    await renderLogo(
      ctx,
      500,
      logoMode,
      logoText,
      logoIconName,
      logoIconNodes,
      logoSvg,
      fontColor,
    );
    ctx.restore();
    ctx.font = `800 84px ${fontFamily}`;
    const lines = wrapText(ctx, title, width * 0.65);
    let y = height * 0.38;
    for (const l of lines) {
      ctx.fillText(l, padding, y);
      y += 95;
    }
    ctx.font = `400 32px ${fontFamily}`;
    ctx.globalAlpha = 0.7;
    ctx.fillText(description, padding, y + 20);
    ctx.globalAlpha = 1.0;
    ctx.save();
    ctx.translate(padding + 25, height - padding - 20);
    await renderLogo(
      ctx,
      40,
      logoMode,
      logoText,
      logoIconName,
      logoIconNodes,
      logoSvg,
      fontColor,
    );
    ctx.font = `600 22px ${fontFamily}`;
    ctx.fillText(siteName.toUpperCase(), 35, 8);
    ctx.restore();
  } else if (layout === "split") {
    ctx.textAlign = "left";
    ctx.fillStyle = fontColor;
    ctx.font = `700 80px ${fontFamily}`;
    const lines = wrapText(ctx, title, width * 0.5);
    let y = 140;
    for (const l of lines) {
      ctx.fillText(l, padding, y);
      y += 95;
    }
    ctx.font = `400 30px ${fontFamily}`;
    ctx.globalAlpha = 0.7;
    const dLines = wrapText(ctx, description, width * 0.45);
    y += 20;
    for (const l of dLines) {
      ctx.fillText(l, padding, y);
      y += 45;
    }
    ctx.globalAlpha = 0.9;
    ctx.font = `600 22px ${fontFamily}`;
    ctx.fillText(siteName.toUpperCase(), padding, height - padding);
    ctx.save();
    ctx.translate(width * 0.75, height / 2);
    ctx.globalAlpha = 0.1;
    await renderLogo(
      ctx,
      450,
      logoMode,
      logoText,
      logoIconName,
      logoIconNodes,
      logoSvg,
      fontColor,
    );
    ctx.globalAlpha = 1.0;
    await renderLogo(
      ctx,
      220,
      logoMode,
      logoText,
      logoIconName,
      logoIconNodes,
      logoSvg,
      fontColor,
    );
    ctx.restore();
  } else if (layout === "minimal") {
    ctx.save();
    ctx.translate(width / 2, height / 2 - 60);
    await renderLogo(
      ctx,
      logoSize * 2.2,
      logoMode,
      logoText,
      logoIconName,
      logoIconNodes,
      logoSvg,
      fontColor,
    );
    ctx.restore();
    ctx.textAlign = "center";
    ctx.fillStyle = fontColor;
    ctx.font = `700 52px ${fontFamily}`;
    ctx.fillText(siteName.toUpperCase(), width / 2, height / 2 + 100);
    ctx.globalAlpha = 0.6;
    ctx.font = `400 26px ${fontFamily}`;
    ctx.fillText(title, width / 2, height / 2 + 150);
  } else {
    // "studio"
    if (showGlassCard) {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.roundRect(
        padding / 2,
        padding / 2,
        width - padding,
        height - padding,
        24,
      );
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(width / 2, height * 0.25);
    await renderLogo(
      ctx,
      logoSize * 1.6,
      logoMode,
      logoText,
      logoIconName,
      logoIconNodes,
      logoSvg,
      fontColor,
    );
    ctx.restore();
    ctx.textAlign = "center";
    ctx.fillStyle = fontColor;
    ctx.font = `700 76px ${fontFamily}`;
    const lines = wrapText(ctx, title, width - padding * 2.5);
    let y = height * 0.52;
    for (const l of lines) {
      ctx.fillText(l, width / 2, y);
      y += 90;
    }
    ctx.font = `400 30px ${fontFamily}`;
    ctx.globalAlpha = 0.75;
    const dLines = wrapText(ctx, description, width * 0.7);
    y += 10;
    for (const l of dLines) {
      ctx.fillText(l, width / 2, y);
      y += 45;
    }
    ctx.globalAlpha = 1.0;
    ctx.font = `600 22px ${fontFamily}`;
    ctx.fillText(siteName.toUpperCase(), width / 2, height - padding);
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(`${currentLine} ${word}`).width;
    if (width < maxWidth) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

async function renderLogo(
  ctx: CanvasRenderingContext2D,
  size: number,
  mode: "text" | "icon" | "svg",
  text: string,
  iconName: string,
  iconNodes: unknown[] | null | undefined,
  logoSvg: string | null | undefined,
  color: string,
) {
  ctx.save();
  if (mode === "text") {
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.toUpperCase().slice(0, 1), 0, 0);
  } else if (mode === "icon") {
    const nodes =
      (iconNodes as any[]) ||
      (ICONS[iconName] ? [["path", { d: ICONS[iconName] }]] : null);
    if (nodes) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const scale = size / 24;
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
    }
  } else if (mode === "svg" && logoSvg) {
    try {
      const img = new Image();
      const blob = new Blob([logoSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      URL.revokeObjectURL(url);
    } catch (_e) {
      ctx.fillStyle = color;
      ctx.font = `bold ${size}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", 0, 0);
    }
  }
  ctx.restore();
}
