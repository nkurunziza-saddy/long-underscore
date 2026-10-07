"use client";

import { Dock, DockBody, DockFooter, DockTabs } from "@/components/layout/dock";
import { pillClass } from "@/components/ui/pill";
import { cn } from "@/lib/utils";
import { type StudioTab, useStudio } from "@/stores/studio-store";
import { showPreview } from "../preview/sections";
import { useChecks } from "../use-checks";
import { CardPanel } from "./card-panel";
import { ChecksPanel } from "./checks-panel";
import { ColorPanel } from "./color-panel";
import { ExportFooter, ExportPanel } from "./export-panel";
import { MarkPanel } from "./mark-panel";
import { SitePanel } from "./site-panel";

interface Tab {
  id: StudioTab;
  label: string;
  panel: () => React.ReactNode;
  /** Actions pinned under the panel. */
  footer?: () => React.ReactNode;
}

/** What the design is made of, in the order it is usually filled in. */
const DESIGN: Tab[] = [
  { id: "mark", label: "Mark", panel: MarkPanel },
  { id: "color", label: "Colour", panel: ColorPanel },
  { id: "card", label: "Card", panel: CardPanel },
  { id: "site", label: "Site", panel: SitePanel },
];

/** What is done with it once it is made. */
const SHIP: Tab[] = [
  { id: "checks", label: "Checks", panel: ChecksPanel },
  {
    id: "export",
    label: "Export",
    panel: ExportPanel,
    footer: ExportFooter,
  },
];

const TABS = [...DESIGN, ...SHIP];

function TabButton({ tab, count }: { tab: Tab; count?: number }) {
  const active = useStudio((state) => state.tab === tab.id);
  const setTab = useStudio((state) => state.setTab);
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${tab.id}`}
      aria-selected={active}
      aria-controls="controls-panel"
      onClick={() => {
        setTab(tab.id);
        showPreview(tab.id);
      }}
      className={pillClass(active)}
    >
      {tab.label}
      {count ? (
        <span
          className={cn(
            "text-xs tabular-nums",
            active ? "text-fg-2" : "text-fg-3",
          )}
        >
          {count}
          <span className="sr-only"> to fix</span>
        </span>
      ) : null}
    </button>
  );
}

/**
 * Everything done to the design, a tab for each part of it: the four it is
 * made of, then the two that ship it. The Checks tab counts what is still to
 * fix, so it can be seen from any of the others.
 */
export function Controls() {
  const active = useStudio((state) => state.tab);
  const { open } = useChecks();
  const tab = TABS.find((tab) => tab.id === active) ?? TABS[0];

  return (
    <Dock id="controls" label="Controls">
      <DockTabs aria-label="Controls">
        {DESIGN.map((tab) => (
          <TabButton key={tab.id} tab={tab} />
        ))}
        <span className="min-w-2 flex-1" />
        {SHIP.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            count={tab.id === "checks" ? open : undefined}
          />
        ))}
      </DockTabs>
      {/* Keyed, so each tab opens scrolled to its top. */}
      <DockBody
        key={tab.id}
        id="controls-panel"
        aria-labelledby={`tab-${tab.id}`}
      >
        <tab.panel />
      </DockBody>
      {tab.footer && (
        <DockFooter>
          <tab.footer />
        </DockFooter>
      )}
    </Dock>
  );
}
