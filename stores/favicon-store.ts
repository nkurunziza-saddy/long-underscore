import { create } from "zustand";
import type { MetadataFormData } from "@/components/metadata-form";

export type GeneratorMode = "text" | "svg" | "icon" | "og";
export type OgLayout = "studio" | "browser" | "hero" | "split" | "minimal";

export interface ModeSettings {
  fontColor: string;
  backgroundColor: string;
  selectedFont: string;
  fontWeight: number;
  fontSize: number;
  borderRadius: number;
  selectedColorFamily: string;
  transparentBackground: boolean;
  logoSize: number;
  logoMode: "text" | "icon" | "svg";
  ogLayout?: OgLayout;
  showGlassCard?: boolean;
  meshOpacity?: number;
}

const defaultSettings: ModeSettings = {
  fontColor: "#065f46",
  backgroundColor: "#ffffff",
  selectedFont: "poppins",
  fontWeight: 700,
  fontSize: 48,
  borderRadius: 8,
  selectedColorFamily: "emerald",
  transparentBackground: false,
  logoSize: 60,
  logoMode: "text",
  ogLayout: "studio",
  showGlassCard: true,
  meshOpacity: 0.4,
};

interface FaviconState {
  mode: GeneratorMode;
  text: string;
  iconName: string;
  iconNodes: unknown[] | null;
  ogTitle: string;
  ogDescription: string;
  metadata: MetadataFormData;
  includePwa: boolean;
  includeOgImage: boolean;

  // Mode-specific settings
  settings: Record<GeneratorMode, ModeSettings>;

  setMode: (mode: GeneratorMode) => void;
  setText: (text: string) => void;
  setIconName: (name: string) => void;
  setIconNodes: (nodes: unknown[] | null) => void;
  setOgTitle: (title: string) => void;
  setOgDescription: (description: string) => void;
  setMetadata: (metadata: MetadataFormData) => void;
  setIncludePwa: (include: boolean) => void;
  setIncludeOgImage: (include: boolean) => void;

  // Setters that update the current mode's settings
  updateSettings: (update: Partial<ModeSettings>) => void;

  // Legacy setters for compatibility
  setFontColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setSelectedFont: (font: string) => void;
  setFontWeight: (weight: number) => void;
  setFontSize: (size: number) => void;
  setBorderRadius: (radius: number) => void;
  setSelectedColorFamily: (family: string) => void;
  setTransparentBackground: (transparent: boolean) => void;
}

export const useFaviconStore = create<FaviconState>((set, get) => ({
  mode: "text",
  text: "S",
  iconName: "Zap",
  iconNodes: null,
  ogTitle: "My Awesome App",
  ogDescription:
    "The best way to build your next project with speed and style.",
  metadata: {
    appName: "My App",
    appShortName: "App",
    description: "A progressive web application",
    author: "",
    keywords: "",
    themeColor: "#065f46",
    twitterHandle: "",
    ogType: "website",
    siteUrl: "",
    siteLanguage: "en_US",
  },
  includePwa: true,
  includeOgImage: true,

  settings: {
    text: { ...defaultSettings, logoMode: "text" },
    icon: { ...defaultSettings, logoMode: "icon" },
    og: {
      ...defaultSettings,
      fontSize: 72,
      borderRadius: 4,
      fontColor: "#ffffff",
      backgroundColor: "#065f46",
      logoSize: 80,
      logoMode: "icon",
      ogLayout: "studio",
    },
    svg: { ...defaultSettings, logoMode: "svg" },
  },

  setMode: (mode) => set({ mode }),
  setText: (text) => set({ text }),
  setIconName: (iconName) => set({ iconName }),
  setIconNodes: (iconNodes) => set({ iconNodes }),
  setOgTitle: (ogTitle) => set({ ogTitle }),
  setOgDescription: (ogDescription) => set({ ogDescription }),
  setMetadata: (metadata) => set({ metadata }),
  setIncludePwa: (includePwa) => set({ includePwa }),
  setIncludeOgImage: (includeOgImage) => set({ includeOgImage }),

  updateSettings: (update) => {
    const { mode, settings } = get();
    set({
      settings: {
        ...settings,
        [mode]: { ...settings[mode], ...update },
      },
    });
  },

  setFontColor: (fontColor) => get().updateSettings({ fontColor }),
  setBackgroundColor: (backgroundColor) =>
    get().updateSettings({ backgroundColor }),
  setSelectedFont: (selectedFont) => get().updateSettings({ selectedFont }),
  setFontWeight: (fontWeight) => get().updateSettings({ fontWeight }),
  setFontSize: (fontSize) => get().updateSettings({ fontSize }),
  setBorderRadius: (borderRadius) => get().updateSettings({ borderRadius }),
  setSelectedColorFamily: (selectedColorFamily) =>
    get().updateSettings({ selectedColorFamily }),
  setTransparentBackground: (transparentBackground) =>
    get().updateSettings({ transparentBackground }),
}));
