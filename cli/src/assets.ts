import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Design } from "../../lib/design";
import { figureGrid } from "../../lib/halftone";
import type { IconSet } from "../../lib/icons";
import { letterMask } from "../../lib/letter-mask";
import type { MarkAssets } from "../../lib/render-mark";
import type { SvgSource } from "../../lib/svg-source";
import { decodeSvg } from "./platform";

let icons: Promise<IconSet> | null = null;

/** The Lucide set: beside the built file, or in the repository's `public`. */
export function loadIcons(): Promise<IconSet> {
  if (!icons) {
    const here = dirname(fileURLToPath(import.meta.url));
    const file = [
      join(here, "lucide.json"),
      join(here, "../../public/lucide.json"),
    ].find(existsSync);
    icons = file
      ? readFile(file, "utf8").then((text) => JSON.parse(text) as IconSet)
      : Promise.reject(new Error("The icon set is missing from this install."));
  }
  return icons;
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
    iconNodes:
      design.source === "icon"
        ? ((await loadIcons())[design.icon] ?? null)
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
