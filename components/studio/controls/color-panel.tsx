"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { tileClass } from "@/components/ui/choice";
import { contrast, mix } from "@/lib/color";
import {
  applyTreatment,
  type Design,
  HUES,
  hasDarkVariant,
  hueLabel,
  TREATMENTS,
} from "@/lib/design";
import { colorPalettes } from "@/lib/palettes";
import { cn } from "@/lib/utils";
import { useStudio } from "@/stores/studio-store";
import { MarkCanvas } from "../mark-canvas";
import {
  CheckField,
  ColorField,
  Field,
  Group,
  hintClass,
  readoutClass,
} from "./fields";

/** A treatment and a hue, the exact colours behind them, and dark chrome. */
export function ColorPanel() {
  const design = useStudio((state) => state.design);
  const update = useStudio((state) => state.update);
  const commit = useStudio((state) => state.commit);

  const treatment = design.treatment === "custom" ? "solid" : design.treatment;
  const custom = (patch: Partial<Design>) =>
    update({ ...patch, treatment: "custom" });
  const plate = design.bg2 ? mix(design.bg, design.bg2, 0.5) : design.bg;
  const drawn = design.source !== "svg";
  const ratio = contrast(design.fg, plate);

  return (
    <>
      <Group>
        <Field
          label="Treatment"
          aside={
            design.treatment === "custom" && (
              <span className={readoutClass}>Custom</span>
            )
          }
          hint="Six ways to wear one hue. Each is tuned for contrast, so any pick is a safe pick."
        >
          <div className="grid grid-cols-3 gap-1.5">
            {TREATMENTS.map((option) => (
              <button
                key={option.value}
                type="button"
                title={option.hint}
                aria-pressed={design.treatment === option.value}
                onClick={() => commit(applyTreatment(design.hue, option.value))}
                className={cn(tileClass, "items-center gap-1.5 pt-2.5 pb-1.5")}
              >
                <span className={cn(option.value === "ghost" && "checker")}>
                  <MarkCanvas
                    size={40}
                    label={`${option.label} treatment`}
                    design={{
                      ...design,
                      ...applyTreatment(design.hue, option.value),
                    }}
                  />
                </span>
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field
          label="Hue"
          aside={
            <span className={cn(readoutClass, "capitalize")}>
              {hueLabel(design.hue)}
            </span>
          }
        >
          <div className="grid grid-cols-11 gap-1 px-0.5">
            {HUES.map((hue) => (
              <button
                key={hue}
                type="button"
                title={hueLabel(hue)}
                aria-label={hueLabel(hue)}
                aria-pressed={design.hue === hue}
                onClick={() => commit(applyTreatment(hue, treatment))}
                className={cn(
                  "aspect-square rounded-sm ring-offset-2 ring-offset-page transition-transform duration-75 hover:scale-110",
                  design.hue === hue &&
                    design.treatment !== "custom" &&
                    "ring-2 ring-ring",
                )}
                style={{ backgroundColor: colorPalettes[hue][5] }}
              />
            ))}
          </div>
        </Field>
      </Group>

      <Group
        title="Exact colours"
        aside={
          drawn &&
          !design.transparent && (
            <span
              className={cn(readoutClass, ratio < 3 && "text-destructive")}
              title="Contrast between glyph and plate"
            >
              {ratio < 3 && "Low contrast, "}
              {ratio.toFixed(1)}:1
            </span>
          )
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label={drawn ? "Glyph" : "Art tint"}
            value={design.fg}
            onValueChange={(fg) => custom({ fg })}
          />
          <ColorField
            label="Plate"
            value={design.bg}
            disabled={design.transparent}
            onValueChange={(bg) => custom({ bg })}
          />
        </div>
        <div className="grid grid-cols-2 items-end gap-3">
          <ColorField
            label="Fades to"
            value={design.bg2 ?? design.bg}
            disabled={design.transparent || design.bg2 === null}
            onValueChange={(bg2) => custom({ bg2 })}
          />
          <div className="flex flex-col gap-1.5 pb-0.5">
            <CheckField label="Gradient">
              <Checkbox
                checked={design.bg2 !== null}
                disabled={design.transparent}
                onCheckedChange={(checked) =>
                  custom({
                    bg2: checked ? mix(design.bg, "#000000", 0.35) : null,
                  })
                }
              />
            </CheckField>
            <CheckField label="No plate">
              <Checkbox
                checked={design.transparent}
                onCheckedChange={(checked) =>
                  custom({ transparent: !!checked })
                }
              />
            </CheckField>
          </div>
        </div>
        {design.transparent && (
          <p className={hintClass}>
            A home screen cannot show through, so there the glyph sits on a dark
            neutral{drawn ? ", lifted if it is too dark to read on one" : ""}.
          </p>
        )}
      </Group>

      <Group title="Dark mode">
        <CheckField
          label="Adapt to dark browser chrome"
          hint={
            !design.adaptive
              ? "Off: one look everywhere. Pale plates will glare and dark glyphs will sink on dark tab strips."
              : hasDarkVariant(design)
                ? "On, and in use: icon.svg carries a derived dark variant. See the dark tab strip."
                : "On, but this mark already holds up on dark chrome, so nothing is changed."
          }
        >
          <Checkbox
            checked={design.adaptive}
            onCheckedChange={(checked) => commit({ adaptive: !!checked })}
          />
        </CheckField>
      </Group>
    </>
  );
}
