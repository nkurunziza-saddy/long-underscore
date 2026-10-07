"use client";

import { CopyIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { Panel } from "@/components/layout/panel";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import type { Target } from "@/lib/design";
import { describePackage } from "@/lib/package";
import { buildSnippet } from "@/lib/snippets";
import { useStudio } from "@/stores/studio-store";
import { studioActions } from "../actions";
import { useAssets } from "../assets-context";
import { Field, Group, readoutClass } from "./fields";

const TARGETS: { value: Target; label: string; title: string }[] = [
  { value: "html", label: "HTML", title: "Any site: Vite, Astro, plain HTML…" },
  { value: "next", label: "Next.js", title: "App Router file conventions" },
];

/** What gets exported, shown before it is exported. No surprises in the zip. */
export function ExportPanel() {
  const design = useStudio((state) => state.design);
  const commit = useStudio((state) => state.commit);
  const actions = studioActions(useAssets());
  const files = describePackage(design);

  return (
    <>
      <Group>
        <Field
          label="Made for"
          hint="Decides the file names and the snippet. The images are the same."
        >
          <Segmented
            fill
            aria-label="Export target"
            value={design.target}
            options={TARGETS}
            onValueChange={(target) => commit({ target })}
          />
        </Field>
      </Group>

      <Group
        title="Files"
        aside={<span className={readoutClass}>{files.length}, not sixty</span>}
      >
        <Panel>
          <ul className="flex flex-col divide-y divide-seam">
            {files.map((file) => (
              <li
                key={file.path}
                className="flex min-h-8 items-baseline justify-between gap-4 px-3 py-1.5"
              >
                <span className="shrink-0 font-mono text-xs">{file.path}</span>
                <span className="text-right text-xs text-pretty text-fg-3">
                  {file.role}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </Group>

      <Group
        title={
          design.target === "next" ? "For app/layout.tsx" : "For your <head>"
        }
        aside={
          <Button variant="ghost" size="xs" onClick={actions.copySnippet}>
            <CopyIcon />
            Copy
          </Button>
        }
      >
        <Panel>
          <pre className="max-h-64 overflow-auto p-3 font-mono text-2xs leading-relaxed text-fg-2">
            <code>{buildSnippet(design)}</code>
          </pre>
        </Panel>
      </Group>
    </>
  );
}

/** The export itself, in reach however far down the tab has been read. */
export function ExportFooter() {
  const actions = studioActions(useAssets());
  return (
    <>
      <Button size="sm" onClick={actions.downloadKit} className="flex-1">
        <DownloadSimpleIcon />
        Download kit
      </Button>
      <Button variant="secondary" size="sm" onClick={actions.copySvg}>
        <CopyIcon />
        Copy SVG
      </Button>
    </>
  );
}
