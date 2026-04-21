import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { colorPalettes } from "@/lib/color-palletes";
import { useFaviconStore } from "@/stores/favicon-store";
import { Tabs, TabsList, TabsTab } from "./ui/tabs";

export function ColorPickerPanel() {
  const selectedColorFamily = useFaviconStore(
    (state) => state.selectedColorFamily
  );
  const setSelectedColorFamily = useFaviconStore(
    (state) => state.setSelectedColorFamily
  );
  const backgroundType = useFaviconStore((state) => state.backgroundType);
  const setBackgroundType = useFaviconStore((state) => state.setBackgroundType);
  const setGradientColors = useFaviconStore((state) => state.setGradientColors);

  const colorFamilies = Object.keys(colorPalettes);

  const handleFamilySelect = (family: string) => {
    setSelectedColorFamily(family);
    if (backgroundType === "gradient") {
      const shades = colorPalettes[family as keyof typeof colorPalettes];
      setGradientColors([shades[5], shades[8]]);
    }
  };

  const handleTypeChange = (type: string) => {
    const newType = type as "solid" | "gradient";
    setBackgroundType(newType);
    if (newType === "gradient") {
      const shades =
        colorPalettes[selectedColorFamily as keyof typeof colorPalettes];
      setGradientColors([shades[5], shades[8]]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Palettes</span>
          <Tabs
            value={backgroundType}
            onValueChange={handleTypeChange}
            className="w-auto"
          >
            <TabsList className="h-7 p-0.5">
              <TabsTab value="solid" className="text-[10px] px-2 h-6">
                Solid
              </TabsTab>
              <TabsTab value="gradient" className="text-[10px] px-2 h-6">
                Gradient
              </TabsTab>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardPanel>
        <div className="grid grid-cols-3 gap-2">
          {colorFamilies.map((family) => (
            <Button
              key={family}
              onClick={() => handleFamilySelect(family)}
              variant={selectedColorFamily === family ? "default" : "outline"}
              size="sm"
              className="text-xs flex items-center justify-start gap-2 h-8 px-2"
            >
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{
                  background:
                    backgroundType === "gradient"
                      ? `linear-gradient(135deg, ${
                          colorPalettes[family as keyof typeof colorPalettes][5]
                        }, ${
                          colorPalettes[family as keyof typeof colorPalettes][8]
                        })`
                      : colorPalettes[family as keyof typeof colorPalettes][5],
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
