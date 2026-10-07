import { cn } from "@/lib/utils";
import { insetClass } from "./page";

/**
 * A second inset beside the page's, for what changes what the page shows.
 * Its tabs and its footer stay put; only the body between them scrolls. On a
 * small screen it comes first and is as tall as what it holds.
 */
export function Dock({
  label,
  className,
  ...props
}: React.ComponentProps<"aside"> & { label: string }) {
  return (
    <aside
      data-slot="dock"
      aria-label={label}
      className={cn(
        insetClass,
        "scroll-mt-24 lg:order-last lg:w-95 lg:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

/** The dock's tab row. A `gap` child with `flex-1` parts one group of tabs from the next. */
export function DockTabs({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      data-slot="dock-tabs"
      className={cn(
        "flex shrink-0 items-center gap-0.5 overflow-x-auto p-2",
        className,
      )}
      {...props}
    />
  );
}

/** What the chosen tab holds: one column, a group's gap apart. */
export function DockBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="tabpanel"
      data-slot="dock-body"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-4 overscroll-contain px-3.5 pt-1 pb-3.5 lg:overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

/** Pinned under the body: the tab's own actions. */
export function DockFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dock-footer"
      className={cn(
        "flex shrink-0 items-center gap-2 border-t border-line p-2.5",
        className,
      )}
      {...props}
    />
  );
}
