import { renderCard } from "./card";
import { cardTitle, type Design } from "./design";
import { encodeIco } from "./ico";
import { type MarkAssets, type MarkVariant, renderMark } from "./render-mark";
import {
  assetPaths,
  buildManifest,
  buildReadme,
  buildSnippet,
} from "./snippets";

/** One file of the kit: where it goes, and what is in it. */
export interface KitFile<Bytes = Uint8Array> {
  /** Which of the kit's files this is. */
  kind: keyof ReturnType<typeof assetPaths>;
  path: string;
  data: string | Bytes;
}

export function buildIco(design: Design, assets: MarkAssets): Uint8Array {
  return encodeIco(
    [16, 32, 48].map((size) => {
      const canvas = renderMark(design, assets, size);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      return { size, rgba: ctx.getImageData(0, 0, size, size).data };
    }),
  );
}

interface KitOptions<Bytes> {
  /** The standalone SVG, made by whoever can reach the letter's font. */
  svg: string;
  fontEmbedded: boolean;
  /** Encode a drawn canvas as a PNG, the way the platform does it. */
  png: (canvas: HTMLCanvasElement) => Promise<Bytes>;
}

/**
 * Every file of the kit, drawn and named. The same list is zipped by the
 * studio and written straight into a project by the command line, so the
 * two can never disagree about what a kit is.
 */
export async function buildKit<Bytes>(
  design: Design,
  assets: MarkAssets,
  { svg, fontEmbedded, png }: KitOptions<Bytes>,
): Promise<KitFile<Bytes | Uint8Array>[]> {
  const paths = assetPaths(design);
  const mark = (size: number, variant: MarkVariant = "favicon") =>
    png(renderMark(design, assets, size, { variant }));

  const files: KitFile<Bytes | Uint8Array>[] = [
    { kind: "ico", path: paths.ico, data: buildIco(design, assets) },
    { kind: "svg", path: paths.svg, data: svg },
    { kind: "apple", path: paths.apple, data: await mark(180, "apple") },
    { kind: "icon192", path: paths.icon192, data: await mark(192) },
    { kind: "icon512", path: paths.icon512, data: await mark(512) },
    {
      kind: "maskable",
      path: paths.maskable,
      data: await mark(512, "maskable"),
    },
    { kind: "manifest", path: paths.manifest, data: buildManifest(design) },
    {
      kind: "card",
      path: paths.card,
      data: await png(renderCard(design, assets)),
    },
  ];
  if (paths.cardAlt) {
    files.push({
      kind: "cardAlt",
      path: paths.cardAlt,
      data: `${cardTitle(design)}\n`,
    });
  }
  files.push(
    { kind: "snippet", path: paths.snippet, data: buildSnippet(design) },
    {
      kind: "readme",
      path: paths.readme,
      data: buildReadme(design, fontEmbedded),
    },
  );
  return files;
}
