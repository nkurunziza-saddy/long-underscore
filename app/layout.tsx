import type { Metadata } from "next";
import {
  Inter,
  Lora,
  Merriweather,
  Montserrat,
  Open_Sans,
  Playfair_Display,
  Poppins,
  Roboto,
  Space_Mono,
} from "next/font/google";
import type React from "react";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const openSans = Open_Sans({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const montserrat = Montserrat({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

const merriweather = Merriweather({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

const lora = Lora({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "_",
  description:
    "Create professional favicons and logos from text, emojis, or images. Complete export package with PWA support and all formats.",
  keywords: "favicon, logo, generator, PWA, icon, web design, branding",
  authors: [{ name: "Nkurunziza Saddy" }],
  creator: "Nkurunziza Saddy",
  publisher: "Nkurunziza Saddy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://longunderscore.vercel.app"),
  openGraph: {
    title: "_",
    description:
      "Create professional favicons and logos with complete PWA support.",
    url: "https://longunderscore.vercel.app",
    siteName: "",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "_",
    description:
      "Create professional favicons and logos with complete PWA support.",
    creator: "@nk_saddy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={` ${inter.variable} ${poppins.variable} ${roboto.variable} ${openSans.variable} ${montserrat.variable} ${playfair.variable} ${merriweather.variable} ${lora.variable} ${spaceMono.variable} antialiased`}
    >
      <body className="font-sans">
        <Suspense fallback={null}>
          <NuqsAdapter>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ToastProvider>{children}</ToastProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </Suspense>
      </body>
    </html>
  );
}
