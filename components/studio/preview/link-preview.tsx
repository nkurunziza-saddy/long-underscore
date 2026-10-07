"use client";

import { Panel, PanelBlock } from "@/components/layout/panel";
import { Section } from "@/components/layout/section";
import { cardTagline, cardTitle, siteHost } from "@/lib/design";
import { useDesign } from "@/stores/studio-store";
import { CardCanvas } from "../mark-canvas";
import { PREVIEW } from "./sections";

/** The social card, unfurled the way a chat or a feed shows a link. */
export function LinkPreviewSection({ className }: { className?: string }) {
  const design = useDesign();
  const host = siteHost(design) || "your-site.com";
  const tagline = cardTagline(design);

  return (
    <Section
      id={PREVIEW.card}
      title="Link preview"
      note="1200 × 630"
      className={className}
    >
      <Panel className="flex-1">
        <PanelBlock className="flex flex-1 items-center p-4">
          <div className="edge-card mx-auto w-full max-w-160 overflow-hidden rounded-xl bg-page">
            <CardCanvas />
            <div className="flex flex-col gap-0.5 px-3 py-2.5">
              <p className="truncate text-xs text-fg-3">{host}</p>
              <p className="truncate text-sm font-medium">
                {cardTitle(design)}
              </p>
              {tagline && (
                <p className="truncate text-sm text-fg-2">{tagline}</p>
              )}
            </div>
          </div>
        </PanelBlock>
      </Panel>
    </Section>
  );
}
