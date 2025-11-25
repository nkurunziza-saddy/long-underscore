"use client";

import { useEffect, useRef } from "react";
import { useUrlSync } from "@/hooks/use-url-sync";
import { colorPalettes } from "@/lib/color-palletes";
import { drawFavicon } from "@/lib/draw-favicon";
import { useFaviconStore } from "@/stores/favicon-store";
import { ColorPickerPanel } from "./color-picker-panel";
import { EditorControls } from "./editor-controls";
import { FaviconHeader } from "./favicon-header";
import { FaviconPreviewPanel } from "./favicon-preview-panel";
import { MetadataForm } from "./metadata-form";
import { ShadeSelectorPanel } from "./shade-selector-panel";

export function FaviconGenerator() {
  useUrlSync();

  const text = useFaviconStore((state) => state.text);
  const fontColor = useFaviconStore((state) => state.fontColor);
  const backgroundColor = useFaviconStore((state) => state.backgroundColor);
  const selectedFont = useFaviconStore((state) => state.selectedFont);
  const fontWeight = useFaviconStore((state) => state.fontWeight);
  const fontSize = useFaviconStore((state) => state.fontSize);
  const borderRadius = useFaviconStore((state) => state.borderRadius);
  const selectedColorFamily = useFaviconStore(
    (state) => state.selectedColorFamily
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewLargeRef = useRef<HTMLCanvasElement>(null);
  const previewMediumRef = useRef<HTMLCanvasElement>(null);
  const previewSmallRef = useRef<HTMLCanvasElement>(null);

  const backgroundShades =
    colorPalettes[selectedColorFamily as keyof typeof colorPalettes];

  useEffect(() => {
    const config = {
      text,
      fontColor,
      backgroundColor,
      selectedFont,
      fontWeight,
      fontSize,
      borderRadius,
    };

    const updateCanvases = () => {
      if (canvasRef.current) drawFavicon(canvasRef.current, 512, config);
      if (previewLargeRef.current)
        drawFavicon(previewLargeRef.current, 256, config);
      if (previewMediumRef.current)
        drawFavicon(previewMediumRef.current, 128, config);
      if (previewSmallRef.current)
        drawFavicon(previewSmallRef.current, 32, config);
    };

    updateCanvases();
  }, [
    text,
    fontColor,
    backgroundColor,
    selectedFont,
    fontWeight,
    fontSize,
    borderRadius,
  ]);

  return (
    <div className="min-h-screen bg-background">
      <FaviconHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          <div className="">
            <EditorControls />
          </div>

          <ColorPickerPanel />

          <div className="space-y-4">
            <ShadeSelectorPanel type="text" shades={backgroundShades} />
            <ShadeSelectorPanel type="background" shades={backgroundShades} />
          </div>

          <div className="space-y-4">
            <FaviconPreviewPanel previewLargeRef={previewLargeRef} />
            <MetadataForm />
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
