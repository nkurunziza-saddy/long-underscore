"use client";

import { useEffect } from "react";
import { toastManager } from "@/components/ui/toast";
import { useStudio } from "@/stores/studio-store";
import { studioActions } from "./actions";
import { useAssets } from "./assets-context";
import { importSvgMarkup } from "./import-svg";

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/** Single-key shortcuts and paste-to-import, active whenever nobody is typing. */
export function Shortcuts() {
  const assets = useAssets();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.altKey) return;
      const key = event.key.toLowerCase();
      const command = event.metaKey || event.ctrlKey;
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        useStudio.getState().undo();
      } else if (command) {
        return;
      } else if (key === "s") {
        useStudio.getState().shuffle();
      } else if (key === "e") {
        studioActions(assets).downloadKit();
      }
    };
    const onPaste = (event: ClipboardEvent) => {
      if (isTyping(event.target)) return;
      const text = event.clipboardData?.getData("text") ?? "";
      if (/<svg[\s>]/i.test(text)) {
        importSvgMarkup(text);
        toastManager.add({ title: "SVG pasted as your mark", timeout: 2500 });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("paste", onPaste);
    };
  }, [assets]);

  return null;
}
