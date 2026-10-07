"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cellClass, wellClass } from "@/components/ui/choice";
import { FilterInput } from "@/components/ui/filter-input";
import { Segmented } from "@/components/ui/segmented";
import {
  FALLBACK_ICONS,
  ICON_BOX,
  ICON_WEIGHTS,
  type IconSet,
  loadIconSet,
  loadIconWords,
  searchIcons,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useStudio } from "@/stores/studio-store";
import { Field, readoutClass } from "./fields";

const PAGE = 147;

/**
 * Pick one of Phosphor's icons, and the weight it is drawn in. The wall
 * shows every icon in that weight, so what is picked is what is drawn.
 */
export function IconPicker() {
  const icon = useStudio((state) => state.design.icon);
  const weight = useStudio((state) => state.design.iconWeight);
  const commit = useStudio((state) => state.commit);
  const [icons, setIcons] = useState<IconSet>(FALLBACK_ICONS);
  const [words, setWords] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    let live = true;
    loadIconSet(weight).then((set) => live && setIcons(set));
    return () => {
      live = false;
    };
  }, [weight]);

  useEffect(() => {
    let live = true;
    loadIconWords().then((loaded) => live && setWords(loaded));
    return () => {
      live = false;
    };
  }, []);

  const names = Object.keys(icons);
  const matches = searchIcons(names, words, query);
  const visible = matches.slice(0, limit);

  return (
    <>
      <Field
        label="Icon"
        aside={<span className={cn(readoutClass, "truncate")}>{icon}</span>}
      >
        <FilterInput
          value={query}
          onValueChange={(next) => {
            setQuery(next);
            setLimit(PAGE);
          }}
          label={`Search ${names.length.toLocaleString("en")} icons`}
        />
        <div className={cn(wellClass, "max-h-53")}>
          <div className="grid grid-cols-7 gap-0.5">
            {visible.map((name) => (
              <button
                key={name}
                type="button"
                title={name}
                aria-label={name}
                aria-pressed={name === icon}
                onClick={() => commit({ icon: name })}
                className={cn(cellClass, "aspect-square")}
              >
                <svg
                  viewBox={`0 0 ${ICON_BOX} ${ICON_BOX}`}
                  fill="currentColor"
                  className="size-5"
                  aria-hidden="true"
                >
                  {icons[name].map((path) => (
                    <path key={path.d} d={path.d} opacity={path.opacity} />
                  ))}
                </svg>
              </button>
            ))}
          </div>
          {matches.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-pretty text-fg-3">
              Nothing matches “{query}”. Try a plainer word: “arrow”, “chart” or
              “heart”.
            </p>
          )}
          {matches.length > limit && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 w-full"
              onClick={() => setLimit(limit + PAGE * 2)}
            >
              Show more ({(matches.length - limit).toLocaleString("en")} left)
            </Button>
          )}
        </div>
      </Field>

      <Field label="Weight">
        <Segmented
          fill
          aria-label="Icon weight"
          value={weight}
          options={ICON_WEIGHTS}
          onValueChange={(iconWeight) => commit({ iconWeight })}
        />
      </Field>
    </>
  );
}
