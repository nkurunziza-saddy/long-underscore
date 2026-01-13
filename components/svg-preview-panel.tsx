"use client";

import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { useSvgImportStore } from "@/stores/svg-import-store";

export function SvgPreviewPanel() {
  const svgContent = useSvgImportStore((state) => state.svgContent);
  const isValid = useSvgImportStore((state) => state.isValid);

  if (!isValid || !svgContent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardPanel>
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Import an SVG to preview
          </div>
        </CardPanel>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardPanel className="space-y-4">
        <div className="flex items-center justify-center bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)] bg-size-[16px_16px] rounded-lg p-4">
          <div
            className="w-32 h-32 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>

        <div className="flex items-end justify-center gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center bg-muted rounded p-2 mb-1">
              <div
                className="w-16 h-16 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
            <span className="text-xs text-muted-foreground">64px</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center bg-muted rounded p-2 mb-1">
              <div
                className="w-8 h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
            <span className="text-xs text-muted-foreground">32px</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center bg-muted rounded p-2 mb-1">
              <div
                className="w-4 h-4 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
            <span className="text-xs text-muted-foreground">16px</span>
          </div>
        </div>
      </CardPanel>
    </Card>
  );
}
