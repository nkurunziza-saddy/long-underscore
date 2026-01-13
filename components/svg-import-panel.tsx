"use client";

import { AlertCircle, Check, FileCode, Upload, X } from "lucide-react";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSvgImportStore } from "@/stores/svg-import-store";

export function SvgImportPanel() {
  const svgContent = useSvgImportStore((state) => state.svgContent);
  const isValid = useSvgImportStore((state) => state.isValid);
  const fileName = useSvgImportStore((state) => state.fileName);
  const setSvgFromCode = useSvgImportStore((state) => state.setSvgFromCode);
  const setSvgFromFile = useSvgImportStore((state) => state.setSvgFromFile);
  const clearSvg = useSvgImportStore((state) => state.clearSvg);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSvgFromCode(e.target.value);
    },
    [setSvgFromCode]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === "image/svg+xml") {
        await setSvgFromFile(file);
      }
    },
    [setSvgFromFile]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === "image/svg+xml") {
        await setSvgFromFile(file);
      }
    },
    [setSvgFromFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
    },
    []
  );

  const handleClear = useCallback(() => {
    clearSvg();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [clearSvg]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>SVG Import</span>
          {svgContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardPanel className="space-y-4">
        <button
          type="button"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleBrowseClick}
          className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drop SVG file here or click to browse
          </p>
          {fileName && (
            <p className="text-xs text-primary mt-2 flex items-center justify-center gap-1">
              <FileCode className="h-3 w-3" />
              {fileName}
            </p>
          )}
        </button>

        <div className="space-y-2">
          <Label
            htmlFor="svg-code"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Or paste SVG code
          </Label>
          <textarea
            id="svg-code"
            value={svgContent}
            onChange={handleTextChange}
            placeholder="<svg>...</svg>"
            className="w-full h-32 px-3 py-2 text-xs font-mono bg-muted/50 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {svgContent && (
          <div
            className={`flex items-center gap-2 text-xs ${
              isValid ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {isValid ? (
              <>
                <Check className="h-3 w-3" />
                Valid SVG
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Invalid SVG markup
              </>
            )}
          </div>
        )}
      </CardPanel>
    </Card>
  );
}
