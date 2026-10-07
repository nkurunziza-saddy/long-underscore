"use client";

import { useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { renderMark } from "@/lib/render-mark";
import { useDesign } from "@/stores/studio-store";
import { useAssets } from "./assets-context";

/**
 * Wear the mark being designed as this page's own favicon. No mockup is as
 * honest as the real tab strip the visitor is already looking at.
 */
export function LiveFavicon() {
  const design = useDebounce(useDesign(), 200);
  const assets = useAssets();

  useEffect(() => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const href = renderMark(design, assets, 64, {
      theme: dark ? "dark" : "light",
    }).toDataURL("image/png");

    const links =
      document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']");
    if (links.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = href;
      document.head.appendChild(link);
      return;
    }
    for (const link of links) {
      link.type = "image/png";
      link.removeAttribute("sizes");
      link.href = href;
    }
  }, [design, assets]);

  return null;
}
