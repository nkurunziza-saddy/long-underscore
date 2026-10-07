"use client";

import { useEffect, useRef, useState } from "react";
import { cellClass, wellClass } from "@/components/ui/choice";
import { Pill } from "@/components/ui/pill";
import { useDebounce } from "@/hooks/use-debounce";
import { withFont } from "@/lib/design";
import {
  FONT_CATEGORIES,
  FONTS,
  type FontCategory,
  getCSSFontFamily,
  getFontLink,
  nearestWeight,
} from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useStudio } from "@/stores/studio-store";
import { Field, readoutClass } from "./fields";

/**
 * Pick a typeface by looking at your own letter in every one of them. Each
 * tile loads a subset font holding only those glyphs, so the whole wall costs
 * less than a single regular web font.
 */
export function FontSpecimens() {
  const design = useStudio((state) => state.design);
  const commit = useStudio((state) => state.commit);
  const [category, setCategory] = useState<FontCategory | "all">("all");

  // Two characters is the most a mark should hold, so that is all a tile shows.
  const sample = useDebounce(
    [...design.text.trim()].slice(0, 2).join("") || "Aa",
    250,
  );
  const weight = design.weight;

  // Keep the current face in view: on open, after a filter change, and when
  // a shuffle or an undo picks one that is scrolled out of sight. A tile that
  // is already visible stays put, so clicking never moves it under the cursor.
  const wall = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: reruns per face and filter
  useEffect(() => {
    const box = wall.current;
    const active = box?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (!box || !active) return;
    const top = active.offsetTop;
    const bottom = top + active.clientHeight;
    if (top < box.scrollTop || bottom > box.scrollTop + box.clientHeight) {
      box.scrollTop = top - box.clientHeight / 2 + active.clientHeight / 2;
    }
  }, [category, design.font]);

  useEffect(() => {
    const links = FONTS.map((font) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = getFontLink(
        font.value,
        [nearestWeight(font.value, weight)],
        sample,
      );
      document.head.appendChild(link);
      return link;
    });
    return () => {
      for (const link of links) link.remove();
    };
  }, [sample, weight]);

  const fonts = FONTS.filter(
    (font) => category === "all" || font.category === category,
  );
  const selected = FONTS.find((font) => font.value === design.font);

  return (
    <Field
      label="Typeface"
      aside={
        <span className={cn(readoutClass, "truncate")}>{selected?.name}</span>
      }
    >
      <div className="flex flex-wrap gap-0.5">
        {[{ value: "all" as const, label: "All" }, ...FONT_CATEGORIES].map(
          (option) => (
            <Pill
              key={option.value}
              active={category === option.value}
              onClick={() => setCategory(option.value)}
            >
              {option.label}
            </Pill>
          ),
        )}
      </div>
      <div
        ref={wall}
        className={cn(wellClass, "grid max-h-53 grid-cols-5 gap-0.5")}
      >
        {fonts.map((font) => (
          <button
            key={font.value}
            type="button"
            title={font.name}
            aria-label={font.name}
            aria-pressed={font.value === design.font}
            onClick={() => commit(withFont(design, font.value))}
            className={cn(
              cellClass,
              "h-12 overflow-hidden px-1 text-2xl leading-none text-foreground",
            )}
            style={{
              fontFamily: getCSSFontFamily(font.value),
              fontWeight: nearestWeight(font.value, weight),
            }}
          >
            <span className="truncate">{sample}</span>
          </button>
        ))}
      </div>
    </Field>
  );
}
