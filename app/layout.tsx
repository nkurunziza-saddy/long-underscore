import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import type React from "react";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { BRAND } from "@/lib/brand";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// The default mark is set in Poppins Bold. Self-hosting that one weight lets
// the first paint draw it without waiting on Google Fonts; every other face
// is fetched on demand (see lib/font-loader.ts).
const poppins = Poppins({
  weight: "700",
  subsets: ["latin"],
  display: "block",
  variable: "--font-poppins",
});

const title = "_ · one mark, every surface";
const { description } = BRAND;

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title,
  description,
  authors: [{ name: BRAND.author }],
  creator: BRAND.author,
  openGraph: {
    title,
    description,
    url: BRAND.url,
    siteName: BRAND.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: BRAND.handle,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#070708" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${poppins.variable} antialiased`}
    >
      <body className="min-h-dvh">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
