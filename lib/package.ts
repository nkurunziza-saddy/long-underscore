import JSZip from "jszip";
import { cardWeights } from "./card";
import { cardTitle, type Design, shortName } from "./design";
import { ensureFont, fetchSubsetFont } from "./font-loader";
import { buildKit } from "./kit";
import { buildMarkSvg } from "./mark-svg";
import { type MarkAssets, measureText } from "./render-mark";
import { assetPaths } from "./snippets";

export interface PackageEntry {
  path: string;
  /** Why this file exists, in a few words. */
  role: string;
}

/** The kit's contents, known up front so the UI can list them before export. */
export function describePackage(design: Design): PackageEntry[] {
  const paths = assetPaths(design);
  const entries: (PackageEntry | null)[] = [
    { path: paths.ico, role: "16 · 32 · 48 in one real .ico" },
    {
      path: paths.svg,
      role: design.adaptive ? "Vector, dark-mode aware" : "Vector favicon",
    },
    { path: paths.apple, role: "180px, opaque, padded for iOS" },
    { path: paths.icon192, role: "Android home screen" },
    { path: paths.icon512, role: "Install splash" },
    { path: paths.maskable, role: "Safe-zone icon for round masks" },
    { path: paths.manifest, role: "Web app manifest" },
    { path: paths.card, role: "1200 × 630 social card" },
    paths.cardAlt ? { path: paths.cardAlt, role: "Card alt text" } : null,
    {
      path: paths.snippet,
      role: design.target === "next" ? "Metadata export" : "Tags for <head>",
    },
    { path: paths.readme, role: "What goes where" },
  ];
  return entries.filter((entry) => entry !== null);
}

function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG encode failed"))),
      "image/png",
    );
  });
}

/** Build the standalone SVG, with the letter's font subset inlined. */
export async function buildSvgFile(
  design: Design,
  assets: MarkAssets,
): Promise<{ svg: string; fontEmbedded: boolean }> {
  if (design.source !== "letter") {
    return { svg: buildMarkSvg(design, assets), fontEmbedded: false };
  }
  await ensureFont(design.font, [design.weight], design.text);
  const fontDataUrl = design.text
    ? await fetchSubsetFont(design.font, design.weight, design.text)
    : null;
  return {
    svg: buildMarkSvg(design, assets, {
      textLayout: measureText(design),
      fontDataUrl,
    }),
    fontEmbedded: fontDataUrl !== null,
  };
}

export interface BuiltPackage {
  blob: Blob;
  fileName: string;
  fileCount: number;
  fontEmbedded: boolean;
}

/** The kit as a zip, for the browser to download. */
export async function buildPackage(
  design: Design,
  assets: MarkAssets,
): Promise<BuiltPackage> {
  await ensureFont(
    design.font,
    [...new Set([design.weight, ...cardWeights(design)])],
    `${design.text}${cardTitle(design)}`,
  );

  const { svg, fontEmbedded } = await buildSvgFile(design, assets);
  const files = await buildKit(design, assets, {
    svg,
    fontEmbedded,
    png: toPng,
  });
  const zip = new JSZip();
  for (const file of files) zip.file(file.path, file.data);

  const slug =
    shortName(design)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "site";
  return {
    blob: await zip.generateAsync({ type: "blob", compression: "DEFLATE" }),
    fileName: `${slug}-icon-kit.zip`,
    fileCount: files.length,
    fontEmbedded,
  };
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
