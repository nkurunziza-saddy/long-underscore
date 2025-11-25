export const premiumFonts = [
  // Sans-serif fonts (Modern & Clean)
  {
    name: "Inter",
    value: "inter",
    category: "sans-serif",
    weight: [400, 500, 600, 700],
  },
  {
    name: "Poppins",
    value: "poppins",
    category: "sans-serif",
    weight: [400, 500, 600, 700],
  },
  {
    name: "Roboto",
    value: "roboto",
    category: "sans-serif",
    weight: [400, 500, 700],
  },
  {
    name: "Open Sans",
    value: "open-sans",
    category: "sans-serif",
    weight: [400, 600, 700],
  },
  {
    name: "Montserrat",
    value: "montserrat",
    category: "sans-serif",
    weight: [400, 600, 700],
  },
  { name: "Lato", value: "lato", category: "sans-serif", weight: [400, 700] },
  {
    name: "Raleway",
    value: "raleway",
    category: "sans-serif",
    weight: [400, 600, 700],
  },
  {
    name: "Nunito",
    value: "nunito",
    category: "sans-serif",
    weight: [400, 600, 700],
  },
  {
    name: "Ubuntu",
    value: "ubuntu",
    category: "sans-serif",
    weight: [400, 500, 700],
  },
  {
    name: "Quicksand",
    value: "quicksand",
    category: "sans-serif",
    weight: [400, 600, 700],
  },
  {
    name: "Oxygen",
    value: "oxygen",
    category: "sans-serif",
    weight: [400, 700],
  },
  {
    name: "Source Sans Pro",
    value: "source-sans-pro",
    category: "sans-serif",
    weight: [400, 600, 700],
  },

  // Serif fonts (Elegant & Traditional)
  {
    name: "Playfair Display",
    value: "playfair-display",
    category: "serif",
    weight: [400, 600, 700],
  },
  {
    name: "Merriweather",
    value: "merriweather",
    category: "serif",
    weight: [400, 700],
  },
  { name: "Lora", value: "lora", category: "serif", weight: [400, 600, 700] },
  {
    name: "Crimson Text",
    value: "crimson-text",
    category: "serif",
    weight: [400, 600],
  },
  {
    name: "Cormorant Garamond",
    value: "cormorant-garamond",
    category: "serif",
    weight: [300, 400, 600],
  },
  {
    name: "Libre Baskerville",
    value: "libre-baskerville",
    category: "serif",
    weight: [400, 700],
  },
  {
    name: "Josefin Sans",
    value: "josefin-sans",
    category: "serif",
    weight: [400, 600, 700],
  },
  {
    name: "EB Garamond",
    value: "eb-garamond",
    category: "serif",
    weight: [400, 500, 700],
  },

  // Mono fonts (Code & Technical)
  {
    name: "Space Mono",
    value: "space-mono",
    category: "mono",
    weight: [400, 700],
  },
  {
    name: "IBM Plex Mono",
    value: "ibm-plex-mono",
    category: "mono",
    weight: [400, 600],
  },
  {
    name: "Courier Prime",
    value: "courier-prime",
    category: "mono",
    weight: [400, 700],
  },
  {
    name: "Roboto Mono",
    value: "roboto-mono",
    category: "mono",
    weight: [400, 500, 700],
  },
  {
    name: "JetBrains Mono",
    value: "jetbrains-mono",
    category: "mono",
    weight: [400, 600, 700],
  },

  // Display fonts (Creative & Bold)
  {
    name: "Bebas Neue",
    value: "bebas-neue",
    category: "display",
    weight: [400],
  },
  { name: "Righteous", value: "righteous", category: "display", weight: [400] },
  { name: "Pacifico", value: "pacifico", category: "display", weight: [400] },
];

export const fontWeightNames: Record<number, string> = {
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
};

export const getFontLink = (fontValue: string, weights: number[]) => {
  const fontMap: Record<string, string> = {
    inter: "Inter",
    poppins: "Poppins",
    roboto: "Roboto",
    "open-sans": "Open+Sans",
    montserrat: "Montserrat",
    lato: "Lato",
    raleway: "Raleway",
    nunito: "Nunito",
    ubuntu: "Ubuntu",
    quicksand: "Quicksand",
    oxygen: "Oxygen",
    "source-sans-pro": "Source+Sans+Pro",
    "playfair-display": "Playfair+Display",
    merriweather: "Merriweather",
    lora: "Lora",
    "crimson-text": "Crimson+Text",
    "cormorant-garamond": "Cormorant+Garamond",
    "libre-baskerville": "Libre+Baskerville",
    "josefin-sans": "Josefin+Sans",
    "eb-garamond": "EB+Garamond",
    "space-mono": "Space+Mono",
    "ibm-plex-mono": "IBM+Plex+Mono",
    "courier-prime": "Courier+Prime",
    "roboto-mono": "Roboto+Mono",
    "jetbrains-mono": "JetBrains+Mono",
    "bebas-neue": "Bebas+Neue",
    righteous: "Righteous",
    pacifico: "Pacifico",
  };

  const fontName = fontMap[fontValue];
  const weightParams = weights.join(";").replace(/ /g, "");

  return `https://fonts.googleapis.com/css2?family=${fontName}:wght@${weightParams}&display=swap`;
};

export const getCSSFontFamily = (fontValue: string): string => {
  const fontMap: Record<string, string> = {
    inter: "'Inter', sans-serif",
    poppins: "'Poppins', sans-serif",
    roboto: "'Roboto', sans-serif",
    "open-sans": "'Open Sans', sans-serif",
    montserrat: "'Montserrat', sans-serif",
    lato: "'Lato', sans-serif",
    raleway: "'Raleway', sans-serif",
    nunito: "'Nunito', sans-serif",
    ubuntu: "'Ubuntu', sans-serif",
    quicksand: "'Quicksand', sans-serif",
    oxygen: "'Oxygen', sans-serif",
    "source-sans-pro": "'Source Sans Pro', sans-serif",
    "playfair-display": "'Playfair Display', serif",
    merriweather: "'Merriweather', serif",
    lora: "'Lora', serif",
    "crimson-text": "'Crimson Text', serif",
    "cormorant-garamond": "'Cormorant Garamond', serif",
    "libre-baskerville": "'Libre Baskerville', serif",
    "josefin-sans": "'Josefin Sans', serif",
    "eb-garamond": "'EB Garamond', serif",
    "space-mono": "'Space Mono', monospace",
    "ibm-plex-mono": "'IBM Plex Mono', monospace",
    "courier-prime": "'Courier Prime', monospace",
    "roboto-mono": "'Roboto Mono', monospace",
    "jetbrains-mono": "'JetBrains Mono', monospace",
    "bebas-neue": "'Bebas Neue', display",
    righteous: "'Righteous', display",
    pacifico: "'Pacifico', display",
  };

  return fontMap[fontValue] || "'Inter', sans-serif";
};
