import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  type Canvas,
  createCanvas,
  GlobalFonts,
  loadImage,
  Path2D,
} from "@napi-rs/canvas";
import { setCanvasFactory } from "../../lib/canvas";
import { getFont, getFontLink } from "../../lib/fonts";

/**
 * What the studio's renderers find in a browser and not here: a canvas, a
 * `Path2D`, and the web fonts. Call `setUp` once before drawing.
 */
export function setUp() {
  setCanvasFactory(
    (width, height) =>
      createCanvas(width, height) as unknown as HTMLCanvasElement,
  );
  // The renderers build their paths with the global, as a page would.
  (globalThis as { Path2D?: unknown }).Path2D = Path2D;
}

/** A drawn canvas as PNG bytes. */
export async function toPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const drawn = canvas as unknown as Canvas;
  return new Uint8Array(await drawn.encode("png"));
}

/** Decode an SVG's markup into something `drawImage` takes. */
export async function decodeSvg(markup: string): Promise<HTMLImageElement> {
  return (await loadImage(Buffer.from(markup))) as unknown as HTMLImageElement;
}

/** A browser's name: Google Fonts answers with WOFF2 only to one it knows. */
export const BROWSER = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  },
};

const cacheDir = () =>
  join(
    process.env.XDG_CACHE_HOME || join(homedir(), ".cache"),
    "long-underscore",
    "fonts",
  );

/** One weight of a face as a TrueType file, from the cache or from Google. */
async function fontFile(value: string, weight: number): Promise<Buffer> {
  const cached = join(cacheDir(), `${value}-${weight}.ttf`);
  try {
    return await readFile(cached);
  } catch {
    // Not cached yet.
  }
  // Asked for by no browser in particular, Google's stylesheet names
  // TrueType files, which is what a canvas outside a browser reads.
  const css = await fetch(getFontLink(value, [weight]), {
    headers: { "User-Agent": "long-underscore" },
  });
  if (!css.ok) throw new Error(`stylesheet ${css.status}`);
  const url = (await css.text()).match(/url\(([^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error("no TrueType file offered");
  const file = await fetch(url);
  if (!file.ok) throw new Error(`font file ${file.status}`);
  const bytes = Buffer.from(await file.arrayBuffer());
  await mkdir(cacheDir(), { recursive: true }).catch(() => {});
  await writeFile(cached, bytes).catch(() => {});
  return bytes;
}

/**
 * Make a typeface usable on the canvas, each weight fetched once and kept in
 * the user's cache. Returns the weights that could not be had; those are
 * drawn in whatever sans the machine has.
 */
export async function loadFont(
  value: string,
  weights: number[],
  offline: boolean,
): Promise<number[]> {
  const family = getFont(value).name;
  const missing: number[] = [];
  await Promise.all(
    [...new Set(weights)].map(async (weight) => {
      try {
        if (offline) {
          // Offline still reads the cache.
          GlobalFonts.register(
            await readFile(join(cacheDir(), `${value}-${weight}.ttf`)),
            family,
          );
        } else {
          GlobalFonts.register(await fontFile(value, weight), family);
        }
      } catch {
        missing.push(weight);
      }
    }),
  );
  return missing.sort((a, b) => a - b);
}
