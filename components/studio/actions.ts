import { toastManager } from "@/components/ui/toast";
import { buildPackage, buildSvgFile, downloadBlob } from "@/lib/package";
import type { MarkAssets } from "@/lib/render-mark";
import { shareUrl } from "@/lib/share";
import { buildSnippet } from "@/lib/snippets";
import { useStudio } from "@/stores/studio-store";

async function copy(text: string, title: string) {
  try {
    await navigator.clipboard.writeText(text);
    toastManager.add({ type: "success", title, timeout: 2000 });
  } catch {
    toastManager.add({
      type: "error",
      title: "Clipboard blocked",
      description: "The browser refused. Select the text and copy it by hand.",
    });
  }
}

/** Actions that turn the current design into something that leaves the page. */
export function studioActions(assets: MarkAssets) {
  const design = () => useStudio.getState().design;

  return {
    downloadKit() {
      const current = design();
      if (current.source === "svg" && !assets.svg) {
        toastManager.add({
          type: "error",
          title: "Nothing to export yet",
          description: "Import an SVG first, or switch to a letter or icon.",
        });
        return;
      }
      toastManager.promise(
        buildPackage(current, assets).then((kit) => {
          downloadBlob(kit.blob, kit.fileName);
          return kit;
        }),
        {
          loading: { title: "Building the kit…" },
          success: (kit) => ({
            title: `${kit.fileName} downloaded`,
            description:
              current.source === "letter" && !kit.fontEmbedded
                ? `${kit.fileCount} files. The font could not be embedded in icon.svg; export again when online.`
                : `${kit.fileCount} files. Open README.md for where each one goes.`,
          }),
          error: () => ({
            title: "Export failed",
            description: "Something went wrong while drawing the files.",
          }),
        },
      );
    },
    async copySvg() {
      const { svg } = await buildSvgFile(design(), assets);
      await copy(svg, "icon.svg copied");
    },
    copySnippet() {
      const current = design();
      return copy(
        buildSnippet(current),
        current.target === "next" ? "Metadata copied" : "Head tags copied",
      );
    },
    copyShareLink() {
      const current = design();
      return copy(
        shareUrl(current, window.location),
        current.source === "svg"
          ? "Link copied (without your SVG: it is too large for a URL)"
          : "Link copied",
      );
    },
  };
}
