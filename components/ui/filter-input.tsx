import { MagnifyingGlassIcon } from "@phosphor-icons/react";

/** A list's search field. Escape clears and leaves. */
export function FilterInput({
  value,
  onValueChange,
  label,
}: {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
}) {
  return (
    <label className="flex h-6.5 w-full items-center gap-2 rounded-control bg-control px-2.5 text-fg-3 shadow-edge transition-shadow duration-150 focus-within:ring-3 focus-within:ring-ring/20">
      <MagnifyingGlassIcon className="size-3.5 shrink-0" />
      <input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          onValueChange("");
          event.currentTarget.blur();
        }}
        placeholder={label}
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-fg-3"
      />
    </label>
  );
}
