import { cn } from "@/lib/utils";
import { fieldClass } from "./input";

/** A multi-line field. Grows with its content; same fill and focus as Input. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldClass,
        "flex field-sizing-content min-h-16 w-full resize-none rounded-xl px-3 py-1.5 text-sm leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
