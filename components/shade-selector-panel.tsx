import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getContrastColor } from "@/lib/contrast";
import { cn } from "@/lib/utils";
import { useFaviconStore } from "@/stores/favicon-store";

interface ShadeSelectorPanelProps {
  type: "text" | "background";
  shades: string[];
}

export function ShadeSelectorPanel({ type, shades }: ShadeSelectorPanelProps) {
  const mode = useFaviconStore((state) => state.mode);
  const settings = useFaviconStore((state) => state.settings[mode]);

  const { fontColor, backgroundColor, transparentBackground } = settings;

  const setFontColor = useFaviconStore((state) => state.setFontColor);
  const setBackgroundColor = useFaviconStore(
    (state) => state.setBackgroundColor,
  );
  const setTransparentBackground = useFaviconStore(
    (state) => state.setTransparentBackground,
  );

  const isTextMode = type === "text";
  const color = isTextMode ? fontColor : backgroundColor;
  const setColor = isTextMode ? setFontColor : setBackgroundColor;

  const handleAutoContrast = () => {
    if (isTextMode) {
      if (transparentBackground) {
        setFontColor("#000000");
      } else {
        // Pass either the color string or array if we somehow have one (fallback)
        setFontColor(getContrastColor(backgroundColor as any));
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {isTextMode ? "Text Color" : "Background Color"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isTextMode && (mode === "text" || mode === "icon") && (
              <div className="flex items-center gap-2 mr-2 border-r pr-4">
                <Checkbox
                  id="transparent-bg"
                  checked={transparentBackground}
                  onCheckedChange={(checked) =>
                    setTransparentBackground(!!checked)
                  }
                />
                <Label htmlFor="transparent-bg" className="text-xs">
                  Transparent
                </Label>
              </div>
            )}
            {isTextMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAutoContrast}
                title="Auto contrast fix"
                className="h-8 px-2 text-xs"
              >
                <Wand2 className="h-3.5 w-3.5 mr-1" />
                Auto Fix
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardPanel
        className={cn("space-y-4 transition-opacity", {
          "opacity-50 pointer-events-none":
            !isTextMode && transparentBackground,
        })}
      >
        <div className="grid grid-cols-5 gap-2">
          {shades.map((shade, index) => (
            <button
              type="button"
              key={shade}
              onClick={() => setColor(shade)}
              className={cn("w-full h-10 p-0 border", {
                "outline-ring outline-offset-2 outline-2": color === shade,
              })}
              style={{
                backgroundColor: shade,
              }}
              aria-label={`Shade ${index + 1}`}
            />
          ))}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`custom-${type}`}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Custom Color / CSS Gradient
          </Label>
          <div className="flex items-center gap-2 bg-muted/50 p-2 border">
            <input
              type="color"
              className="w-9 h-9 border border-border cursor-pointer shrink-0"
              value={color.startsWith("#") ? color : "#000000"}
              onChange={(e) => setColor(e.target.value)}
            />
            <Input
              id={`custom-${type}`}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#hex or linear-gradient(...)"
              className="text-xs font-mono h-9"
            />
          </div>
        </div>
      </CardPanel>
    </Card>
  );
}
