import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { premiumColorPalettes } from "@/lib/color-palletes";

interface ColorPickerPanelProps {
  selectedColorFamily: keyof typeof premiumColorPalettes;
  onColorFamilyChange: (family: keyof typeof premiumColorPalettes) => void;
}

export function ColorPickerPanel({
  selectedColorFamily,
  onColorFamilyChange,
}: ColorPickerPanelProps) {
  const colorFamilies = Object.keys(premiumColorPalettes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Palettes</CardTitle>
      </CardHeader>
      <CardPanel>
        <div className="grid grid-cols-3 gap-2">
          {colorFamilies.map((family) => (
            <Button
              key={family}
              onClick={() =>
                onColorFamilyChange(family as keyof typeof premiumColorPalettes)
              }
              variant={selectedColorFamily === family ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {family.charAt(0).toUpperCase() + family.slice(1)}
            </Button>
          ))}
        </div>
      </CardPanel>
    </Card>
  );
}
