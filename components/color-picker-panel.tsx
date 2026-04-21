import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { colorPalettes } from "@/lib/color-palletes";
import { useFaviconStore } from "@/stores/favicon-store";

export function ColorPickerPanel() {
  const mode = useFaviconStore((state) => state.mode);
  const settings = useFaviconStore((state) => state.settings[mode]);
  const { selectedColorFamily } = settings;

  const setSelectedColorFamily = useFaviconStore(
    (state) => state.setSelectedColorFamily,
  );

  const colorFamilies = Object.keys(colorPalettes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Palettes</CardTitle>
      </CardHeader>
      <CardPanel>
        <div className="grid grid-cols-3 gap-2">
          {colorFamilies.map((family) => (
            <Button
              key={family}
              onClick={() => setSelectedColorFamily(family)}
              variant={selectedColorFamily === family ? "default" : "outline"}
              size="sm"
              className="text-xs flex items-center justify-start gap-2 h-8 px-2"
            >
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    colorPalettes[family as keyof typeof colorPalettes][5],
                }}
              />
              <span className="truncate">
                {family.charAt(0).toUpperCase() +
                  family.slice(1).replace(/_/g, " ")}
              </span>
            </Button>
          ))}
        </div>
      </CardPanel>
    </Card>
  );
}
