"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "@/lib/utils";

/**
 * One value on a thin track, filled in ink up to the thumb. The control is as
 * tall as a thumb's target; the track is the bar a Meter would draw.
 */
function Slider({ className, ...props }: SliderPrimitive.Root.Props<number>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      thumbAlignment="edge"
      className={cn("w-full", className)}
      {...props}
    >
      <SliderPrimitive.Control className="flex h-4 w-full touch-none items-center select-none data-disabled:pointer-events-none data-disabled:opacity-50">
        <SliderPrimitive.Track className="relative h-1 w-full rounded-control bg-input select-none">
          <SliderPrimitive.Indicator className="rounded-control bg-primary select-none" />
          <SliderPrimitive.Thumb className="block size-3.5 shrink-0 rounded-full border border-input bg-white shadow-sm outline-none transition-shadow duration-100 select-none has-focus-visible:ring-3 has-focus-visible:ring-ring/25 data-dragging:ring-3 data-dragging:ring-ring/25 dark:border-transparent dark:bg-foreground" />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
