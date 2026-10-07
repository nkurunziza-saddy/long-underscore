"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";
import { popupClass, positionerClass } from "./overlay";

function TooltipProvider({
  delay = 300,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  );
}

function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

/** Usually a Button given as `render`, which keeps its own `data-slot`. */
const TooltipTrigger = TooltipPrimitive.Trigger;

/** A small floating label, with room for a keycap on the right. */
function TooltipContent({
  className,
  align,
  alignOffset,
  side,
  sideOffset = 6,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className={positionerClass}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            popupClass,
            // Going from one tooltip to the next, the second is simply
            // there: Base UI marks it `data-instant`.
            "inline-flex w-fit max-w-xs items-center gap-2 rounded-control px-2.5 py-1 text-xs has-[.kbd]:pr-1 data-instant:transition-none",
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
