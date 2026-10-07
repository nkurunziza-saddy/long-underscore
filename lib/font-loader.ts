import { getCSSFontFamily, getFontLink } from "./fonts";

const stylesheets = new Map<string, Promise<void>>();

function loadStylesheet(href: string): Promise<void> {
  let pending = stylesheets.get(href);
  if (!pending) {
    pending = new Promise((resolve) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      // A failed stylesheet must not block drawing; the fallback face is used.
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    });
    stylesheets.set(href, pending);
  }
  return pending;
}

/**
 * Make sure a face is usable on canvas. Canvas never triggers a font download
 * by itself, so the stylesheet is attached and each weight is requested
 * explicitly before anything is drawn.
 */
export async function ensureFont(
  value: string,
  weights: number[],
  sample = "Aa",
): Promise<void> {
  if (typeof document === "undefined") return;
  await loadStylesheet(getFontLink(value));
  const family = getCSSFontFamily(value);
  await Promise.all(
    weights.map((weight) =>
      document.fonts.load(`${weight} 48px ${family}`, sample).catch(() => []),
    ),
  );
}

const subsets = new Map<string, Promise<string | null>>();

/**
 * A base64 woff2 holding just the glyphs in `text`, small enough to inline in
 * an SVG. SVG favicons cannot load external fonts, so without this a lettered
 * mark would fall back to whatever the visitor has installed.
 */
export function fetchSubsetFont(
  value: string,
  weight: number,
  text: string,
  /** Sent with the stylesheet request: Google answers by who is asking. */
  init?: RequestInit,
): Promise<string | null> {
  const key = `${value}:${weight}:${text}`;
  let pending = subsets.get(key);
  if (!pending) {
    pending = (async () => {
      try {
        const css = await fetch(getFontLink(value, [weight], text), init);
        if (!css.ok) throw new Error(`Font stylesheet ${css.status}`);
        const url = (await css.text()).match(
          /url\(([^)]+)\)\s*format\(['"]woff2['"]\)/,
        )?.[1];
        if (!url) return null;
        const file = await fetch(url);
        if (!file.ok) throw new Error(`Font file ${file.status}`);
        const bytes = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        for (const byte of bytes) binary += String.fromCharCode(byte);
        return `data:font/woff2;base64,${btoa(binary)}`;
      } catch {
        subsets.delete(key);
        return null;
      }
    })();
    subsets.set(key, pending);
  }
  return pending;
}
