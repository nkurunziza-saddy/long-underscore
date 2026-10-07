"use client";

import { UploadSimpleIcon } from "@phosphor-icons/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useStudio } from "@/stores/studio-store";
import { useAssets } from "../assets-context";
import { importSvgFile, importSvgMarkup } from "../import-svg";
import { Field, hintClass } from "./fields";

/** Your own artwork as the mark: a file, or its markup pasted in. */
export function SvgDrop() {
  const svgSource = useStudio((state) => state.svgSource);
  const setSvgSource = useStudio((state) => state.setSvgSource);
  const { svg } = useAssets();
  const fileInput = useRef<HTMLInputElement>(null);
  const invalid = svgSource.trim() !== "" && !svg;

  return (
    <Field
      label="Artwork"
      aside={
        svgSource && (
          <Button variant="ghost" size="xs" onClick={() => setSvgSource("")}>
            Clear
          </Button>
        )
      }
    >
      <Button variant="secondary" onClick={() => fileInput.current?.click()}>
        <UploadSimpleIcon />
        Choose an SVG file
      </Button>
      <input
        ref={fileInput}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) importSvgFile(file);
          event.target.value = "";
        }}
      />
      <Textarea
        value={svgSource}
        onChange={(event) => importSvgMarkup(event.target.value)}
        placeholder="Or paste <svg> markup. A file dropped anywhere on the page works too."
        aria-label="SVG markup"
        aria-invalid={invalid}
        spellCheck={false}
        className="field-sizing-fixed h-24 font-mono text-xs"
      />
      <p className={cn(hintClass, invalid && "text-destructive")}>
        {invalid
          ? "That is not valid SVG. Check for an unclosed tag."
          : svg
            ? `${svg.viewBox[2]} × ${svg.viewBox[3]} viewBox · ${(svg.bytes / 1024).toFixed(1)} KB. Scripts and event handlers are stripped on import.`
            : "A square viewBox works best. Your art is used as is; give it a plate under Colour."}
      </p>
    </Field>
  );
}
