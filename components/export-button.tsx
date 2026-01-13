"use client";

import JSZip from "jszip";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { drawFavicon } from "@/lib/draw-favicon";
import { generateSvg } from "@/lib/generate-svg";
import { svgToPngDataUrl } from "@/lib/svg-to-canvas";
import { useFaviconStore } from "@/stores/favicon-store";
import { useSvgImportStore } from "@/stores/svg-import-store";
import { toastManager } from "./ui/toast";

export function ExportButton() {
  const mode = useFaviconStore((state) => state.mode);
  const metadata = useFaviconStore((state) => state.metadata);
  const backgroundColor = useFaviconStore((state) => state.backgroundColor);
  const fontColor = useFaviconStore((state) => state.fontColor);
  const text = useFaviconStore((state) => state.text);
  const selectedFont = useFaviconStore((state) => state.selectedFont);
  const fontWeight = useFaviconStore((state) => state.fontWeight);
  const fontSize = useFaviconStore((state) => state.fontSize);
  const borderRadius = useFaviconStore((state) => state.borderRadius);
  const includePwa = useFaviconStore((state) => state.includePwa);

  const svgContent = useSvgImportStore((state) => state.svgContent);
  const isValidSvg = useSvgImportStore((state) => state.isValid);

  const allSizes = [16, 32, 48, 64, 128, 180, 192, 256, 512];
  const macOsSizes = [16, 32, 64, 128, 256, 512, 1024]; // For .iconset
  const formats = ["png", "ico"];

  const generateTextFaviconAtSize = async (
    size: number,
    format: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const canvas = document.createElement("canvas");

        drawFavicon(canvas, size, {
          text,
          fontColor,
          backgroundColor,
          selectedFont,
          fontWeight,
          fontSize,
          borderRadius,
        });

        const dataUrl = canvas.toDataURL(`image/${format}`);
        resolve(dataUrl);
      }, 0);
    });
  };

  const generateSvgFaviconAtSize = async (
    size: number,
    format: string
  ): Promise<string> => {
    if (format === "ico") {
      return svgToPngDataUrl(svgContent, size);
    }
    return svgToPngDataUrl(svgContent, size);
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

### macOS Icons (AppIcon.iconset/)
The \`AppIcon.iconset\` folder contains all required sizes for macOS app icons:
- icon_16x16.png, icon_16x16@2x.png
- icon_32x32.png, icon_32x32@2x.png
- icon_64x64.png, icon_64x64@2x.png
- icon_128x128.png, icon_128x128@2x.png
- icon_256x256.png, icon_256x256@2x.png
- icon_512x512.png, icon_512x512@2x.png
- icon_1024x1024.png

**To convert to .icns (macOS only):**
\`\`\`bash
iconutil -c icns AppIcon.iconset
\`\`\`

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
✅ macOS App Icons (.iconset ready)

## SEO Optimization

${
  metadata.keywords
    ? `Keywords included: ${metadata.keywords}\n`
    : "Add keywords in your HTML meta tags for better SEO.\n"
}

Generated with Underscore - Favicon Generator
`;
  };

  const exportFaviconPackage = async (): Promise<string> => {
    const zip = new JSZip();

    // Use different generation method based on mode
    const generateFaviconAtSize =
      mode === "svg" && isValidSvg
        ? generateSvgFaviconAtSize
        : generateTextFaviconAtSize;

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

    if (mode === "svg" && isValidSvg) {
      zip.file("favicon.svg", svgContent);
    } else {
      const generatedSvg = generateSvg({
        text,
        fontColor,
        backgroundColor,
        selectedFont,
        fontWeight,
        fontSize,
        borderRadius,
        size: 256,
      });
      zip.file("favicon.svg", generatedSvg);
    }

    const iconsetFolder = zip.folder("AppIcon.iconset");
    if (iconsetFolder) {
      for (const size of macOsSizes) {
        const dataUrl1x = await generateFaviconAtSize(size, "png");
        if (dataUrl1x) {
          const base64Data = dataUrl1x.split(",")[1];
          iconsetFolder.file(`icon_${size}x${size}.png`, base64Data, {
            base64: true,
          });
        }

        const retinaSize = size * 2;
        if (retinaSize <= 1024) {
          const dataUrl2x = await generateFaviconAtSize(retinaSize, "png");
          if (dataUrl2x) {
            const base64Data = dataUrl2x.split(",")[1];
            iconsetFolder.file(`icon_${size}x${size}@2x.png`, base64Data, {
              base64: true,
            });
          }
        }
      }
    }

    if (includePwa) {
      zip.file("manifest.json", generateManifest());
      zip.file("browserconfig.xml", generateBrowserConfig());
      zip.file("robots.txt", generateRobotsTxt());
      zip.file("favicon.html", generateHtmlCode());
      zip.file("README.md", generateReadme());
    }

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
    if (mode === "svg" && !isValidSvg) {
      toastManager.add({
        type: "error",
        title: "No valid SVG",
        description: "Please import a valid SVG file first",
      });
      return;
    }

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
    <div className="flex items-center gap-1">
      <Button onClick={handleExport} size="sm">
        <Download className="inline sm:hidden" />
        <span className="hidden sm:inline">Export</span>
      </Button>
    </div>
  );
}
