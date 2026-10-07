import { cn } from "@/lib/utils";

/** The look of a pill, for a part that is one by another name: a tab. */
export function pillClass(active: boolean) {
  return cn(
    "inline-flex h-6 shrink-0 items-center justify-center gap-1.5 rounded-control px-2.5 text-sm whitespace-nowrap transition-colors duration-100",
    active
      ? "bg-control font-medium text-foreground shadow-edge"
      : "text-fg-2 hover:text-foreground",
  );
}

/** A compact filter or view toggle. Bare until active. */
export function Pill({
  active = false,
  className,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(pillClass(active), className)}
      {...props}
    />
  );
}
