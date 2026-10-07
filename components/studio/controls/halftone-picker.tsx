"use client";

import {
  ArrowDownIcon,
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsInIcon,
  ArrowUpIcon,
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";
import { cellClass, wellClass } from "@/components/ui/choice";
import { Segmented } from "@/components/ui/segmented";
import { halftoneOf, withHalftone } from "@/lib/design";
import {
  HALFTONE_CELLS,
  HALFTONE_FLOWS,
  HALFTONE_GAP,
  HALFTONE_GRID,
  HALFTONE_MODES,
  HALFTONE_PRESETS,
  HALFTONE_SHAPES,
  type Halftone,
  type HalftoneFlow,
  type HalftoneMode,
  type HalftoneShape,
  halftonePath,
} from "@/lib/halftone";
import { cn } from "@/lib/utils";
import { useStudio } from "@/stores/studio-store";
import { Field, readoutClass, SliderField } from "./fields";
import { LetterField, TypefaceField, WeightField } from "./letter-fields";

const FLOW_ICONS: Record<HalftoneFlow, typeof ArrowUpIcon> = {
  nw: ArrowUpLeftIcon,
  n: ArrowUpIcon,
  ne: ArrowUpRightIcon,
  w: ArrowLeftIcon,
  centre: ArrowsInIcon,
  e: ArrowRightIcon,
  sw: ArrowDownLeftIcon,
  s: ArrowDownIcon,
  se: ArrowDownRightIcon,
};

/** How a shape is drawn where it is being chosen: whole, even and plain. */
const SWATCH: Omit<Halftone, "shape"> = {
  mode: "fill",
  cell: "square",
  grid: 7,
  gap: 10,
  flow: "n",
  fade: 0,
};

/**
 * The coarsest grid a letter is still a letter on. Cut out, the letter has a
 * cell less on every side, so the grid makes that up.
 */
const letterGrid = (mode: HalftoneMode) => (mode === "cutout" ? 10 : 8);
/** The most its cells can fade before the far side of it is lost. */
const LETTER_FADE = 60;

const same = (a: Halftone, b: Halftone) =>
  (Object.keys(a) as (keyof Halftone)[]).every((key) => a[key] === b[key]);

/** A halftone as a glyph in the current text colour. */
function Glyph({
  halftone,
  className,
}: {
  halftone: Halftone;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={halftonePath(halftone, 0, 0, 24)} fill="currentColor" />
    </svg>
  );
}

/**
 * A mark made of cells: pick one that is close, then tune what it is made
 * of. Every combination is drawn from the same rule, so none of them can
 * come out untidy.
 */
export function HalftonePicker() {
  const design = useStudio((state) => state.design);
  const update = useStudio((state) => state.update);
  const commit = useStudio((state) => state.commit);
  const halftone = halftoneOf(design);
  const preset = HALFTONE_PRESETS.find((option) =>
    same(option.halftone, halftone),
  );
  const shape = HALFTONE_SHAPES.find(
    (option) => option.value === design.htShape,
  );
  const initial = [...design.text.trim()][0] ?? "A";

  const pickShape = (htShape: HalftoneShape) =>
    commit(
      htShape === "letter"
        ? {
            htShape,
            htGrid: Math.max(design.htGrid, letterGrid(design.htMode)),
            htFade: Math.min(design.htFade, LETTER_FADE),
          }
        : { htShape },
    );

  return (
    <>
      <Field
        label="Start from"
        aside={
          <span className={readoutClass}>{preset?.name ?? "Your own"}</span>
        }
      >
        <div className={cn(wellClass, "grid grid-cols-6 gap-0.5")}>
          {HALFTONE_PRESETS.map((option) => (
            <button
              key={option.name}
              type="button"
              title={option.name}
              aria-label={option.name}
              aria-pressed={option === preset}
              onClick={() => commit(withHalftone(option.halftone))}
              className={cn(cellClass, "aspect-square text-foreground")}
            >
              <Glyph halftone={option.halftone} className="size-9" />
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Shape"
        aside={<span className={readoutClass}>{shape?.label}</span>}
      >
        <div className={cn(wellClass, "grid grid-cols-9 gap-0.5")}>
          {HALFTONE_SHAPES.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={option.label}
              aria-pressed={option.value === design.htShape}
              onClick={() => pickShape(option.value)}
              className={cn(cellClass, "aspect-square")}
            >
              {option.value === "letter" ? (
                <span className="text-base font-medium">{initial}</span>
              ) : (
                <Glyph
                  halftone={{ ...SWATCH, shape: option.value }}
                  className="size-5"
                />
              )}
            </button>
          ))}
        </div>
      </Field>

      {design.htShape === "letter" && (
        <>
          <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
            <LetterField />
            <TypefaceField />
          </div>
          <WeightField />
        </>
      )}

      <Field label="Draw">
        <Segmented
          fill
          aria-label="Draw"
          value={design.htMode}
          options={HALFTONE_MODES}
          onValueChange={(htMode) =>
            commit(
              design.htShape === "letter"
                ? {
                    htMode,
                    htGrid: Math.max(design.htGrid, letterGrid(htMode)),
                  }
                : { htMode },
            )
          }
        />
      </Field>

      <Field label="Cells">
        <Segmented
          fill
          aria-label="Cells"
          value={design.htCell}
          options={HALFTONE_CELLS}
          onValueChange={(htCell) => commit({ htCell })}
        />
      </Field>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
        <Field label="Grows towards">
          <div className={cn(wellClass, "grid w-fit grid-cols-3 gap-0.5")}>
            {HALFTONE_FLOWS.map((flow) => {
              const Icon = FLOW_ICONS[flow.value];
              return (
                <button
                  key={flow.value}
                  type="button"
                  title={flow.label}
                  aria-label={flow.label}
                  aria-pressed={design.htFlow === flow.value}
                  onClick={() => commit({ htFlow: flow.value })}
                  className={cn(cellClass, "size-6")}
                >
                  <Icon className="size-3.5" />
                </button>
              );
            })}
          </div>
        </Field>
        <div className="flex flex-col gap-3">
          <SliderField
            label="Grid"
            value={design.htGrid}
            min={HALFTONE_GRID.min}
            max={HALFTONE_GRID.max}
            format={(value) => `${value} × ${value}`}
            onValueChange={(htGrid) => update({ htGrid })}
          />
          <SliderField
            label="Fade"
            value={design.htFade}
            min={0}
            max={100}
            step={5}
            format={(value) => `${value}%`}
            onValueChange={(htFade) => update({ htFade })}
          />
        </div>
      </div>

      <SliderField
        label="Gap"
        value={design.htGap}
        min={HALFTONE_GAP.min}
        max={HALFTONE_GAP.max}
        step={5}
        format={(value) => `${value}%`}
        hint="At 0% the cells join into one solid shape, and Fade dissolves it."
        onValueChange={(htGap) => update({ htGap })}
      />
    </>
  );
}
