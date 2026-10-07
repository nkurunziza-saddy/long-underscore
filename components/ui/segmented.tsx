"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The look of a segmented track, kept apart from what it does: here it picks
 * one value, in `MenuSegments` it is a setting in a menu.
 */

/** The track: a filled control whose segments sit 2px inside it. */
export const trackClass =
  "relative inline-flex shrink-0 gap-0.5 rounded-control bg-control p-0.5 shadow-edge";

/** One segment: quiet until it is the chosen one. */
export const segmentClass =
  "relative inline-flex items-center justify-center gap-1.5 rounded-segment font-medium whitespace-nowrap text-fg-3 transition-colors duration-100 select-none hover:text-foreground data-checked:text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0";

/** The chosen segment's own fill, where no indicator slides under it. */
export const chosenSegmentClass =
  "data-checked:bg-page data-checked:shadow-control";

// The track is as tall as the Button of the same size.
const SIZES = {
  sm: "h-5 px-2 text-xs",
  default: "h-5.5 px-2.5 text-xs",
} as const;

type Box = { left: number; width: number };

/**
 * Where the chosen segment is, inside the track. `null` until it has been
 * measured and has a size, which it has not on a server, while its panel is
 * hidden, or while no option is the chosen one.
 */
function useChosenBox(value: unknown) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: measured again when the value moves
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const chosen = track.querySelector<HTMLElement>(
        '[role="radio"][data-checked]',
      );
      const left = chosen?.offsetLeft ?? 0;
      const width = chosen?.offsetWidth ?? 0;
      setBox((previous) => {
        if (width === 0) return null;
        if (previous?.left === left && previous.width === width)
          return previous;
        return { left, width };
      });
    };
    measure();
    // The font or a label can resize a segment after it is drawn.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [value]);

  return [trackRef, box] as const;
}

/**
 * A row of mutually exclusive options on one track, for choosing a value. It
 * is a radio group: one tab stop, and the arrow keys move between options.
 * The fill slides from the option left to the one chosen. `fill` stretches
 * the track across its column and shares it out evenly.
 */
export function Segmented<T extends string>({
  value,
  options,
  onValueChange,
  size = "default",
  fill = false,
  "aria-label": ariaLabel,
  className,
}: {
  value: T;
  options: readonly {
    value: T;
    label: ReactNode;
    icon?: ReactNode;
    title?: string;
  }[];
  onValueChange: (value: T) => void;
  size?: keyof typeof SIZES;
  fill?: boolean;
  "aria-label"?: string;
  className?: string;
}) {
  const [trackRef, box] = useChosenBox(value);
  const chosen = options.some((option) => option.value === value);

  return (
    <RadioGroup
      ref={trackRef}
      data-slot="segmented"
      aria-label={ariaLabel}
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      className={cn(trackClass, fill && "flex w-full", className)}
    >
      {box && (
        <span
          aria-hidden
          data-slot="segmented-indicator"
          style={
            {
              "--chosen-left": `${box.left}px`,
              "--chosen-width": `${box.width}px`,
            } as React.CSSProperties
          }
          className="pointer-events-none absolute inset-y-0.5 left-0 w-(--chosen-width) translate-x-(--chosen-left) rounded-segment bg-page shadow-control transition-[translate,width] duration-200 ease-out"
        />
      )}
      {options.map((option, index) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          nativeButton
          render={<button type="button" />}
          title={option.title}
          // One tab stop: the chosen option, or the first while none is.
          tabIndex={option.value === value || (!chosen && index === 0) ? 0 : -1}
          data-slot="segmented-option"
          className={cn(
            segmentClass,
            SIZES[size],
            fill && "min-w-0 flex-1 px-1",
            // Until the indicator is drawn the chosen segment fills itself.
            !box && chosenSegmentClass,
          )}
        >
          {option.icon}
          {option.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
