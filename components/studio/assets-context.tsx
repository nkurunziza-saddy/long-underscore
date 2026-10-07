"use client";

import { createContext, type ReactNode, useContext } from "react";
import { type StudioAssets, useMarkAssets } from "@/hooks/use-mark-assets";
import { NO_ASSETS } from "@/lib/render-mark";

const AssetsContext = createContext<StudioAssets>({
  ...NO_ASSETS,
  fontVersion: 0,
});

export function AssetsProvider({ children }: { children: ReactNode }) {
  return <AssetsContext value={useMarkAssets()}>{children}</AssetsContext>;
}

export const useAssets = () => useContext(AssetsContext);
