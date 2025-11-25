import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useEffect } from "react";
import { useFaviconStore } from "@/stores/favicon-store";

export function useUrlSync() {
  const store = useFaviconStore();

  const [params, setParams] = useQueryStates(
    {
      text: parseAsString.withDefault("S"),
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
      shallow: false,
    }
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Store setters are stable
  useEffect(() => {
    if (store.text !== params.text) store.setText(params.text);
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

    // Check metadata equality before updating
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
    params.text,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: setParams is stable from nuqs
  useEffect(() => {
    setParams({
      text: store.text,
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
  }, [
    store.text,
    store.fontColor,
    store.backgroundColor,
    store.selectedFont,
    store.fontWeight,
    store.fontSize,
    store.borderRadius,
    store.selectedColorFamily,
    store.metadata,
  ]);
}
