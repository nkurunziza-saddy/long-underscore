import { Card, CardPanel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fontWeightNames, premiumFonts } from "@/lib/fonts";

interface EditorControlsProps {
  text: string;
  onTextChange: (text: string) => void;
  selectedFont: string;
  onFontChange: (font: string) => void;
  fontWeight: number;
  onFontWeightChange: (weight: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  borderRadius: number;
  onBorderRadiusChange: (radius: number) => void;
}

export function EditorControls({
  text,
  onTextChange,
  selectedFont,
  onFontChange,
  fontWeight,
  onFontWeightChange,
  fontSize,
  onFontSizeChange,
  borderRadius,
  onBorderRadiusChange,
}: EditorControlsProps) {
  return (
    <Card>
      <CardPanel className="space-y-5">
        <div>
          <Label
            htmlFor="text"
            className="text-xs font-medium uppercase tracking-wide mb-2 block text-muted-foreground"
          >
            Text
          </Label>
          <Input
            id="text"
            value={text}
            onChange={(e) => onTextChange(e.target.value.slice(0, 3))}
            placeholder="AF"
            maxLength={3}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Max 3 characters
          </p>
        </div>

        <div>
          <Label className="text-xs font-medium uppercase tracking-wide mb-2 block text-muted-foreground">
            Font
          </Label>
          <Select value={selectedFont} onValueChange={onFontChange}>
            <SelectTrigger className="w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {premiumFonts.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.name}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium uppercase tracking-wide mb-2 block text-muted-foreground">
            Weight
          </Label>
          <Select
            value={fontWeight.toString()}
            onValueChange={(v) => onFontWeightChange(Number(v))}
          >
            <SelectTrigger className="w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {[300, 400, 500, 600, 700].map((weight) => (
                <SelectItem key={weight} value={weight.toString()}>
                  {fontWeightNames[weight as keyof typeof fontWeightNames] ||
                    weight}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>

        <div>
          <Label
            htmlFor="fontSize"
            className="text-xs font-medium uppercase tracking-wide mb-2 block text-muted-foreground"
          >
            Size:{" "}
            <span className="font-mono text-foreground">{fontSize}px</span>
          </Label>
          <input
            id="fontSize"
            type="range"
            min="20"
            max="100"
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer"
          />
        </div>

        <div>
          <Label
            htmlFor="borderRadius"
            className="text-xs font-medium uppercase tracking-wide mb-2 block text-muted-foreground"
          >
            Radius:{" "}
            <span className="font-mono text-foreground">{borderRadius}%</span>
          </Label>
          <input
            id="borderRadius"
            type="range"
            min="0"
            max="100"
            value={borderRadius}
            onChange={(e) => onBorderRadiusChange(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer"
          />
        </div>
      </CardPanel>
    </Card>
  );
}
