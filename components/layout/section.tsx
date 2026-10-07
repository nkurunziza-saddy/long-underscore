import { cn } from "@/lib/utils";

/**
 * A titled part of a page: a heading, an optional note on what it holds at
 * the far end of the same line, then a Panel or a few of them. An `id` lets
 * the page be scrolled to it.
 */
export function Section({
  id,
  title,
  note,
  className,
  children,
}: {
  id?: string;
  title: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("flex min-w-0 scroll-mt-4 flex-col", className)}
    >
      <div className="mb-2 flex min-h-5 items-center gap-3 px-1">
        <h2 className="shrink-0 text-sm font-medium text-foreground">
          {title}
        </h2>
        {note && (
          <p className="min-w-0 flex-1 truncate text-right text-xs text-fg-3">
            {note}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
