"use client";

import { FileCode, Share2, Smile, Type } from "lucide-react";
import { useEffect, useRef } from "react";
import { useUrlSync } from "@/hooks/use-url-sync";
import { colorPalettes } from "@/lib/color-palletes";
import { drawFavicon } from "@/lib/draw-favicon";
import { drawOg } from "@/lib/draw-og";
import { useFaviconStore } from "@/stores/favicon-store";
import { useSvgImportStore } from "@/stores/svg-import-store";
import { BrowserFaviconUpdater } from "./browser-favicon-updater";
import { ColorPickerPanel } from "./color-picker-panel";
import { EditorControls } from "./editor-controls";
import { FaviconHeader } from "./favicon-header";
import { FaviconPreviewPanel } from "./favicon-preview-panel";
import { IconSelectorPanel } from "./icon-selector-panel";
import { MetadataForm } from "./metadata-form";
import { OgGeneratorPanel } from "./og-generator-panel";
import { ShadeSelectorPanel } from "./shade-selector-panel";
import { SvgImportPanel } from "./svg-import-panel";
import { SvgPreviewPanel } from "./svg-preview-panel";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsPanel, TabsTab } from "./ui/tabs";

export function FaviconGenerator() {
  useUrlSync();

  const mode = useFaviconStore((state) => state.mode);
  const setMode = useFaviconStore((state) => state.setMode);

  // Settings for the current mode
  const settings = useFaviconStore((state) => state.settings[mode]);
  const {
    fontColor,
    backgroundColor,
    selectedFont,
    fontWeight,
    fontSize,
    borderRadius,
    selectedColorFamily,
    transparentBackground,
    logoSize = 60,
  } = settings;

  const text = useFaviconStore((state) => state.text);
  const iconName = useFaviconStore((state) => state.iconName);
  const iconNodes = useFaviconStore((state) => state.iconNodes);
  const ogTitle = useFaviconStore((state) => state.ogTitle);
  const ogDescription = useFaviconStore((state) => state.ogDescription);
  const metadata = useFaviconStore((state) => state.metadata);
  const svgContent = useSvgImportStore((state) => state.svgContent);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewLargeRef = useRef<HTMLCanvasElement>(null);
  const previewMediumRef = useRef<HTMLCanvasElement>(null);
  const previewSmallRef = useRef<HTMLCanvasElement>(null);
  const ogRef = useRef<HTMLCanvasElement>(null);

  const backgroundShades =
    colorPalettes[selectedColorFamily as keyof typeof colorPalettes];

  useEffect(() => {
    if (mode === "svg") return;

    if (mode === "og") {
      if (ogRef.current) {
        drawOg(ogRef.current, 1200, 630, {
          title: ogTitle,
          description: ogDescription,
          siteName: metadata.appName || "Underscore",
          fontColor,
          backgroundColor,
          selectedFont,
          fontWeight,
          borderRadius,
          layout: settings.ogLayout || "studio",
          logoMode: settings.logoMode || "text",
          logoText: text,
          logoIconName: iconName,
          logoIconNodes: iconNodes,
          logoSvg: svgContent,
          logoSize: logoSize,
          showGlassCard: settings.showGlassCard,
          meshOpacity: settings.meshOpacity,
        });
      }
      return;
    }

    const config = {
      mode: mode as "text" | "icon",
      text,
      iconName,
      iconNodes,
      fontColor,
      backgroundColor: transparentBackground ? "transparent" : backgroundColor,
      selectedFont,
      fontWeight,
      fontSize,
      borderRadius,
    };

    const updateCanvases = () => {
      const p = config as any;
      if (canvasRef.current) drawFavicon(canvasRef.current, 512, p);
      if (previewLargeRef.current) drawFavicon(previewLargeRef.current, 256, p);
      if (previewMediumRef.current)
        drawFavicon(previewMediumRef.current, 128, p);
      if (previewSmallRef.current) drawFavicon(previewSmallRef.current, 32, p);
    };

    updateCanvases();
  }, [
    mode,
    text,
    iconName,
    iconNodes,
    ogTitle,
    ogDescription,
    metadata.appName,
    svgContent,
    fontColor,
    backgroundColor,
    selectedFont,
    fontWeight,
    fontSize,
    borderRadius,
    transparentBackground,
    logoSize,
    settings.logoMode,
    settings.ogLayout,
    settings.showGlassCard,
    settings.meshOpacity,
  ]);

  return (
    <div className="min-h-screen bg-background">
      <BrowserFaviconUpdater />
      <FaviconHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={mode}
          onValueChange={(value) =>
            setMode(value as "text" | "svg" | "icon" | "og")
          }
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <p className="text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 border rounde-md">
              <span className="font-semibold text-primary">Favicon Mode:</span>{" "}
              Choose one of Text, Icon, or SVG. The active design will be used
              in your export.
            </p>
          </div>
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTab value="og">
              <Share2 className="h-4 w-4" />
              OG Image
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

          <TabsPanel value="og">
            <div className="space-y-8 mt-6">
              {/* Refined OG Preview Area */}
              <div className="relative group">
               
                <Card className="relative overflow-hidden border py-0">
                  <div className="aspect-[1.91/1] w-full bg-transparent flex items-center justify-center">
                    <div className="w-[90%] h-[90%] relative">
                   
                      <canvas
                        ref={ogRef}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="bg-muted/30 px-4 py-3 flex items-center justify-between border-t">
                  
                    <span className="text-[10px] font-mono text-muted-foreground">
                      1200 × 630
                    </span>
                  </div>
                </Card>
              </div>

              {/* Controls Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-8">
                  <OgGeneratorPanel />
                </div>

                <div className="space-y-8">
                  <ColorPickerPanel />
                  <ShadeSelectorPanel
                    type="background"
                    shades={backgroundShades}
                  />
                  <ShadeSelectorPanel type="text" shades={backgroundShades} />
                </div>

                <div className="space-y-8">
                  <EditorControls />
                  <MetadataForm />
                </div>
              </div>
            </div>
          </TabsPanel>
        </Tabs>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
