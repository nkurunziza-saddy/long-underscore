"use client";

import { tileClass } from "@/components/ui/choice";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Textarea } from "@/components/ui/textarea";
import {
  cardTagline,
  type OgLayout,
  type OgPattern,
  type OgTone,
  siteName,
} from "@/lib/design";
import { cn } from "@/lib/utils";
import { useStudio } from "@/stores/studio-store";
import { CardCanvas } from "../mark-canvas";
import { Field, Group } from "./fields";
import { TypefaceField } from "./letter-fields";

const LAYOUTS: { value: OgLayout; label: string }[] = [
  { value: "statement", label: "Statement" },
  { value: "centered", label: "Centred" },
  { value: "split", label: "Split" },
  { value: "poster", label: "Poster" },
];

const TONES: { value: OgTone; label: string; title: string }[] = [
  { value: "ink", label: "Ink", title: "Near-black tint of the brand hue" },
  { value: "paper", label: "Paper", title: "Near-white tint of the brand hue" },
  {
    value: "brand",
    label: "Brand",
    title: "Flood the card with the plate colour",
  },
];

const PATTERNS: { value: OgPattern; label: string }[] = [
  { value: "none", label: "None" },
  { value: "grid", label: "Grid" },
  { value: "dots", label: "Dots" },
  { value: "glow", label: "Glow" },
  { value: "halftone", label: "Halftone" },
];

/** How the social card looks, then what it says. */
export function CardPanel() {
  const design = useStudio((state) => state.design);
  const update = useStudio((state) => state.update);
  const commit = useStudio((state) => state.commit);

  return (
    <>
      <Group>
        <Field
          label="Layout"
          hint="Every layout is built from your mark and its colours. Nothing here can drift off-brand."
        >
          <div className="grid grid-cols-2 gap-1.5">
            {LAYOUTS.map((layout) => (
              <button
                key={layout.value}
                type="button"
                aria-pressed={design.ogLayout === layout.value}
                onClick={() => commit({ ogLayout: layout.value })}
                className={cn(tileClass, "gap-1.5 p-1.5 text-left")}
              >
                <CardCanvas
                  className="rounded-sm"
                  design={{ ...design, ogLayout: layout.value }}
                />
                <span className="px-0.5 text-xs">{layout.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Tone">
          <Segmented
            fill
            aria-label="Card tone"
            value={design.ogTone}
            options={TONES}
            onValueChange={(ogTone) => commit({ ogTone })}
          />
        </Field>

        <Field label="Texture">
          <Segmented
            fill
            aria-label="Card texture"
            value={design.ogPattern}
            options={PATTERNS}
            onValueChange={(ogPattern) => commit({ ogPattern })}
          />
        </Field>
      </Group>

      <Group title="Words">
        <Field label="Headline" htmlFor="card-title">
          <Input
            id="card-title"
            value={design.ogTitle}
            onChange={(event) => update({ ogTitle: event.target.value })}
            placeholder={siteName(design)}
          />
        </Field>

        <Field
          label="Tagline"
          htmlFor="card-tagline"
          hint="Left empty, the card uses the site name and description."
        >
          <Textarea
            id="card-tagline"
            value={design.ogTagline}
            onChange={(event) => update({ ogTagline: event.target.value })}
            placeholder={
              cardTagline({ ...design, ogTagline: "" }) ||
              "One sentence on what it does"
            }
          />
        </Field>

        <TypefaceField
          hint={
            design.source === "letter"
              ? "Shared with the mark: one brand, one typeface."
              : undefined
          }
        />
      </Group>
    </>
  );
}
