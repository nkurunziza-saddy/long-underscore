import { useEffect, useMemo, useState } from "react";
import { cardWeights } from "@/lib/card";
import { cardTitle } from "@/lib/design";
import { ensureFont } from "@/lib/font-loader";
import { figureGrid } from "@/lib/halftone";
import { FALLBACK_ICONS, type IconSet, loadIconSet } from "@/lib/icons";
import { letterMask } from "@/lib/letter-mask";
import type { MarkAssets } from "@/lib/render-mark";
import { loadSvgImage, parseSvg } from "@/lib/svg-source";
import { useStudio } from "@/stores/studio-store";

export interface StudioAssets extends MarkAssets {
  /** Bumps whenever a font finishes loading, so canvases know to redraw. */
  fontVersion: number;
}

/**
 * Everything the renderers need that arrives late: the icon's geometry, the
 * decoded SVG import, the web font, and the letter screened onto the
 * halftone's grid. Loaded once here, shared by context.
 */
export function useMarkAssets(): StudioAssets {
  const source = useStudio((state) => state.design.source);
  const icon = useStudio((state) => state.design.icon);
  const font = useStudio((state) => state.design.font);
  const weight = useStudio((state) => state.design.weight);
  const text = useStudio((state) => state.design.text);
  const title = useStudio((state) => cardTitle(state.design));
  const svgSource = useStudio((state) => state.svgSource);
  // The grid a letter in halftone is screened onto, or 0 when there is none.
  const screen = useStudio(({ design }) =>
    design.source === "halftone" && design.htShape === "letter"
      ? figureGrid({ grid: design.htGrid, mode: design.htMode })
      : 0,
  );

  const [iconSet, setIconSet] = useState<IconSet>(FALLBACK_ICONS);
  useEffect(() => {
    if (source !== "icon") return;
    let live = true;
    loadIconSet().then((set) => live && setIconSet(set));
    return () => {
      live = false;
    };
  }, [source]);

  const svg = useMemo(() => parseSvg(svgSource), [svgSource]);
  const [svgImage, setSvgImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let live = true;
    if (!svg) {
      setSvgImage(null);
      return;
    }
    loadSvgImage(svg.markup)
      .then((image) => live && setSvgImage(image))
      .catch(() => live && setSvgImage(null));
    return () => {
      live = false;
    };
  }, [svg]);

  const [fontVersion, setFontVersion] = useState(0);
  useEffect(() => {
    let live = true;
    const weights = [...new Set([weight, ...cardWeights({ font, weight })])];
    ensureFont(font, weights, `${text}${title}Aa`).then(
      () => live && setFontVersion((version) => version + 1),
    );
    return () => {
      live = false;
    };
  }, [font, weight, text, title]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: screened again once the font has loaded
  const mask = useMemo(
    () => (screen ? letterMask(text, font, weight, screen) : null),
    [screen, text, font, weight, fontVersion],
  );

  return useMemo(
    () => ({
      iconNodes: iconSet[icon] ?? null,
      svg,
      svgImage,
      mask,
      fontVersion,
    }),
    [iconSet, icon, svg, svgImage, mask, fontVersion],
  );
}
