// Builds the studio's own icons and social card from `lib/brand.ts`, with
// the same kit builder the studio and the command line use, and writes them
// where Next.js looks for them. Run with `bun run brand` after changing the
// mark, its colours or its words.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAssets } from "../cli/src/assets";
import { loadFont, setUp, toPng } from "../cli/src/platform";
import { parseSvgText } from "../cli/src/svg";
import { BRAND, markGlyphSvg } from "../lib/brand";
import { cardWeights } from "../lib/card";
import { buildKit } from "../lib/kit";
import { buildMarkSvg } from "../lib/mark-svg";
import { sanitizeDesign } from "../lib/share";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// The brand as a design: the glyph as imported art, set whole on its plate.
const design = sanitizeDesign({
  source: "svg",
  scale: 100,
  radius: BRAND.corners,
  treatment: "custom",
  fg: BRAND.glyph,
  bg: BRAND.plate,
  bg2: null,
  transparent: false,
  adaptive: false,
  name: BRAND.name,
  description: BRAND.summary,
  url: BRAND.url,
  ogTitle: BRAND.tagline,
  ogLayout: "statement",
  ogTone: "ink",
  ogPattern: "halftone",
  target: "next",
});

const svg = parseSvgText(markGlyphSvg());
if (!svg) throw new Error("The brand's mark is not an SVG that can be drawn.");

setUp();
const missing = await loadFont(
  design.font,
  [design.weight, ...cardWeights(design)],
  false,
);
if (missing.length > 0) {
  throw new Error(
    `The card's font could not be fetched (weights ${missing.join(", ")}). Run again with a connection.`,
  );
}

const assets = await loadAssets(design, svg);
const kit = await buildKit(design, assets, {
  svg: buildMarkSvg(design, assets),
  fontEmbedded: false,
  png: toPng,
});

for (const file of kit) {
  // The kit's README and snippet are for other people's projects.
  if (file.kind === "readme" || file.kind === "snippet") continue;
  let data = file.data;
  if (file.kind === "manifest") {
    // The one place the name is shortened by hand: the mark is the name.
    data = `${JSON.stringify(
      {
        ...JSON.parse(String(file.data)),
        short_name: "_",
        description: BRAND.description,
      },
      null,
      2,
    )}\n`;
  }
  const full = join(root, file.path);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, data);
  console.log(file.path);
}
