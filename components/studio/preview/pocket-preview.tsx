"use client";

import { MarkCanvas } from "../mark-canvas";
import { CHROME } from "./browser";

/** On small screens the page scrolls away, so the mark rides along up top. */
export function PocketPreview() {
  return (
    <div className="sticky top-11 z-30 flex shrink-0 items-center gap-2 bg-app px-5 pb-2 lg:hidden">
      <MarkCanvas size={32} label="Mark preview" />
      {(["light", "dark"] as const).map((theme) => (
        <span
          key={theme}
          className="flex rounded-md p-2"
          style={{ backgroundColor: CHROME[theme].tab }}
        >
          <MarkCanvas size={16} theme={theme} label={`On a ${theme} tab`} />
        </span>
      ))}
      <span className="ml-auto text-xs text-fg-3">Live at 32 and 16px</span>
    </div>
  );
}
