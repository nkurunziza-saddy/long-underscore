"use client";

import { LockSimpleIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { Panel, PanelBlock, PanelHead } from "@/components/layout/panel";
import { Section } from "@/components/layout/section";
import {
  cardTitle,
  hasDarkVariant,
  siteHost,
  siteName,
  type Theme,
} from "@/lib/design";
import { useDesign } from "@/stores/studio-store";
import { MarkCanvas } from "../mark-canvas";
import { PREVIEW } from "./sections";

/** A browser's own colours, light and dark: a picture of it, not our tokens. */
export const CHROME: Record<
  Theme,
  { strip: string; tab: string; text: string; dim: string; bar: string }
> = {
  light: {
    strip: "#dee1e6",
    tab: "#ffffff",
    text: "#1f1f1f",
    dim: "#5f6368",
    bar: "#f1f3f4",
  },
  dark: {
    strip: "#202124",
    tab: "#35363a",
    text: "#e8eaed",
    dim: "#9aa0a6",
    bar: "#202124",
  },
};

/** The top of a browser window: an active tab, one behind it, the address. */
function TabStrip({ theme }: { theme: Theme }) {
  const design = useDesign();
  const chrome = CHROME[theme];
  const host = siteHost(design) || "your-site.com";
  const adapted = theme === "dark" && hasDarkVariant(design);

  return (
    <Panel>
      <PanelHead label={theme === "light" ? "Light tabs" : "Dark tabs"}>
        {adapted ? "Dark variant in use" : "16px"}
      </PanelHead>
      <div
        className="flex flex-1 flex-col select-none"
        style={{ backgroundColor: chrome.strip, color: chrome.text }}
      >
        <div className="flex items-end gap-1 px-2 pt-2">
          <div
            className="flex h-8 min-w-0 flex-[1.6] items-center gap-2 rounded-t-lg px-2.5"
            style={{ backgroundColor: chrome.tab }}
          >
            <MarkCanvas size={16} theme={theme} label="Favicon in active tab" />
            <span className="truncate text-xs">{cardTitle(design)}</span>
            <XIcon className="ml-auto size-3 shrink-0 opacity-60" />
          </div>
          <div className="flex h-8 min-w-0 flex-1 items-center gap-2 px-2.5">
            <MarkCanvas
              size={16}
              theme={theme}
              label="Favicon in background tab"
            />
            <span className="truncate text-xs" style={{ color: chrome.dim }}>
              {siteName(design)} — Docs
            </span>
          </div>
          <div className="flex h-8 w-7 shrink-0 items-center justify-center">
            <PlusIcon className="size-3.5 opacity-60" />
          </div>
        </div>
        {/* The toolbar runs on into the page under it, as far as the card goes. */}
        <div
          className="flex-1 px-2 py-1.5"
          style={{ backgroundColor: chrome.tab }}
        >
          <div
            className="flex h-6 w-full items-center gap-2 rounded-full px-3"
            style={{ backgroundColor: chrome.bar, color: chrome.dim }}
          >
            <LockSimpleIcon className="size-3 shrink-0" />
            <span className="truncate text-2xs">{host}</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/** The site as a search engine lists it. */
function SearchResult({ className }: { className?: string }) {
  const design = useDesign();
  const host = siteHost(design) || "your-site.com";
  const description =
    design.description.trim() ||
    "Your description appears here. Add one under Site so search engines do not have to guess.";

  return (
    <Panel className={className}>
      <PanelHead label="Search result">Favicon in a 28px circle</PanelHead>
      <PanelBlock className="flex flex-1 flex-col justify-center gap-1.5 p-4">
        <div className="flex items-center gap-3">
          <span className="edge-card flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-page">
            <MarkCanvas size={18} label="Favicon in search result" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm">{siteName(design)}</span>
            <span className="block truncate text-xs text-fg-3">
              https://{host}
            </span>
          </span>
        </div>
        {/* A search engine's own link blue, as the tabs are a browser's. */}
        <p className="truncate text-lg text-[#1a0dab] dark:text-[#8ab4f8]">
          {cardTitle(design)}
        </p>
        <p className="line-clamp-2 text-sm text-pretty text-fg-2">
          {description}
        </p>
      </PanelBlock>
    </Panel>
  );
}

/** Where a favicon is met: on a tab, light or dark, and beside a search result. */
export function BrowserSection() {
  return (
    <Section id={PREVIEW.browser} title="Browser">
      <div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
        <TabStrip theme="light" />
        <TabStrip theme="dark" />
        <SearchResult className="@xl:col-span-2 @4xl:col-span-1" />
      </div>
    </Section>
  );
}
