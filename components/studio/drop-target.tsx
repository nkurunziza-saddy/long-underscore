"use client";

import { useEffect, useState } from "react";
import { backdropClass, surfaceClass } from "@/components/ui/overlay";
import { toastManager } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { importSvgFile } from "./import-svg";

/** Accept an SVG dropped anywhere on the page. */
export function DropTarget() {
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const hasFiles = (event: DragEvent) =>
      event.dataTransfer?.types.includes("Files") ?? false;
    const onDragOver = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      setDragging(true);
    };
    const onDragLeave = (event: DragEvent) => {
      if (event.relatedTarget === null) setDragging(false);
    };
    const onDrop = async (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer?.files[0];
      if (file && !(await importSvgFile(file))) {
        toastManager.add({
          type: "error",
          title: "That is not an SVG",
          description:
            "Bitmaps blur at the sizes a favicon needs. Export your logo as SVG and drop that.",
        });
      }
    };
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  if (!dragging) return null;
  return (
    <div
      className={cn(
        backdropClass,
        "pointer-events-none flex items-center justify-center p-4",
      )}
    >
      <div className={cn(surfaceClass, "px-8 py-6 text-center")}>
        <p className="text-base font-medium">Drop your SVG</p>
        <p className="mt-1 text-sm text-fg-2">
          It becomes the mark. Nothing leaves your browser.
        </p>
      </div>
    </div>
  );
}
