import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useEffect } from "react";
import { useFaviconStore } from "@/stores/favicon-store";

export function useUrlSync() {
  const store = useFaviconStore();

  const [params, setParams] = useQueryStates(
    {
      mode: parseAsString.withDefault("text"),
      text: parseAsString.withDefault("S"),
      iconName: parseAsString.withDefault("Zap"),
      backgroundType: parseAsString.withDefault("solid"),
      gradientColor1: parseAsString.withDefault("#065f46"),
      gradientColor2: parseAsString.withDefault("#34d399"),
      fontColor: parseAsString.withDefault("#065f46"),
      backgroundColor: parseAsString.withDefault("#ffffff"),
      selectedFont: parseAsString.withDefault("poppins"),
      fontWeight: parseAsInteger.withDefault(700),
      fontSize: parseAsInteger.withDefault(48),
      borderRadius: parseAsInteger.withDefault(8),
      selectedColorFamily: parseAsString.withDefault("emerald"),
      appName: parseAsString.withDefault("My App"),
      appShortName: parseAsString.withDefault("App"),
      description: parseAsString.withDefault("A progressive web application"),
      author: parseAsString.withDefault(""),
      keywords: parseAsString.withDefault(""),
      themeColor: parseAsString.withDefault("#065f46"),
    },
    {
      history: "replace",
      shallow: true,
    }
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Store setters are stable
  useEffect(() => {
    if (store.mode !== params.mode) store.setMode(params.mode as any);
    if (store.text !== params.text) store.setText(params.text);
    if (store.iconName !== params.iconName) store.setIconName(params.iconName);
    if (store.backgroundType !== params.backgroundType)
      store.setBackgroundType(params.backgroundType as any);
    if (
      store.gradientColors[0] !== params.gradientColor1 ||
      store.gradientColors[1] !== params.gradientColor2
    ) {
      store.setGradientColors([params.gradientColor1, params.gradientColor2]);
    }

    if (store.fontColor !== params.fontColor)
      store.setFontColor(params.fontColor);
    if (store.backgroundColor !== params.backgroundColor)
      store.setBackgroundColor(params.backgroundColor);
    if (store.selectedFont !== params.selectedFont)
      store.setSelectedFont(params.selectedFont);
    if (store.fontWeight !== params.fontWeight)
      store.setFontWeight(params.fontWeight);
    if (store.fontSize !== params.fontSize) store.setFontSize(params.fontSize);
    if (store.borderRadius !== params.borderRadius)
      store.setBorderRadius(params.borderRadius);
    if (store.selectedColorFamily !== params.selectedColorFamily)
      store.setSelectedColorFamily(params.selectedColorFamily);

    const newMetadata = {
      appName: params.appName,
      appShortName: params.appShortName,
      description: params.description,
      author: params.author,
      keywords: params.keywords,
      themeColor: params.themeColor,
    };

    const isMetadataEqual =
      store.metadata.appName === newMetadata.appName &&
      store.metadata.appShortName === newMetadata.appShortName &&
      store.metadata.description === newMetadata.description &&
      store.metadata.author === newMetadata.author &&
      store.metadata.keywords === newMetadata.keywords &&
      store.metadata.themeColor === newMetadata.themeColor;

    if (!isMetadataEqual) {
      store.setMetadata(newMetadata);
    }
  }, [
    params.mode,
    params.text,
    params.iconName,
    params.backgroundType,
    params.gradientColor1,
    params.gradientColor2,
    params.fontColor,
    params.backgroundColor,
    params.selectedFont,
    params.fontWeight,
    params.fontSize,
    params.borderRadius,
    params.selectedColorFamily,
    params.appName,
    params.appShortName,
    params.description,
    params.author,
    params.keywords,
    params.themeColor,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams({
        mode: store.mode,
        text: store.text,
        iconName: store.iconName,
        backgroundType: store.backgroundType,
        gradientColor1: store.gradientColors[0],
        gradientColor2: store.gradientColors[1],
        fontColor: store.fontColor,
        backgroundColor: store.backgroundColor,
        selectedFont: store.selectedFont,
        fontWeight: store.fontWeight,
        fontSize: store.fontSize,
        borderRadius: store.borderRadius,
        selectedColorFamily: store.selectedColorFamily,
        appName: store.metadata.appName,
        appShortName: store.metadata.appShortName,
        description: store.metadata.description,
        author: store.metadata.author,
        keywords: store.metadata.keywords,
        themeColor: store.metadata.themeColor,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    store.mode,
    store.text,
    store.iconName,
    store.backgroundType,
    store.gradientColors,
    store.fontColor,
    store.backgroundColor,
    store.selectedFont,
    store.fontWeight,
    store.fontSize,
    store.borderRadius,
    store.selectedColorFamily,
    store.metadata,
    setParams,
  ]);
}
