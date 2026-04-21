import { create } from "zustand";
import type { MetadataFormData } from "@/components/metadata-form";

export type GeneratorMode = "text" | "svg" | "icon";
export type BackgroundType = "solid" | "gradient";

interface FaviconState {
  mode: GeneratorMode;
  text: string;
  iconName: string;
  iconNodes: any[] | null;
  backgroundType: BackgroundType;
  gradientColors: [string, string];
  fontColor: string;
  backgroundColor: string;
  selectedFont: string;
  fontWeight: number;
  fontSize: number;
  borderRadius: number;
  selectedColorFamily: string;

  metadata: MetadataFormData;
  includePwa: boolean;

  setMode: (mode: GeneratorMode) => void;

  setText: (text: string) => void;
  setIconName: (name: string) => void;
  setIconNodes: (nodes: any[] | null) => void;
  setFontColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setBackgroundType: (type: BackgroundType) => void;
  setGradientColors: (colors: [string, string]) => void;
  setSelectedFont: (font: string) => void;
  setFontWeight: (weight: number) => void;
  setFontSize: (size: number) => void;
  setBorderRadius: (radius: number) => void;
  setSelectedColorFamily: (family: string) => void;
  setMetadata: (metadata: MetadataFormData) => void;
  setIncludePwa: (include: boolean) => void;
}

export const useFaviconStore = create<FaviconState>((set) => ({
  mode: "text",
  text: "S",
  iconName: "Zap",
  iconNodes: null,
  backgroundType: "solid",
  gradientColors: ["#065f46", "#34d399"],
  fontColor: "#065f46",
  backgroundColor: "#ffffff",
  selectedFont: "poppins",
  fontWeight: 700,
  fontSize: 48,
  borderRadius: 8,
  selectedColorFamily: "emerald",
  metadata: {
    appName: "My App",
    appShortName: "App",
    description: "A progressive web application",
    author: "",
    keywords: "",
    themeColor: "#065f46",
  },

  includePwa: true,

  setMode: (mode) => set({ mode }),

  setText: (text) => set({ text }),
  setIconName: (iconName) => set({ iconName }),
  setIconNodes: (iconNodes) => set({ iconNodes }),
  setFontColor: (fontColor) => set({ fontColor }),
  setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
  setBackgroundType: (backgroundType) => set({ backgroundType }),
  setGradientColors: (gradientColors) => set({ gradientColors }),
  setSelectedFont: (selectedFont) => set({ selectedFont }),
  setFontWeight: (fontWeight) => set({ fontWeight }),
  setFontSize: (fontSize) => set({ fontSize }),
  setBorderRadius: (borderRadius) => set({ borderRadius }),
  setSelectedColorFamily: (selectedColorFamily) => set({ selectedColorFamily }),
  setMetadata: (metadata) => set({ metadata }),
  setIncludePwa: (includePwa) => set({ includePwa }),
}));
