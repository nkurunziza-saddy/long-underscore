import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Design } from "../../lib/design";
import { figureGrid } from "../../lib/halftone";
import { type IconSet, type IconWeight, unpackIcons } from "../../lib/icons";
import { letterMask } from "../../lib/letter-mask";
import type { MarkAssets } from "../../lib/render-mark";
import type { SvgSource } from "../../lib/svg-source";
import { decodeSvg } from "./platform";

/** A file of the icon sets: beside the built file, or in the repository's `public`. */
async function iconFile<T>(name: string): Promise<T> {
  const here = dirname(fileURLToPath(import.meta.url));
  const file = [
    join(here, "phosphor", name),
    join(here, "../../public/phosphor", name),
  ].find(existsSync);
  if (!file) throw new Error("The icon set is missing from this install.");
  return JSON.parse(await readFile(file, "utf8")) as T;
}

/** Every Phosphor icon in one weight. */
export async function loadIcons(weight: IconWeight): Promise<IconSet> {
  return unpackIcons(await iconFile(`${weight}.json`));
}

/** What else each icon can be found by, besides its name. */
export function loadIconWords(): Promise<Record<string, string>> {
  return iconFile("words.json");
}

/**
 * Everything a mark needs beyond its design: the icon's geometry, the
 * imported SVG decoded, the letter screened onto the halftone's grid. Fonts
 * must be loaded first, or the letter is screened in the wrong face.
 */
export async function loadAssets(
  design: Design,
  svg: SvgSource | null,
): Promise<MarkAssets> {
  const screened = design.source === "halftone" && design.htShape === "letter";
  return {
    iconPaths:
      design.source === "icon"
        ? ((await loadIcons(design.iconWeight))[design.icon] ?? null)
        : null,
    svg,
    svgImage: svg ? await decodeSvg(svg.markup) : null,
    mask: screened
      ? letterMask(
          design.text,
          design.font,
          design.weight,
          figureGrid({ grid: design.htGrid, mode: design.htMode }),
        )
      : null,
  };
}
