import {
  cardTagline,
  cardTitle,
  type Design,
  matteFor,
  resolveColors,
  shortName,
  siteName,
  siteOrigin,
  themeColor,
} from "./design";
import { escapeXml } from "./mark-svg";

/** Where each asset lands, per target. Next.js gets its file conventions. */
export function assetPaths(design: Design) {
  const next = design.target === "next";
  return {
    ico: next ? "app/favicon.ico" : "favicon.ico",
    svg: next ? "app/icon.svg" : "icon.svg",
    apple: next ? "app/apple-icon.png" : "apple-touch-icon.png",
    card: next ? "app/opengraph-image.png" : "og.png",
    cardAlt: next ? "app/opengraph-image.alt.txt" : null,
    manifest: next ? "app/manifest.webmanifest" : "manifest.webmanifest",
    icon192: next ? "public/icon-192.png" : "icon-192.png",
    icon512: next ? "public/icon-512.png" : "icon-512.png",
    maskable: next ? "public/icon-maskable.png" : "icon-maskable.png",
    snippet: next ? "layout.metadata.ts" : "head.html",
    readme: "README.md",
  };
}

export function buildManifest(design: Design): string {
  return `${JSON.stringify(
    {
      name: siteName(design),
      short_name: shortName(design),
      ...(design.description.trim()
        ? { description: design.description.trim() }
        : {}),
      start_url: "/",
      display: "standalone",
      background_color: matteFor(design, resolveColors(design)),
      theme_color: themeColor(design),
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/icon-maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    null,
    2,
  )}\n`;
}

export function buildHtmlHead(design: Design): string {
  const origin = siteOrigin(design);
  const title = cardTitle(design);
  const description = cardTagline(design);
  const attr = escapeXml;
  const lines = [
    '<link rel="icon" href="/favicon.ico" sizes="32x32">',
    '<link rel="icon" href="/icon.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/manifest.webmanifest">',
    `<meta name="theme-color" content="${themeColor(design)}">`,
    "",
    `<meta property="og:title" content="${attr(title)}">`,
    description
      ? `<meta property="og:description" content="${attr(description)}">`
      : null,
    `<meta property="og:site_name" content="${attr(siteName(design))}">`,
    '<meta property="og:type" content="website">',
    origin ? `<meta property="og:url" content="${origin}/">` : null,
    `<meta property="og:image" content="${origin || "https://YOUR-DOMAIN"}/og.png">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${attr(title)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
  ];
  return `${lines.filter((line) => line !== null).join("\n")}\n`;
}

export function buildNextMetadata(design: Design): string {
  const origin = siteOrigin(design);
  const description = design.description.trim();
  const json = (value: string) => JSON.stringify(value);
  return `// Merge into app/layout.tsx. The icons, manifest and social card are
// picked up from the files in app/ automatically; no <link> tags needed.
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(${json(origin || "https://YOUR-DOMAIN")}),
  title: ${json(siteName(design))},${description ? `\n  description: ${json(description)},` : ""}
  openGraph: {
    title: ${json(cardTitle(design))},
    siteName: ${json(siteName(design))},
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: ${json(themeColor(design))},
};
`;
}

export function buildSnippet(design: Design): string {
  return design.target === "next"
    ? buildNextMetadata(design)
    : buildHtmlHead(design);
}

export function buildReadme(design: Design, fontEmbedded: boolean): string {
  const paths = assetPaths(design);
  const next = design.target === "next";
  const install = next
    ? `1. Copy the \`app/\` and \`public/\` folders into your project root, merging
   with what is there. Delete any existing \`app/favicon.ico\` first.
2. Merge \`${paths.snippet}\` into \`app/layout.tsx\`.
3. Deploy. Next.js generates every tag from the file names.`
    : `1. Copy everything except this README and \`${paths.snippet}\` into the
   folder your site serves from \`/\` (\`public/\` in Vite, Astro and friends).
2. Paste \`${paths.snippet}\` into your \`<head>\`.
3. Deploy, then hard-refresh. Browsers cache favicons stubbornly.`;

  return `# ${siteName(design)} — icon kit

A small kit, on purpose. Modern browsers need far less than the sixty-file
packages of 2015, and every file you do not ship is one you never have to
update again.

| File | What it is for |
| --- | --- |
| \`${paths.ico}\` | 16, 32 and 48px in one real .ico. Legacy browsers, Safari, RSS readers and anything that blindly requests \`/favicon.ico\`. |
| \`${paths.svg}\` | The favicon everyone else uses. Sharp at any size${design.adaptive ? ", restyles itself for dark browser chrome" : ""}. |
| \`${paths.apple}\` | 180px, opaque and padded: iOS rounds the corners itself and turns transparency black. |
| \`${paths.icon192}\`, \`${paths.icon512}\` | Android and installed-app icons, referenced by the manifest. |
| \`${paths.maskable}\` | Full-bleed variant with the glyph inside the 80% safe zone, so circular launchers cannot crop it. |
| \`${paths.manifest}\` | Web app manifest. |
| \`${paths.card}\` | 1200×630 social card for link previews. |
| \`${paths.snippet}\` | The only markup you need. |

## Install

${install}

## Notes

- The maskable icon is a separate file. Declaring one image as \`"any maskable"\`
  gives you either a cropped logo or a tiny one; never both right.
${
  design.source === "letter"
    ? fontEmbedded
      ? "- The letter in `icon.svg` carries its own subsetted font, a kilobyte or two, because SVG favicons cannot load web fonts.\n"
      : "- The font could not be embedded in `icon.svg` (offline?). It falls back to a system face; re-export when online.\n"
    : ""
}- No \`browserconfig.xml\`, no \`mstile\`, no 57×57 touch icons: the platforms
  that wanted them are gone.

Made with _ (long underscore).
`;
}
