import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-control font-medium select-none transition-[background-color,color,box-shadow,transform] duration-100 active:translate-y-px data-disabled:pointer-events-none data-disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-control hover:bg-primary-hover",
        /* A filled neutral control: everything that is not the view's one
           primary verb. */
        secondary:
          "bg-control text-foreground shadow-edge hover:bg-control-hover aria-pressed:bg-control-hover aria-expanded:bg-control-hover",
        ghost:
          "text-fg-2 hover:bg-control hover:text-foreground aria-pressed:bg-control aria-pressed:text-foreground aria-expanded:bg-control",
      },
      size: {
        xs: "h-5 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-6 px-2.5 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        default: "h-6.5 px-3 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-6 [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-6.5 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant ?? "default"}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
