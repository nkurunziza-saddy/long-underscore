"use client";

import { Panel, PanelBlock, PanelHead } from "@/components/layout/panel";
import { Section } from "@/components/layout/section";
import { type Design, hueLabel } from "@/lib/design";
import { FONT_WEIGHT_NAMES, getFont } from "@/lib/fonts";
import { HALFTONE_SHAPES } from "@/lib/halftone";
import { cn } from "@/lib/utils";
import { useDesign } from "@/stores/studio-store";
import { MarkCanvas } from "../mark-canvas";
import { captionClass } from "./caption";

/** What the mark is made of, in a line: its glyph, then its colours. */
function recipe(design: Design): string {
  const glyph =
    design.source === "letter"
      ? `${getFont(design.font).name} ${FONT_WEIGHT_NAMES[design.weight] ?? design.weight}`
      : design.source === "icon"
        ? design.icon
        : design.source === "halftone"
          ? `${HALFTONE_SHAPES.find((shape) => shape.value === design.htShape)?.label} halftone`
          : "Imported SVG";
  const colours =
    design.treatment === "custom"
      ? "custom colours"
      : `${hueLabel(design.hue)} ${design.treatment}`;
  return `${glyph} · ${colours}`;
}

/** A small render blown up, a line drawn round every pixel of it. */
function Loupe({ size, zoom }: { size: number; zoom: number }) {
  return (
    <figure className="flex flex-col items-center gap-2">
      <div
        className="edge-card pixel-grid bg-page"
        style={{ "--cell": `${zoom}px` } as React.CSSProperties}
      >
        <MarkCanvas
          size={size}
          display={size * zoom}
          density={1}
          label={`${size} pixel render, magnified`}
        />
      </div>
      <figcaption className={captionClass}>
        {size}px × {zoom}
      </figcaption>
    </figure>
  );
}

/** The mark itself: as designed, and as the pixels of a tab will have it. */
export function MarkSection() {
  const design = useDesign();
  return (
    <Section title="Mark" note={recipe(design)}>
      <div className="grid gap-3 @xl:grid-cols-2">
        <Panel>
          <PanelHead label="Full size">200px</PanelHead>
          <PanelBlock className="flex min-h-64 flex-1 items-center justify-center p-6">
            {/* A hairline the shape of the plate, so a dark plate still has
                an edge on a dark page and a white one on a light page. */}
            <div
              className={cn(
                design.transparent ? "checker" : "ring-1 ring-border",
              )}
              style={{ borderRadius: `${design.radius / 2}%` }}
            >
              <MarkCanvas size={200} label="Mark at full size" />
            </div>
          </PanelBlock>
        </Panel>

        <Panel>
          <PanelHead label="Pixel truth">What a tab really draws</PanelHead>
          <PanelBlock className="flex flex-1 flex-wrap items-center justify-center gap-6 p-5">
            <Loupe size={16} zoom={8} />
            <Loupe size={32} zoom={4} />
          </PanelBlock>
          <PanelBlock className="flex flex-wrap items-end justify-center gap-x-6 gap-y-3 p-4">
            {[16, 24, 32, 48, 64].map((size) => (
              <figure key={size} className="flex flex-col items-center gap-2">
                <MarkCanvas size={size} label={`${size} pixel render`} />
                <figcaption className={captionClass}>{size}</figcaption>
              </figure>
            ))}
          </PanelBlock>
        </Panel>
      </div>
    </Section>
  );
}
