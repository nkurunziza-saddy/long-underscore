"use client";

import {
  DotsNineIcon,
  ShapesIcon,
  TextAaIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Segmented } from "@/components/ui/segmented";
import type { MarkSource } from "@/lib/design";
import { useStudio } from "@/stores/studio-store";
import { Group, hintClass, SliderField } from "./fields";
import { FontSpecimens } from "./font-specimens";
import { HalftonePicker } from "./halftone-picker";
import { IconPicker } from "./icon-picker";
import { LetterField, WeightField } from "./letter-fields";
import { SvgDrop } from "./svg-drop";

const SOURCES: { value: MarkSource; label: string; icon: React.ReactNode }[] = [
  { value: "letter", label: "Letter", icon: <TextAaIcon /> },
  { value: "icon", label: "Icon", icon: <ShapesIcon /> },
  { value: "halftone", label: "Halftone", icon: <DotsNineIcon /> },
  { value: "svg", label: "Your SVG", icon: <UploadSimpleIcon /> },
];

/** The plate's corner at each named shape, drawn at the radius it sets. */
const CORNERS = [
  { radius: 0, label: "Square" },
  { radius: 22, label: "Soft" },
  { radius: 44, label: "Squircle" },
  { radius: 100, label: "Circle" },
].map((corner) => ({
  value: String(corner.radius),
  label: corner.label,
  icon: (
    <span
      aria-hidden="true"
      className="size-2.5 shrink-0 border border-current"
      style={{ borderRadius: `${corner.radius / 2}%` }}
    />
  ),
}));

/** The size a halftone is given when the mark first becomes one. */
const HALFTONE_START = 76;

/** What the mark is drawn from, then its size and its plate's corners. */
export function MarkPanel() {
  const design = useStudio((state) => state.design);
  const update = useStudio((state) => state.update);
  const commit = useStudio((state) => state.commit);

  return (
    <>
      <Group>
        <Segmented
          fill
          aria-label="Mark source"
          value={design.source}
          options={SOURCES}
          onValueChange={(source) =>
            // Cells need more of the plate than a letter does to stay apart
            // at tab size, so a halftone starts larger.
            commit(
              source === "halftone" && design.scale < HALFTONE_START
                ? { source, scale: HALFTONE_START }
                : { source },
            )
          }
        />

        {design.source === "letter" && (
          <>
            <LetterField hint="One character is a mark, three is a word. Emoji work too." />
            <FontSpecimens />
            <WeightField />
          </>
        )}

        {design.source === "icon" && (
          <>
            <IconPicker />
            <SliderField
              label="Stroke"
              value={design.stroke}
              min={1}
              max={3}
              step={0.25}
              format={(value) => value.toFixed(2)}
              onValueChange={(stroke) => update({ stroke })}
            />
          </>
        )}

        {design.source === "halftone" && <HalftonePicker />}

        {design.source === "svg" && <SvgDrop />}
      </Group>

      <Group title="Size and corners">
        <SliderField
          label="Size"
          value={design.scale}
          min={20}
          max={100}
          format={(value) => `${value}%`}
          onValueChange={(scale) => update({ scale })}
        />
        <div className="flex flex-col gap-2">
          <SliderField
            label="Corners"
            value={design.radius}
            min={0}
            max={100}
            format={(value) => `${value}%`}
            onValueChange={(radius) => update({ radius })}
          />
          <Segmented
            fill
            aria-label="Corner shape"
            value={String(design.radius)}
            options={CORNERS}
            onValueChange={(radius) => commit({ radius: Number(radius) })}
          />
          {design.transparent && (
            <p className={hintClass}>
              Corners shape the plate, and this mark has none. Give it one under
              Colour.
            </p>
          )}
        </div>
      </Group>
    </>
  );
}
