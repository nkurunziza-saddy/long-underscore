import { useCallback, useMemo } from "react";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FONT_WEIGHT_NAMES, FONTS } from "@/lib/fonts";
import { useFaviconStore } from "@/stores/favicon-store";

export function EditorControls() {
  const text = useFaviconStore((state) => state.text);
  const setText = useFaviconStore((state) => state.setText);
  const selectedFont = useFaviconStore((state) => state.selectedFont);
  const setSelectedFont = useFaviconStore((state) => state.setSelectedFont);
  const fontWeight = useFaviconStore((state) => state.fontWeight);
  const setFontWeight = useFaviconStore((state) => state.setFontWeight);
  const fontSize = useFaviconStore((state) => state.fontSize);
  const setFontSize = useFaviconStore((state) => state.setFontSize);
  const borderRadius = useFaviconStore((state) => state.borderRadius);
  const setBorderRadius = useFaviconStore((state) => state.setBorderRadius);

  const fontWeights = useMemo(() => {
    return FONTS.find((f) => f.value === selectedFont)?.weight || [];
  }, [selectedFont]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value.slice(0, 3));
    },
    [setText]
  );

  const handleFontChange = useCallback(
    (value: string) => {
      setSelectedFont(value);
    },
    [setSelectedFont]
  );

  const handleWeightChange = useCallback(
    (value: string) => {
      setFontWeight(Number(value));
    },
    [setFontWeight]
  );

  const handleFontSizeChange = useCallback(
    (value: number | readonly number[]) => {
      const val = Array.isArray(value) ? value[0] : value;
      setFontSize(val);
    },
    [setFontSize]
  );

  const handleBorderRadiusChange = useCallback(
    (value: number | readonly number[]) => {
      const val = Array.isArray(value) ? value[0] : value;
      setBorderRadius(val);
    },
    [setBorderRadius]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor</CardTitle>
      </CardHeader>
      <CardPanel className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="text"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Text
          </Label>
          <Input
            id="text"
            value={text}
            onChange={handleTextChange}
            placeholder="S"
            maxLength={3}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Max 3 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="font"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Font
          </Label>
          <Select
            value={selectedFont}
            onValueChange={handleFontChange}
            items={FONTS.map((font) => ({
              value: font.value,
              label: font.name,
            }))}
          >
            <SelectTrigger id="font">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {FONTS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.name}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="weight"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Weight
          </Label>
          <Select
            value={fontWeight.toString()}
            onValueChange={handleWeightChange}
            items={fontWeights.map((weight) => ({
              value: weight.toString(),
              label:
                FONT_WEIGHT_NAMES[weight as keyof typeof FONT_WEIGHT_NAMES] ||
                weight.toString(),
            }))}
          >
            <SelectTrigger id="weight">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {fontWeights.map((weight) => (
                <SelectItem key={weight} value={weight.toString()}>
                  {FONT_WEIGHT_NAMES[
                    weight as keyof typeof FONT_WEIGHT_NAMES
                  ] || weight}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Font Size
          </Label>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">20px</span>
            <span className="font-medium">{fontSize}px</span>
            <span className="text-muted-foreground">100px</span>
          </div>
          <Slider
            value={[fontSize]}
            onValueChange={handleFontSizeChange}
            min={20}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Border Radius
          </Label>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">0%</span>
            <span className="font-medium">{borderRadius}%</span>
            <span className="text-muted-foreground">50%</span>
          </div>
          <Slider
            value={[borderRadius]}
            onValueChange={handleBorderRadiusChange}
            min={0}
            max={50}
            step={1}
          />
        </div>
      </CardPanel>
    </Card>
  );
}
