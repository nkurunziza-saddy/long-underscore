import { cn } from "@/lib/utils";

/**
 * The look of what is typed into or chosen from: Input, Textarea, a Select's
 * trigger, a colour field. A refusal reddens it (`aria-invalid`, or the
 * `data-invalid` Base UI reports).
 */
const fieldClass =
  "border border-border bg-field text-foreground outline-none transition-[border-color,box-shadow] duration-100 placeholder:text-fg-3 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/15";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        fieldClass,
        "h-6.5 w-full min-w-0 rounded-control px-3 text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { fieldClass, Input };
