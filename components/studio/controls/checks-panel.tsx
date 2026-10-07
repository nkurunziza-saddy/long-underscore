"use client";

import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Panel, PanelBlock } from "@/components/layout/panel";
import { Button } from "@/components/ui/button";
import type { Check, CheckLevel } from "@/lib/audit";
import { cn } from "@/lib/utils";
import { useStudio } from "@/stores/studio-store";
import { showPreview } from "../preview/sections";
import { useChecks } from "../use-checks";
import { Group, hintClass, readoutClass } from "./fields";

/** The mark of each level. Colour never says it alone: the title does. */
const LEVEL: Record<
  CheckLevel,
  { icon: typeof CheckCircleIcon; className: string }
> = {
  pass: { icon: CheckCircleIcon, className: "text-success" },
  note: { icon: InfoIcon, className: "text-fg-3" },
  warn: { icon: WarningIcon, className: "text-warn" },
  fail: { icon: XCircleIcon, className: "text-destructive" },
};

/** One check: what was found, why it matters, and the remedy if there is one. */
function CheckRow({ check }: { check: Check }) {
  const commit = useStudio((state) => state.commit);
  const setTab = useStudio((state) => state.setTab);
  const { icon: Icon, className } = LEVEL[check.level];
  const passed = check.level === "pass";

  return (
    <PanelBlock className="flex items-start gap-2.5">
      <Icon
        aria-hidden
        weight="fill"
        className={cn("h-lh w-3.5 shrink-0", className)}
      />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <p className={cn(passed ? "text-fg-2" : "font-medium")}>
          {check.title}
        </p>
        <p className="text-xs text-pretty text-fg-3">{check.detail}</p>
        {check.fix && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-1.5"
            onClick={() => check.fix && commit(check.fix.patch)}
          >
            {check.fix.label}
          </Button>
        )}
        {!check.fix && check.goto && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-1.5"
            onClick={() => {
              if (!check.goto) return;
              setTab(check.goto);
              showPreview(check.goto);
            }}
          >
            {check.goto === "site" ? "Open Site" : "Open Card"}
          </Button>
        )}
      </div>
    </PanelBlock>
  );
}

/**
 * The studio's opinion of the current mark: what to look at first, each with
 * its remedy a press away, then what already holds.
 */
export function ChecksPanel() {
  const { checks, passed, total } = useChecks();
  const pending = checks.filter((check) => check.level !== "pass");
  const passing = checks.filter((check) => check.level === "pass");

  return (
    <>
      <Group
        title={pending.length === 0 ? "Ready to ship" : "To look at"}
        aside={
          <span className={readoutClass}>
            {passed} of {total} pass
          </span>
        }
      >
        {pending.length === 0 ? (
          <p className={hintClass}>
            Every check passes. The kit is under Export.
          </p>
        ) : (
          <Panel>
            {pending.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </Panel>
        )}
      </Group>

      {passing.length > 0 && (
        <Group title="Passing">
          <Panel>
            {passing.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </Panel>
        </Group>
      )}
    </>
  );
}
