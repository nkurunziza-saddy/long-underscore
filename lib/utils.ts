import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Told the names of our own radii and shadows (app/globals.css), so
// `rounded-xl` replaces `rounded-control` and `shadow-pop` is not read as a
// shadow colour.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["control", "menu", "segment"],
      shadow: ["control", "page", "edge", "pop"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
