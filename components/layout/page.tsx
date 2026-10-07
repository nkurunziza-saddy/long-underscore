import { cn } from "@/lib/utils";

/**
 * The frame an app stands in: the title row on the chrome, and under it the
 * insets, side by side. While there is room each inset scrolls on its own
 * and the window does not; on a small screen they stack and the window
 * scrolls. It is a stacking context of its own, so nothing in it can lie
 * over a menu or a dialog.
 */
export function Shell({
  header,
  children,
}: {
  /** The title row, and anything else that rides along on the chrome. */
  header: React.ReactNode;
  /** The insets: a PageBody, and a Dock beside it. */
  children: React.ReactNode;
}) {
  return (
    <div data-slot="shell" className="isolate flex min-h-dvh flex-col lg:h-dvh">
      {header}
      <div className="flex flex-1 flex-col gap-2 px-2 pb-2 lg:min-h-0 lg:flex-row">
        {children}
      </div>
    </div>
  );
}

/** The card an inset is: the page's own, and the dock's beside it. */
export const insetClass =
  "flex flex-col rounded-xl bg-page shadow-page lg:min-h-0 lg:overflow-hidden";

/**
 * A page's content: the scrolling inset under the title row. What it is
 * given stacks, a section's gap apart. It is a `@container`, and a page lays
 * itself out by that width (`@xl:`, `@4xl:`), not the window's: the dock
 * narrows the page without the window changing.
 */
export function PageBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <main className={cn(insetClass, "min-w-0 flex-1")}>
      <div className="@container flex-1 lg:min-h-0 lg:overflow-y-auto">
        <div
          data-slot="page-body"
          className={cn(
            "mx-auto flex min-h-full w-full max-w-7xl flex-col gap-8 px-3 pt-4 pb-10 md:px-4",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
