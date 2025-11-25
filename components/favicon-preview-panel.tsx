import type { RefObject } from "react";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";

interface FaviconPreviewPanelProps {
  previewLargeRef: RefObject<HTMLCanvasElement | null>;
}

export function FaviconPreviewPanel({
  previewLargeRef,
}: FaviconPreviewPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardPanel>
        <div className="flex items-center justify-center bg-muted/50 border p-4 min-h-[160px]">
          <canvas
            ref={previewLargeRef}
            className="w-32 h-32"
            style={{ imageRendering: "auto" }}
          />
        </div>
      </CardPanel>
    </Card>
  );
}
