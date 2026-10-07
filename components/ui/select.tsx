"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CaretDownIcon, CaretUpIcon, CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { fieldClass } from "./input";
import { menuRowClass, popupClass, positionerClass } from "./overlay";

const Select = SelectPrimitive.Root;

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex-1 truncate text-left", className)}
      {...props}
    />
  );
}

/** Looks like Input: a filled field with a caret. */
function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        fieldClass,
        "flex h-6.5 w-full min-w-36 items-center justify-between gap-2 rounded-control pr-2 pl-3 text-sm whitespace-nowrap transition-[background-color,border-color,box-shadow] select-none hover:bg-field-hover data-popup-open:border-ring [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={<CaretDownIcon className="pointer-events-none text-fg-3" />}
      />
    </SelectPrimitive.Trigger>
  );
}

const scrollArrowClass =
  "z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 text-fg-3 [&_svg]:size-3.5";

/**
 * The list: the same floating surface as a menu. Opened with a mouse it lies
 * over its trigger with the chosen item where the value was, and is simply
 * there; under its trigger (touch, or no room) it arrives as a menu does.
 */
function SelectPopup({
  className,
  children,
  side,
  sideOffset = 4,
  align,
  alignOffset,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={positionerClass}
      >
        <SelectPrimitive.Popup
          data-slot="select-popup"
          className={cn(
            popupClass,
            "relative w-(--anchor-width) min-w-44 overflow-hidden data-[side=none]:transition-none",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow
            className={cn("top-0", scrollArrowClass)}
          >
            <CaretUpIcon />
          </SelectPrimitive.ScrollUpArrow>
          {/* The list scrolls, not the popup: Base UI's scroll arrows and
              its lining up of the chosen item both act on the list. */}
          <SelectPrimitive.List className="max-h-(--available-height) overflow-y-auto p-1">
            {children}
          </SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow
            className={cn("bottom-0", scrollArrowClass)}
          >
            <CaretDownIcon />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

/** A row like a menu item; the chosen one gets a check on the right. */
function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        menuRowClass,
        "w-full pr-8 data-[selected]:text-foreground",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 items-center gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="pointer-events-none absolute right-2.5 flex size-4 items-center justify-center">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue };
