"use client";

import { createElement, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cellClass, wellClass } from "@/components/ui/choice";
import { FilterInput } from "@/components/ui/filter-input";
import { FALLBACK_ICONS, type IconSet, loadIconSet } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useStudio } from "@/stores/studio-store";
import { Field, readoutClass } from "./fields";

const PAGE = 147;

export function IconPicker() {
  const icon = useStudio((state) => state.design.icon);
  const commit = useStudio((state) => state.commit);
  const [icons, setIcons] = useState<IconSet>(FALLBACK_ICONS);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    let live = true;
    loadIconSet().then((set) => live && setIcons(set));
    return () => {
      live = false;
    };
  }, []);

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = Object.keys(icons).filter((name) =>
    terms.every((term) => name.includes(term)),
  );
  const visible = matches.slice(0, limit);

  return (
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
        label={`Search ${Object.keys(icons).length.toLocaleString("en")} icons`}
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
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4.5"
                aria-hidden="true"
              >
                {icons[name].map(([tag, attrs], index) =>
                  createElement(tag, { key: index, ...attrs }),
                )}
              </svg>
            </button>
          ))}
        </div>
        {matches.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-pretty text-fg-3">
            Nothing matches “{query}”. Lucide names are literal: try “arrow”,
            “chart” or “heart”.
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
  );
}
