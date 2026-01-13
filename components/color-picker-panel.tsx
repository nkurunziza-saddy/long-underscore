import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { colorPalettes } from "@/lib/color-palletes";
import { useFaviconStore } from "@/stores/favicon-store";

export function ColorPickerPanel() {
  const selectedColorFamily = useFaviconStore(
    (state) => state.selectedColorFamily,
  );
  const setSelectedColorFamily = useFaviconStore(
    (state) => state.setSelectedColorFamily,
  );

  const colorFamilies = Object.keys(colorPalettes);

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
              onClick={() => setSelectedColorFamily(family)}
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
