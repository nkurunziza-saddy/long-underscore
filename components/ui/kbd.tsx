import { cn } from "@/lib/utils";

/** A keyboard hint, for the right-hand end of a tooltip or a menu row. */
export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return <kbd className={cn("kbd", className)} {...props} />;
}
