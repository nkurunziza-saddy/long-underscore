"use client";

import {
  Columns,
  FileCode,
  Highlighter,
  Layout,
  Minimize2,
  Monitor,
  Smile,
  Type,
} from "lucide-react";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { type OgLayout, useFaviconStore } from "@/stores/favicon-store";

export function OgGeneratorPanel() {
  const ogTitle = useFaviconStore((state) => state.ogTitle);
  const setOgTitle = useFaviconStore((state) => state.setOgTitle);
  const ogDescription = useFaviconStore((state) => state.ogDescription);
  const setOgDescription = useFaviconStore((state) => state.setOgDescription);

  const mode = useFaviconStore((state) => state.mode);
  const settings = useFaviconStore((state) => state.settings[mode]);
  const updateSettings = useFaviconStore((state) => state.updateSettings);

  const { ogLayout, logoMode, logoSize, showGlassCard, meshOpacity } = settings;

  const handleLogoSizeChange = (val: number | readonly number[]) => {
    const nextVal = Array.isArray(val) ? val[0] : val;
    updateSettings({ logoSize: nextVal });
  };

  const handleMeshOpacityChange = (val: number | readonly number[]) => {
    const nextVal = Array.isArray(val) ? val[0] : val;
    updateSettings({ meshOpacity: nextVal / 100 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Design Studio</CardTitle>
      </CardHeader>
      <CardPanel className="space-y-6">
        {/* Layout Selector */}
        <div className="space-y-3">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Layout Composition
          </Label>
          <Tabs
            value={ogLayout}
            onValueChange={(val) =>
              updateSettings({ ogLayout: val as OgLayout })
            }
          >
            <TabsList className="grid grid-cols-5">
              <TabsTab value="studio" title="Studio Glass">
                <Layout className="h-4 w-4" />
              </TabsTab>
              <TabsTab value="browser" title="Browser Mockup">
                <Monitor className="h-4 w-4" />
              </TabsTab>
              <TabsTab value="hero" title="Impact Hero">
                <Highlighter className="h-4 w-4" />
              </TabsTab>
              <TabsTab value="split" title="Modern Split">
                <Columns className="h-4 w-4" />
              </TabsTab>
              <TabsTab value="minimal" title="Ultra Minimal">
                <Minimize2 className="h-4 w-4" />
              </TabsTab>
            </TabsList>
          </Tabs>
        </div>

        {/* Effects Section */}
        <div className="space-y-4 pt-2 border-t">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Visual Effects
          </Label>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="glass-card"
                checked={showGlassCard}
                onCheckedChange={(checked) =>
                  updateSettings({ showGlassCard: !!checked })
                }
              />
              <Label htmlFor="glass-card" className="text-sm font-normal">
                Glassmorphism Card
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Mesh Glow Intensity
              </Label>
              <span className="text-[10px] font-mono">
                {Math.round((meshOpacity || 0) * 100)}%
              </span>
            </div>
            <Slider
              value={[(meshOpacity || 0) * 100]}
              onValueChange={handleMeshOpacityChange}
              min={0}
              max={100}
              step={5}
            />
          </div>
        </div>

        {/* Branding Source */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Branding
          </Label>
          <Tabs
            value={logoMode}
            onValueChange={(val) => updateSettings({ logoMode: val as any })}
          >
            <TabsList className="grid grid-cols-3">
              <TabsTab value="text" className="gap-2">
                <Type className="h-3.5 w-3.5" />
                <span className="text-[10px]">Text</span>
              </TabsTab>
              <TabsTab value="icon" className="gap-2">
                <Smile className="h-3.5 w-3.5" />
                <span className="text-[10px]">Icon</span>
              </TabsTab>
              <TabsTab value="svg" className="gap-2">
                <FileCode className="h-3.5 w-3.5" />
                <span className="text-[10px]">SVG</span>
              </TabsTab>
            </TabsList>
          </Tabs>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-muted-foreground">
                Logo Scale
              </Label>
              <span className="text-xs font-mono">{logoSize}px</span>
            </div>
            <Slider
              value={[logoSize || 60]}
              onValueChange={handleLogoSizeChange}
              min={20}
              max={250}
              step={1}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3 pt-2 border-t">
          <div className="space-y-2">
            <Label
              htmlFor="og-title"
              className="text-xs font-medium uppercase text-muted-foreground"
            >
              Headline
            </Label>
            <Input
              id="og-title"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder="Main headline"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="og-description"
              className="text-xs font-medium uppercase text-muted-foreground"
            >
              Tagline
            </Label>
            <Textarea
              id="og-description"
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder="A brief summary..."
              className="h-20 resize-none"
            />
          </div>
        </div>
      </CardPanel>
    </Card>
  );
}
