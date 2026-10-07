"use client";

import { useLayoutEffect } from "react";
import { Shell } from "@/components/layout/page";
import { readSharedDesign } from "@/lib/share";
import { useStudio } from "@/stores/studio-store";
import { AssetsProvider } from "./assets-context";
import { Controls } from "./controls/controls";
import { DropTarget } from "./drop-target";
import { Header } from "./header";
import { LiveFavicon } from "./live-favicon";
import { PocketPreview } from "./preview/pocket-preview";
import { Preview } from "./preview/preview";
import { Shortcuts } from "./shortcuts";

/**
 * The studio: a title row on the chrome, and under it the page that shows
 * the mark beside the controls that change, check and export it.
 */
export function Studio() {
  // Stored work and share links are applied before the first paint, after
  // hydration, so the server markup matches and nothing flashes.
  useLayoutEffect(() => {
    useStudio.persist.rehydrate();
    const shared = readSharedDesign(window.location);
    if (shared) {
      useStudio.getState().commit(shared);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <AssetsProvider>
      <LiveFavicon />
      <Shortcuts />
      <DropTarget />
      <Shell
        header={
          <>
            <Header />
            <PocketPreview />
          </>
        }
      >
        <Controls />
        <Preview />
      </Shell>
    </AssetsProvider>
  );
}
