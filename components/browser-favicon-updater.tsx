"use client";

import { useEffect, useRef } from "react";
import { drawFavicon } from "@/lib/draw-favicon";
import { svgToPngDataUrl } from "@/lib/svg-to-canvas";
import { useFaviconStore } from "@/stores/favicon-store";
import { useSvgImportStore } from "@/stores/svg-import-store";

export function BrowserFaviconUpdater() {
  const mode = useFaviconStore((state) => state.mode);
  const text = useFaviconStore((state) => state.text);
  const iconName = useFaviconStore((state) => state.iconName);
  const iconNodes = useFaviconStore((state) => state.iconNodes);
  const settings = useFaviconStore((state) => state.settings[mode]);
  const {
    fontColor,
    backgroundColor,
    selectedFont,
    fontWeight,
    fontSize,
    borderRadius,
    transparentBackground,
  } = settings;

  const svgContent = useSvgImportStore((state) => state.svgContent);
  const isValidSvg = useSvgImportStore((state) => state.isValid);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const updateFavicon = async () => {
      let dataUrl = "";

      if (mode === "text" || mode === "icon") {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement("canvas");
        }
        const canvas = canvasRef.current;
        drawFavicon(canvas, 32, {
          mode,
          text,
          iconName,
          iconNodes,
          fontColor,
          backgroundColor: transparentBackground
            ? "transparent"
            : backgroundColor,
          selectedFont,
          fontWeight,
          fontSize,
          borderRadius,
        });
        dataUrl = canvas.toDataURL("image/png");
      } else if (mode === "svg" && isValidSvg) {
        dataUrl = await svgToPngDataUrl(svgContent, 32);
      }

      if (dataUrl) {
        let link = document.querySelector(
          "link[rel~='icon']",
        ) as HTMLLinkElement;
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = dataUrl;
      }
    };

    const timer = setTimeout(updateFavicon, 500);
    return () => clearTimeout(timer);
  }, [
    mode,
    text,
    iconName,
    iconNodes,
    fontColor,
    backgroundColor,
    selectedFont,
    fontWeight,
    fontSize,
    borderRadius,
    transparentBackground,
    svgContent,
    isValidSvg,
  ]);

  return null;
}
