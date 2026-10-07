import { dominantColor, loadSvgImage, parseSvg } from "@/lib/svg-source";
import { useStudio } from "@/stores/studio-store";

/** Read a dropped or chosen file into the studio as the mark's artwork. */
export async function importSvgFile(file: File): Promise<boolean> {
  const looksLikeSvg =
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  if (!looksLikeSvg) return false;
  await importSvgMarkup(await file.text());
  return true;
}

/**
 * Make `markup` the mark's artwork. The design's glyph colour is set to the
 * art's dominant colour: nothing is drawn with it, but the home-screen backing
 * and the social card derive their tones from it.
 */
export async function importSvgMarkup(markup: string) {
  const { design, commit, update, setSvgSource } = useStudio.getState();
  setSvgSource(markup);
  if (design.source !== "svg") {
    // Imported art starts untouched: full size, no plate. Add one in Colour.
    commit({
      source: "svg",
      scale: 100,
      transparent: true,
      treatment: "custom",
    });
  }
  const svg = parseSvg(markup);
  if (!svg) return;
  try {
    update({ fg: dominantColor(await loadSvgImage(svg.markup)) });
  } catch {
    // Undecodable art keeps the previous tint; the panel reports the error.
  }
}
