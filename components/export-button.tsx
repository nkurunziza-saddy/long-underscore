"use client";

import JSZip from "jszip";
import { Download } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import type { MetadataFormData } from "./metadata-form";
import { toastManager } from "./ui/toast";

interface ExportButtonProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  metadata: MetadataFormData;
  backgroundColor: string;
  fontColor: string;
  text?: string;
}

export function ExportButton({
  canvasRef,
  metadata,
  backgroundColor,
  fontColor,
  text = "S",
}: ExportButtonProps) {
  const allSizes = [16, 32, 48, 64, 128, 180, 192, 256, 512];
  const formats = ["png", "ico"];

  const generateFaviconAtSize = async (
    size: number,
    format: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      if (!canvasRef.current) {
        resolve("");
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }

      canvas.width = size;
      canvas.height = size;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        const dataUrl = canvas.toDataURL(`image/${format}`);
        resolve(dataUrl);
      };
      img.onerror = () => resolve("");
      img.src = canvasRef.current.toDataURL("image/png");
    });
  };

  const generateManifest = () => {
    const manifest = {
      name: metadata.appName,
      short_name: metadata.appShortName,
      description: metadata.description,
      start_url: "/",
      display: "standalone",
      background_color: backgroundColor,
      theme_color: metadata.themeColor,
      orientation: "portrait-primary",
      icons: [
        {
          src: "/favicon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/favicon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
      categories: ["productivity", "utilities"],
      lang: "en",
      dir: "ltr",
    };
    return JSON.stringify(manifest, null, 2);
  };

  const generateHtmlCode = () => {
    const lines = [
      "<!-- Favicon and App Icons -->",
      '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
      '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
      '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
      '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">',
      "",
      "<!-- Apple Touch Icon -->",
      '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
      "",
      "<!-- PWA Manifest -->",
      '<link rel="manifest" href="/manifest.json">',
      "",
      "<!-- Theme Colors -->",
      `<meta name="theme-color" content="${metadata.themeColor}">`,
      `<meta name="msapplication-TileColor" content="${backgroundColor}">`,
      '<meta name="msapplication-config" content="/browserconfig.xml">',
      "",
      "<!-- SEO Meta Tags -->",
      `<meta name="description" content="${metadata.description}">`,
      metadata.author
        ? `<meta name="author" content="${metadata.author}">`
        : "",
      metadata.keywords
        ? `<meta name="keywords" content="${metadata.keywords}">`
        : "",
    ];
    return lines.filter(Boolean).join("\n");
  };

  const generateBrowserConfig = () => {
    return `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/favicon-256x256.png"/>
            <TileColor>${backgroundColor}</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;
  };

  const generateRobotsTxt = () => {
    return `User-agent: *
Allow: /

Sitemap: https://yourwebsite.com/sitemap.xml`;
  };

  const generateReadme = () => {
    return `# ${metadata.appName} - Favicon Package

Generated on: ${new Date().toLocaleDateString()}

## Files Included

### Favicon Files
- favicon.ico (multi-size ICO file)
- favicon-16x16.png (Browser tab)
- favicon-32x32.png (Taskbar)
- favicon-48x48.png (Desktop shortcut)
- favicon-64x64.png (High DPI displays)
- favicon-128x128.png (App icon)
- favicon-192x192.png (PWA icon)
- favicon-256x256.png (High resolution)
- favicon-512x512.png (Retina displays)
- apple-touch-icon.png (iOS home screen)

### Configuration Files
- manifest.json (PWA manifest for app installation)
- browserconfig.xml (Microsoft tile configuration)
- robots.txt (SEO crawler instructions)
- favicon.html (Ready-to-use HTML code)
- README.md (This file)

## Installation Instructions

1. **Upload Files**: Copy all files to your website's root directory
2. **Add HTML Code**: Include the HTML code from favicon.html in your <head> section
3. **Update robots.txt**: Modify the sitemap URL in robots.txt to match your domain
4. **Test**: Verify favicons appear correctly across different browsers and devices

## PWA Configuration

Your manifest.json is configured with:
- App Name: ${metadata.appName}
- Short Name: ${metadata.appShortName}
- Description: ${metadata.description}
- Theme Color: ${metadata.themeColor}
- Background Color: ${backgroundColor}
${metadata.author ? `- Author: ${metadata.author}` : ""}

## Browser Support

✅ Chrome, Firefox, Safari, Edge
✅ iOS Safari, Android Chrome
✅ Progressive Web App (PWA) support
✅ Microsoft Tiles

## SEO Optimization

${
  metadata.keywords
    ? `Keywords included: ${metadata.keywords}\n`
    : "Add keywords in your HTML meta tags for better SEO.\n"
}

Generated with ICo - Favicon Generator
`;
  };

  const exportFaviconPackage = async (): Promise<string> => {
    const zip = new JSZip();

    for (const size of allSizes) {
      for (const format of formats) {
        const dataUrl = await generateFaviconAtSize(size, format);
        if (dataUrl) {
          const base64Data = dataUrl.split(",")[1];
          const filename =
            size === 180
              ? `apple-touch-icon.${format}`
              : format === "ico" && size === 32
              ? "favicon.ico"
              : `favicon-${size}x${size}.${format}`;
          zip.file(filename, base64Data, { base64: true });
        }
      }
    }

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="${backgroundColor}" rx="20"/>
  <text x="128" y="165" font-family="Arial, sans-serif" font-size="120" font-weight="700" fill="${fontColor}" text-anchor="middle">${text
      .toUpperCase()
      .slice(0, 2)}</text>
</svg>`;
    zip.file("favicon.svg", svgContent);

    zip.file("manifest.json", generateManifest());
    zip.file("browserconfig.xml", generateBrowserConfig());
    zip.file("robots.txt", generateRobotsTxt());
    zip.file("favicon.html", generateHtmlCode());
    zip.file("README.md", generateReadme());

    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${metadata.appShortName
      .toLowerCase()
      .replace(/\s+/g, "-")}-favicon-package.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return `Complete favicon package with ${
      allSizes.length * formats.length + 1
    } files`;
  };

  const handleExport = () => {
    toastManager.promise(exportFaviconPackage(), {
      loading: {
        title: "Generating package...",
        description: "Creating all favicon sizes and formats",
      },
      success: (data: string) => ({
        title: "Export complete!",
        description: data,
      }),
      error: () => ({
        title: "Export failed",
        description: "There was an error generating the favicon package",
      }),
    });
  };

  return (
    <Button onClick={handleExport} size="sm" className="gap-1.5">
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Export</span>
    </Button>
  );
}
