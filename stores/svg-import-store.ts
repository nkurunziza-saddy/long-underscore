import { create } from "zustand";

interface SvgImportState {
  svgContent: string;
  svgDataUrl: string | null;
  isValid: boolean;
  fileName: string | null;

  setSvgFromCode: (code: string) => void;
  setSvgFromFile: (file: File) => Promise<void>;
  clearSvg: () => void;
}

/**
 * Validates that the string is valid SVG markup
 */
function isValidSvg(content: string): boolean {
  if (!content.trim()) return false;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "image/svg+xml");
    const parserError = doc.querySelector("parsererror");
    if (parserError) return false;

    const svgElement = doc.querySelector("svg");
    return svgElement !== null;
  } catch {
    return false;
  }
}

/**
 * Converts SVG content to a data URL for preview
 */
function svgToDataUrl(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent);
  return `data:image/svg+xml,${encoded}`;
}

export const useSvgImportStore = create<SvgImportState>((set) => ({
  svgContent: "",
  svgDataUrl: null,
  isValid: false,
  fileName: null,

  setSvgFromCode: (code: string) => {
    const valid = isValidSvg(code);
    set({
      svgContent: code,
      svgDataUrl: valid ? svgToDataUrl(code) : null,
      isValid: valid,
      fileName: null,
    });
  },

  setSvgFromFile: async (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const valid = isValidSvg(content);
        set({
          svgContent: content,
          svgDataUrl: valid ? svgToDataUrl(content) : null,
          isValid: valid,
          fileName: file.name,
        });
        resolve();
      };
      reader.readAsText(file);
    });
  },

  clearSvg: () => {
    set({
      svgContent: "",
      svgDataUrl: null,
      isValid: false,
      fileName: null,
    });
  },
}));
