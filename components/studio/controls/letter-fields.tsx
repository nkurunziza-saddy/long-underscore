"use client";

import { type ReactNode, useId } from "react";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { withFont } from "@/lib/design";
import { FONT_WEIGHT_NAMES, FONTS, getFont } from "@/lib/fonts";
import { useStudio } from "@/stores/studio-store";
import { Field } from "./fields";

/**
 * The fields of the brand's letter and its typeface. The mark, a letter in
 * halftone and the card all share the one letter and the one face, so they
 * share these.
 */

const FONT_ITEMS = FONTS.map((font) => ({
  value: font.value,
  label: font.name,
}));

/** What the mark spells. */
export function LetterField({ hint }: { hint?: ReactNode }) {
  const id = useId();
  const text = useStudio((state) => state.design.text);
  const update = useStudio((state) => state.update);
  return (
    <Field label="Letter" htmlFor={id} hint={hint}>
      <Input
        id={id}
        value={text}
        maxLength={12}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => update({ text: event.target.value })}
        placeholder="A"
      />
    </Field>
  );
}

/** The typeface, from a list: for where the wall of specimens has no room. */
export function TypefaceField({ hint }: { hint?: ReactNode }) {
  const design = useStudio((state) => state.design);
  const commit = useStudio((state) => state.commit);
  return (
    <Field label="Typeface" hint={hint}>
      <Select
        value={design.font}
        items={FONT_ITEMS}
        onValueChange={(font) => font && commit(withFont(design, font))}
      >
        <SelectTrigger aria-label="Typeface">
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          {FONT_ITEMS.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </Field>
  );
}

/** The weights the typeface has. Nothing, where it has only the one. */
export function WeightField() {
  const font = useStudio((state) => state.design.font);
  const weight = useStudio((state) => state.design.weight);
  const commit = useStudio((state) => state.commit);
  const weights = getFont(font).weights;
  if (weights.length < 2) return null;
  return (
    <Field label="Weight">
      <Segmented
        fill
        aria-label="Font weight"
        value={String(weight)}
        options={weights.map((option) => ({
          value: String(option),
          label: option,
          title: FONT_WEIGHT_NAMES[option],
        }))}
        onValueChange={(next) => commit({ weight: Number(next) })}
      />
    </Field>
  );
}
