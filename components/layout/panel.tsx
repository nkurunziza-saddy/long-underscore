import { cn } from "@/lib/utils";

/** A muted card of rows, split by seams: a `PanelHead`, `PanelBlock`s. */
export function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn(
        "edge-card flex flex-col divide-y divide-seam overflow-hidden rounded-xl bg-panel",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The first row of a Panel that stands beside others in one Section: what
 * this one shows on the left, a note on it on the right.
 */
export function PanelHead({
  label,
  children,
}: {
  label: React.ReactNode;
  /** The note. */
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="panel-head"
      className="flex h-8 shrink-0 items-center justify-between gap-3 px-3 text-xs"
    >
      <h3 className="shrink-0 font-medium text-fg-2">{label}</h3>
      {children && <p className="min-w-0 truncate text-fg-3">{children}</p>}
    </div>
  );
}

/** A row of a Panel that holds something else: a preview, a few lines, code. */
export function PanelBlock({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-block"
      className={cn("px-3 py-2.5 text-sm", className)}
      {...props}
    />
  );
}
