"use client";

import { Search, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFaviconStore } from "@/stores/favicon-store";
import { cn } from "@/lib/utils";

// Fallback icons in case fetch fails
const FALLBACK_ICONS: Record<string, string> = {
  Zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  Heart: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 000-7.78z",
  Star: "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};

export function IconSelectorPanel() {
  const [search, setSearch] = useState("");
  const [icons, setIcons] = useState<Record<string, any>>(FALLBACK_ICONS);
  const [loading, setLoading] = useState(true);
  const selectedIcon = useFaviconStore((state) => state.iconName);
  const setIconName = useFaviconStore((state) => state.setIconName);
  const setIconNodes = useFaviconStore((state) => state.setIconNodes);

  useEffect(() => {
    async function loadIcons() {
      try {
        const response = await fetch("https://unpkg.com/lucide-static@latest/icon-nodes.json");
        if (!response.ok) throw new Error("Failed to fetch icons");
        const data = await response.json();
        
        setIcons(data);
        
        // Update initial icon nodes if needed
        const currentIconKey = selectedIcon.toLowerCase();
        if (data[currentIconKey]) {
          setIconNodes(data[currentIconKey]);
        }
      } catch (error) {
        console.error("Error loading Lucide icons:", error);
        setIcons(FALLBACK_ICONS);
      } finally {
        setLoading(false);
      }
    }
    loadIcons();
  }, [setIconNodes, selectedIcon]);

  const handleIconSelect = (name: string) => {
    setIconName(name);
    setIconNodes(icons[name]);
  };

  const filteredIconNames = useMemo(() => {
    const names = Object.keys(icons);
    if (!search) return names.slice(0, 100); // Show top 100 initially
    return names
      .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 100);
  }, [icons, search]);

  const renderIcon = (name: string) => {
    const nodes = icons[name];
    if (typeof nodes === "string") {
      return <path d={nodes} />;
    }
    
    // Lucide nodes format: [["path", {"d": "..."}], ...]
    return nodes.map((node: any, i: number) => {
      const [tag, attrs] = node;
      const Tag = tag as any;
      return <Tag key={i} {...attrs} />;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Icons</span>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardPanel className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search 1000+ icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="grid grid-cols-5 gap-2 max-h-[240px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-muted">
          {filteredIconNames.map((name) => (
            <Button
              key={name}
              variant={selectedIcon === name ? "default" : "outline"}
              size="sm"
              onClick={() => handleIconSelect(name)}
              className={cn("h-10 w-full p-0 flex items-center justify-center transition-all", {
                "ring-2 ring-primary ring-offset-1": selectedIcon === name,
              })}
              title={name}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                {renderIcon(name)}
              </svg>
            </Button>
          ))}
          {filteredIconNames.length === 0 && !loading && (
            <div className="col-span-5 py-8 text-center text-xs text-muted-foreground">
              No icons found for "{search}"
            </div>
          )}
        </div>
      </CardPanel>
    </Card>
  );
}
