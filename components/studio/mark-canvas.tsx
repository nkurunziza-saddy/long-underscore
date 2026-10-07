"use client";

import { useEffect, useRef } from "react";
import { drawCard } from "@/lib/card";
import type { Design, Theme } from "@/lib/design";
import { drawMark, type MarkVariant } from "@/lib/render-mark";
import { cn } from "@/lib/utils";
import { useDesign } from "@/stores/studio-store";
import { useAssets } from "./assets-context";

interface MarkCanvasProps {
  /** Size in CSS pixels the mark represents (16 for a tab favicon). */
  size: number;
  /** CSS pixels to display it at; defaults to `size`. */
  display?: number;
  variant?: MarkVariant;
  theme?: Theme;
  /**
   * Backing pixels per `size` pixel. Defaults to the screen's density, which
   * is what a browser does. Pass 1 with a larger `display` for a pixel loupe.
   */
  density?: number;
  /** Preview a variation without touching the stored design. */
  design?: Design;
  className?: string;
  label?: string;
}

export function MarkCanvas({
  size,
  display = size,
  variant,
  theme,
  density,
  design: override,
  className,
  label,
}: MarkCanvasProps) {
  const stored = useDesign();
  const design = override ?? stored;
  const assets = useAssets();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const ratio = density ?? Math.max(window.devicePixelRatio || 1, 1);
    const pixels = Math.round(size * ratio);
    canvas.width = pixels;
    canvas.height = pixels;
    drawMark(ctx, design, assets, { size: pixels, variant, theme });
  }, [design, assets, size, variant, theme, density]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label ?? "Mark preview"}
      className={cn("block shrink-0", className)}
      style={{
        width: display,
        height: display,
        imageRendering: density === 1 && display > size ? "pixelated" : "auto",
      }}
    />
  );
}

interface CardCanvasProps {
  design?: Design;
  className?: string;
}

/** The social card, drawn at whatever width its box turns out to be. */
export function CardCanvas({ design: override, className }: CardCanvasProps) {
  const stored = useDesign();
  const design = override ?? stored;
  const assets = useAssets();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const ctx = canvas.getContext("2d");
      const width = canvas.clientWidth;
      if (!ctx || width === 0) return;
      const pixels = Math.min(
        1200,
        Math.round(width * Math.max(window.devicePixelRatio || 1, 1)),
      );
      canvas.width = pixels;
      canvas.height = Math.round(pixels * (630 / 1200));
      drawCard(ctx, design, assets, pixels / 1200);
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [design, assets]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Social card preview"
      className={cn("block aspect-[1200/630] w-full", className)}
    />
  );
}
