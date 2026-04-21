import { useEffect, useState } from "react";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFaviconStore } from "@/stores/favicon-store";

export interface MetadataFormData {
  appName: string;
  appShortName: string;
  description: string;
  author: string;
  keywords: string;
  themeColor: string;
  twitterHandle: string;
  ogType: string;
  siteUrl: string;
  siteLanguage: string;
}

export function MetadataForm() {
  const metadata = useFaviconStore((state) => state.metadata);
  const setMetadata = useFaviconStore((state) => state.setMetadata);

  const [localMetadata, setLocalMetadata] = useState(metadata);

  useEffect(() => {
    setLocalMetadata(metadata);
  }, [metadata]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(metadata) !== JSON.stringify(localMetadata)) {
        setMetadata(localMetadata);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localMetadata, setMetadata, metadata]);

  const updateField = (field: keyof MetadataFormData, value: string) => {
    setLocalMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata & SEO</CardTitle>
      </CardHeader>
      <CardPanel className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="appName"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              App Name
            </Label>
            <Input
              id="appName"
              value={localMetadata.appName}
              onChange={(e) => updateField("appName", e.target.value)}
              placeholder="Your App"
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="appShortName"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Short Name
            </Label>
            <Input
              id="appShortName"
              value={localMetadata.appShortName}
              onChange={(e) => updateField("appShortName", e.target.value)}
              placeholder="App"
              maxLength={12}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">Max 12 characters</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Description
          </Label>
          <Textarea
            id="description"
            value={localMetadata.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="A brief description of your app"
            rows={3}
            className="text-sm resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="author"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Author
          </Label>
          <Input
            id="author"
            value={localMetadata.author}
            onChange={(e) => updateField("author", e.target.value)}
            placeholder="Your Name or Company"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="keywords"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Keywords
          </Label>
          <Input
            id="keywords"
            value={localMetadata.keywords}
            onChange={(e) => updateField("keywords", e.target.value)}
            placeholder="app, icon, favicon"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="themeColor"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Theme Color
          </Label>
          <div className="flex items-center gap-2 bg-muted/50 p-2 border">
            <input
              type="color"
              id="themeColor"
              value={localMetadata.themeColor}
              onChange={(e) => updateField("themeColor", e.target.value)}
              className="w-9 h-9 border border-border cursor-pointer"
            />
            <span className="text-xs font-mono flex-1">
              {localMetadata.themeColor}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label
              htmlFor="twitterHandle"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Twitter Handle
            </Label>
            <Input
              id="twitterHandle"
              value={localMetadata.twitterHandle}
              onChange={(e) => updateField("twitterHandle", e.target.value)}
              placeholder="@username"
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="ogType"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              OG Type
            </Label>
            <Input
              id="ogType"
              value={localMetadata.ogType}
              onChange={(e) => updateField("ogType", e.target.value)}
              placeholder="website"
              className="text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="siteUrl"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Site URL
            </Label>
            <Input
              id="siteUrl"
              value={localMetadata.siteUrl}
              onChange={(e) => updateField("siteUrl", e.target.value)}
              placeholder="https://example.com"
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="siteLanguage"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Language
            </Label>
            <Input
              id="siteLanguage"
              value={localMetadata.siteLanguage}
              onChange={(e) => updateField("siteLanguage", e.target.value)}
              placeholder="en_US"
              className="text-sm"
            />
          </div>
        </div>
      </CardPanel>
    </Card>
  );
}
