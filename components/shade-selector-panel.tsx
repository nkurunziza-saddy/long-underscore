import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFaviconStore } from "@/stores/favicon-store";

interface ShadeSelectorPanelProps {
  type: "text" | "background";
  shades: string[];
}

export function ShadeSelectorPanel({ type, shades }: ShadeSelectorPanelProps) {
  const fontColor = useFaviconStore((state) => state.fontColor);
  const setFontColor = useFaviconStore((state) => state.setFontColor);
  const backgroundColor = useFaviconStore((state) => state.backgroundColor);
  const setBackgroundColor = useFaviconStore(
    (state) => state.setBackgroundColor
  );

  const isTextMode = type === "text";
  const color = isTextMode ? fontColor : backgroundColor;
  const setColor = isTextMode ? setFontColor : setBackgroundColor;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isTextMode ? "Text Color" : "Background Color"}</CardTitle>
      </CardHeader>
      <CardPanel className="space-y-4">
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
            Custom Color
          </Label>
          <div className="flex items-center gap-2 bg-muted/50 p-2 border">
            <input
              type="color"
              id={`custom-${type}`}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-9 h-9 border border-border cursor-pointer"
            />
            <span className="text-xs font-mono flex-1">{color}</span>
          </div>
        </div>
      </CardPanel>
    </Card>
  );
}
