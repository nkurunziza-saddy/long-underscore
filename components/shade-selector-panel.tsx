import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";

interface ShadeSelectorPanelProps {
  fontColor: string;
  onFontColorChange: (color: string) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  type: "text" | "background";
  backgroundShades: string[];
}

export function ShadeSelectorPanel({
  fontColor,
  onFontColorChange,
  backgroundColor,
  onBackgroundColorChange,
  type,
  backgroundShades,
}: ShadeSelectorPanelProps) {
  const selectedColor = type === "text" ? fontColor : backgroundColor;
  const onColorChange =
    type === "text" ? onFontColorChange : onBackgroundColorChange;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === "text" ? "Text Color" : "Background Color"}
        </CardTitle>
      </CardHeader>
      <CardPanel className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {backgroundShades.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onColorChange(color)}
              className={`w-full h-9 border transition-all ${
                selectedColor === color
                  ? "border-foreground ring-1 ring-foreground"
                  : "border-border hover:border-foreground/50"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-2 border">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-9 h-9 border border-border cursor-pointer"
          />
          <span className="text-xs font-mono flex-1">{selectedColor}</span>
        </div>
      </CardPanel>
    </Card>
  );
}
