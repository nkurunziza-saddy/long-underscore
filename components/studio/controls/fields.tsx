"use client";

import { type ReactNode, useEffect, useId, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { normalizeHex } from "@/lib/color";
import { cn } from "@/lib/utils";

/** What a field is called, above its control. */
const labelClass = "text-xs text-fg-3";

/** A figure read off a control, at the far end of its label's line. */
export const readoutClass = "text-xs tabular-nums text-fg-2";

/** What a field has to say about its control, under it. */
export const hintClass = "px-1 text-xs text-pretty text-fg-3";

/**
 * A few fields that belong together, under a heading where one helps. Every
 * group after a tab's first is set apart from the one above by a hairline.
 */
export function Group({
  title,
  aside,
  children,
}: {
  title?: string;
  /** A readout or a quiet action at the far end of the heading's line. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-line not-first:border-t not-first:pt-4">
      {title && (
        <div className="flex min-h-5 items-center justify-between gap-2 px-1">
          <h3 className="text-sm font-medium">{title}</h3>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

interface FieldProps {
  label: string;
  /** A readout or a quiet action at the far end of the label's line. */
  aside?: ReactNode;
  hint?: ReactNode;
  /** The control's id. Left out where the control names itself. */
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

/** A label above its control, with an optional hint under it. */
export function Field({
  label,
  aside,
  hint,
  htmlFor,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex min-h-4 items-center justify-between gap-2 px-1">
        {htmlFor ? (
          <label htmlFor={htmlFor} className={labelClass}>
            {label}
          </label>
        ) : (
          <span className={labelClass}>{label}</span>
        )}
        {aside}
      </div>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  hint?: ReactNode;
}

export function SliderField({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  format = String,
  hint,
}: SliderFieldProps) {
  return (
    <Field
      label={label}
      hint={hint}
      aside={<span className={readoutClass}>{format(value)}</span>}
    >
      <Slider
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={onValueChange}
      />
    </Field>
  );
}

interface ColorFieldProps {
  label: string;
  value: string;
  onValueChange: (hex: string) => void;
  disabled?: boolean;
}

/** Native picker plus a hex box that only commits once the value is valid. */
export function ColorField({
  label,
  value,
  onValueChange,
  disabled,
}: ColorFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const invalid = normalizeHex(draft) === null;

  return (
    <Field
      label={label}
      htmlFor={id}
      className={cn(disabled && "pointer-events-none opacity-50")}
    >
      <div
        className={cn(
          "flex h-6.5 items-center gap-2 rounded-control border border-border bg-field pr-3 pl-1.5 transition-[border-color,box-shadow] duration-100 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15",
          invalid && "border-destructive ring-3 ring-destructive/15",
        )}
      >
        <input
          type="color"
          aria-label={`${label} picker`}
          disabled={disabled}
          value={normalizeHex(value) ?? "#000000"}
          onChange={(event) => onValueChange(event.target.value)}
          className="swatch-input size-4 shrink-0 cursor-pointer rounded-sm"
        />
        <input
          id={id}
          disabled={disabled}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid}
          onChange={(event) => {
            setDraft(event.target.value);
            const hex = normalizeHex(event.target.value);
            if (hex) onValueChange(hex);
          }}
          onBlur={() => setDraft(value)}
          className="w-full min-w-0 bg-transparent font-mono text-xs uppercase outline-none"
        />
      </div>
    </Field>
  );
}

/** A Checkbox with its label beside it: pressing either sets it. */
export function CheckField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 self-start px-1 text-sm text-foreground">
        {children}
        {label}
      </label>
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}
