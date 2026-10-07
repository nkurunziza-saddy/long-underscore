"use client";

import { Panel, PanelBlock } from "@/components/layout/panel";
import { Section } from "@/components/layout/section";
import { shortName } from "@/lib/design";
import { useDesign } from "@/stores/studio-store";
import { MarkCanvas } from "../mark-canvas";
import { captionClass } from "./caption";

const SYSTEMS = [
  // The mask iOS cuts every icon to.
  { name: "iOS", variant: "apple", mask: "rounded-[22.5%]" },
  { name: "Android", variant: "maskable", mask: "rounded-full" },
] as const;

/** The installed icon, cut to the shape each system gives it. */
export function HomeScreenSection({ className }: { className?: string }) {
  const design = useDesign();
  const label = shortName(design);

  return (
    <Section title="Home screen" note="Masked by the OS" className={className}>
      <Panel className="flex-1">
        {/* Beside the link preview the card is tall, so the two stack. */}
        <PanelBlock className="flex flex-1 items-center justify-center gap-8 p-6 @xl:flex-col">
          {SYSTEMS.map((system) => (
            <figure
              key={system.name}
              className="flex w-18 flex-col items-center gap-1.5"
            >
              <MarkCanvas
                size={60}
                variant={system.variant}
                label={`${system.name} home screen icon`}
                className={system.mask}
              />
              <figcaption className="w-full truncate text-center text-2xs">
                {label}
              </figcaption>
              <span className={captionClass}>{system.name}</span>
            </figure>
          ))}
        </PanelBlock>
      </Panel>
    </Section>
  );
}
