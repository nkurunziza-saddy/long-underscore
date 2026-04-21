"use client";

import { FileCode, Smile, Type } from "lucide-react";
import { useEffect, useRef } from "react";
import { useUrlSync } from "@/hooks/use-url-sync";
import { colorPalettes } from "@/lib/color-palletes";
import { drawFavicon } from "@/lib/draw-favicon";
import { useFaviconStore } from "@/stores/favicon-store";
import { BrowserFaviconUpdater } from "./browser-favicon-updater";
import { ColorPickerPanel } from "./color-picker-panel";
import { EditorControls } from "./editor-controls";
import { FaviconHeader } from "./favicon-header";
import { FaviconPreviewPanel } from "./favicon-preview-panel";
import { IconSelectorPanel } from "./icon-selector-panel";
import { MetadataForm } from "./metadata-form";
import { ShadeSelectorPanel } from "./shade-selector-panel";
import { SvgImportPanel } from "./svg-import-panel";
import { SvgPreviewPanel } from "./svg-preview-panel";
import { Tabs, TabsList, TabsPanel, TabsTab } from "./ui/tabs";

export function FaviconGenerator() {
  useUrlSync();

  const mode = useFaviconStore((state) => state.mode);
  const setMode = useFaviconStore((state) => state.setMode);
  const text = useFaviconStore((state) => state.text);
  const iconName = useFaviconStore((state) => state.iconName);
  const iconNodes = useFaviconStore((state) => state.iconNodes);
  const backgroundType = useFaviconStore((state) => state.backgroundType);
  const gradientColors = useFaviconStore((state) => state.gradientColors);
  const fontColor = useFaviconStore((state) => state.fontColor);
  const backgroundColor = useFaviconStore((state) => state.backgroundColor);
  const selectedFont = useFaviconStore((state) => state.selectedFont);
  const fontWeight = useFaviconStore((state) => state.fontWeight);
  const fontSize = useFaviconStore((state) => state.fontSize);
  const borderRadius = useFaviconStore((state) => state.borderRadius);
  const selectedColorFamily = useFaviconStore(
    (state) => state.selectedColorFamily,
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewLargeRef = useRef<HTMLCanvasElement>(null);
  const previewMediumRef = useRef<HTMLCanvasElement>(null);
  const previewSmallRef = useRef<HTMLCanvasElement>(null);

  const backgroundShades =
    colorPalettes[selectedColorFamily as keyof typeof colorPalettes];

  useEffect(() => {
    if (mode === "svg") return;

    const config = {
      mode: mode as "text" | "icon",
      text,
      iconName,
      iconNodes,
      fontColor,
      backgroundColor,
      backgroundType,
      gradientColors,
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
    mode,
    text,
    iconName,
    iconNodes,
    fontColor,
    backgroundColor,
    backgroundType,
    gradientColors,
    selectedFont,
    fontWeight,
    fontSize,
    borderRadius,
  ]);

  return (
    <div className="min-h-screen bg-background">
      <BrowserFaviconUpdater />
      <FaviconHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as "text" | "svg" | "icon")}
          className="mb-6"
        >
          <TabsList className="">
            <TabsTab value="text">
              <Type className="h-4 w-4" />
              Text
            </TabsTab>
            <TabsTab value="icon">
              <Smile className="h-4 w-4" />
              Icons
            </TabsTab>
            <TabsTab value="svg">
              <FileCode className="h-4 w-4" />
              SVG
            </TabsTab>
          </TabsList>

          <TabsPanel value="text">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start mt-6">
              <div>
                <EditorControls />
              </div>

              <ColorPickerPanel />

              <div className="space-y-4">
                <ShadeSelectorPanel type="text" shades={backgroundShades} />
                <ShadeSelectorPanel
                  type="background"
                  shades={backgroundShades}
                />
              </div>

              <div className="space-y-4">
                <FaviconPreviewPanel previewLargeRef={previewLargeRef} />
                <MetadataForm />
              </div>
            </div>
          </TabsPanel>

          <TabsPanel value="icon">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start mt-6">
              <div className="space-y-4">
                <IconSelectorPanel />
                <EditorControls />
              </div>

              <ColorPickerPanel />

              <div className="space-y-4">
                <ShadeSelectorPanel type="text" shades={backgroundShades} />
                <ShadeSelectorPanel
                  type="background"
                  shades={backgroundShades}
                />
              </div>

              <div className="space-y-4">
                <FaviconPreviewPanel previewLargeRef={previewLargeRef} />
                <MetadataForm />
              </div>
            </div>
          </TabsPanel>

          <TabsPanel value="svg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start mt-6">
              <div className="lg:col-span-1">
                <SvgImportPanel />
              </div>

              <div className="lg:col-span-1">
                <SvgPreviewPanel />
              </div>

              <div className="lg:col-span-1">
                <MetadataForm />
              </div>
            </div>
          </TabsPanel>
        </Tabs>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
