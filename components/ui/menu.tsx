"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "@/lib/utils";
import { menuRowClass, popupClass, positionerClass } from "./overlay";
import { chosenSegmentClass, segmentClass, trackClass } from "./segmented";

const Menu = MenuPrimitive.Root;

/** Usually a Button given as `render`, which keeps its own `data-slot`. */
const MenuTrigger = MenuPrimitive.Trigger;

/** As wide as what it holds, and never narrower than its trigger or 11rem. */
function MenuPopup({
  align = "start",
  alignOffset,
  side,
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className={positionerClass}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="menu-popup"
          className={cn(
            popupClass,
            "max-h-(--available-height) w-max max-w-(--available-width) min-w-[max(11rem,var(--anchor-width))] overflow-x-hidden overflow-y-auto p-1",
            className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function MenuItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-item"
      className={cn(
        menuRowClass,
        "[&_svg]:text-fg-3 data-highlighted:[&_svg]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A choice among a few on one line, the options as icons on a segmented
 * track. For a setting changed often; the menu stays open so the change can
 * be seen and undone.
 */
function MenuSegments<T extends string>({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: T | undefined;
  onValueChange: (value: T) => void;
  /** `label` is read out and shown on hover; only the icon is drawn. */
  options: readonly { value: T; label: string; icon: React.ReactNode }[];
}) {
  return (
    <MenuPrimitive.Group
      data-slot="menu-segments"
      className="flex h-7 items-center gap-2 pr-0.5 pl-2.5 text-sm text-fg-2"
    >
      <MenuPrimitive.GroupLabel className="min-w-0 flex-1 truncate">
        {label}
      </MenuPrimitive.GroupLabel>
      <MenuPrimitive.RadioGroup
        value={value}
        onValueChange={(next) => onValueChange(next as T)}
        className={trackClass}
      >
        {options.map((option) => (
          <MenuPrimitive.RadioItem
            key={option.value}
            value={option.value}
            closeOnClick={false}
            aria-label={option.label}
            title={option.label}
            className={cn(
              segmentClass,
              chosenSegmentClass,
              "h-5 w-7 cursor-default outline-hidden data-highlighted:text-foreground",
            )}
          >
            {option.icon}
          </MenuPrimitive.RadioItem>
        ))}
      </MenuPrimitive.RadioGroup>
    </MenuPrimitive.Group>
  );
}

function MenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="menu-separator"
      className={cn("-mx-1 my-1 h-px bg-line", className)}
      {...props}
    />
  );
}

export { Menu, MenuItem, MenuPopup, MenuSegments, MenuSeparator, MenuTrigger };
