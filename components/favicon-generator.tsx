"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { premiumColorPalettes } from "@/lib/color-palletes";
import { getCSSFontFamily } from "@/lib/fonts";
import { ColorPickerPanel } from "./color-picker-panel";
import { EditorControls } from "./editor-controls";
import { ExportButton } from "./export-button";
import { FaviconHeader } from "./favicon-header";
import { FaviconPreviewPanel } from "./favicon-preview-panel";
import { MetadataForm, type MetadataFormData } from "./metadata-form";
import { ShadeSelectorPanel } from "./shade-selector-panel";

export function ElegantFaviconGenerator() {
  const [text, setText] = useState("AF");
  const [selectedColorFamily, setSelectedColorFamily] =
    useState<keyof typeof premiumColorPalettes>("emerald");
  const [fontColor, setFontColor] = useState("#065f46");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [selectedFont, setSelectedFont] = useState("poppins");
  const [fontWeight, setFontWeight] = useState(700);
  const [fontSize, setFontSize] = useState(48);
  const [borderRadius, setBorderRadius] = useState(8);
  const [copied, setCopied] = useState(false);
  const [metadata, setMetadata] = useState<MetadataFormData>({
    appName: "My App",
    appShortName: "App",
    description: "A progressive web application",
    author: "",
    keywords: "",
    themeColor: "#065f46",
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewLargeRef = useRef<HTMLCanvasElement>(null);
  const previewMediumRef = useRef<HTMLCanvasElement>(null);
  const previewSmallRef = useRef<HTMLCanvasElement>(null);

  const backgroundShades = useMemo(
    () => premiumColorPalettes[selectedColorFamily],
    [selectedColorFamily]
  );

  const drawFavicon = useCallback(
    (canvas: HTMLCanvasElement, size: number) => {
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
      ctx.textBaseline = "middle";
      const scaledFontSize = Math.round((fontSize * size) / 256);
      ctx.font = `${fontWeight} ${scaledFontSize}px ${getCSSFontFamily(
        selectedFont
      )}`;
      ctx.fillText(text.toUpperCase().slice(0, 2), size / 2, size / 2);
    },
    [
      text,
      fontColor,
      backgroundColor,
      selectedFont,
      fontWeight,
      fontSize,
      borderRadius,
    ]
  );

  useEffect(() => {
    const updateCanvases = () => {
      if (canvasRef.current) drawFavicon(canvasRef.current, 512);
      if (previewLargeRef.current) drawFavicon(previewLargeRef.current, 256);
      if (previewMediumRef.current) drawFavicon(previewMediumRef.current, 128);
      if (previewSmallRef.current) drawFavicon(previewSmallRef.current, 32);
    };
    updateCanvases();
  }, [drawFavicon]);

  const generateShareUrl = () => {
    const params = new URLSearchParams({
      text,
      fontColor,
      backgroundColor,
      font: selectedFont,
      weight: fontWeight.toString(),
      size: fontSize.toString(),
      radius: borderRadius.toString(),
    });
    return `${window.location.origin}/preview?${params.toString()}`;
  };

  const copyShareUrl = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <FaviconHeader onShare={copyShareUrl} copied={copied}>
        <ExportButton
          canvasRef={canvasRef}
          metadata={metadata}
          backgroundColor={backgroundColor}
          fontColor={fontColor}
          text={text}
        />
      </FaviconHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          <div className="">
            <EditorControls
              text={text}
              onTextChange={setText}
              selectedFont={selectedFont}
              onFontChange={setSelectedFont}
              fontWeight={fontWeight}
              onFontWeightChange={setFontWeight}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              borderRadius={borderRadius}
              onBorderRadiusChange={setBorderRadius}
            />
          </div>

          <ColorPickerPanel
            selectedColorFamily={selectedColorFamily}
            onColorFamilyChange={setSelectedColorFamily}
          />

          <div className="space-y-4">
            <ShadeSelectorPanel
              fontColor={fontColor}
              onFontColorChange={setFontColor}
              backgroundColor={backgroundColor}
              onBackgroundColorChange={setBackgroundColor}
              type="text"
              backgroundShades={backgroundShades}
            />

            <ShadeSelectorPanel
              fontColor={fontColor}
              onFontColorChange={setFontColor}
              backgroundColor={backgroundColor}
              onBackgroundColorChange={setBackgroundColor}
              type="background"
              backgroundShades={backgroundShades}
            />
          </div>

          <div className="space-y-4">
            <FaviconPreviewPanel previewLargeRef={previewLargeRef} />
            <MetadataForm metadata={metadata} onMetadataChange={setMetadata} />
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
