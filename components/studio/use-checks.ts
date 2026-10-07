import { audit, type CheckLevel, summarize } from "@/lib/audit";
import { useDesign } from "@/stores/studio-store";
import { useAssets } from "./assets-context";

const ORDER: CheckLevel[] = ["fail", "warn", "note", "pass"];

/**
 * The studio's opinion of the current mark, worst first, and how it adds up:
 * `open` is how many graded checks are still to fix.
 */
export function useChecks() {
  const design = useDesign();
  const { svg } = useAssets();
  const checks = audit(design, svg).sort(
    (a, b) => ORDER.indexOf(a.level) - ORDER.indexOf(b.level),
  );
  const summary = summarize(checks);
  return { checks, ...summary, open: summary.total - summary.passed };
}
