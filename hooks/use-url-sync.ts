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
      fontColor: parseAsString.withDefault("#065f46"),
      backgroundColor: parseAsString.withDefault("#ffffff"),
      selectedFont: parseAsString.withDefault("poppins"),
      fontWeight: parseAsInteger.withDefault(700),
      fontSize: parseAsInteger.withDefault(48),
      borderRadius: parseAsInteger.withDefault(8),
      selectedColorFamily: parseAsString.withDefault("emerald"),
      ogTitle: parseAsString.withDefault("My Awesome App"),
      ogDescription: parseAsString.withDefault(
        "The best way to build your next project with speed and style.",
      ),
      appName: parseAsString.withDefault("My App"),
      appShortName: parseAsString.withDefault("App"),
      description: parseAsString.withDefault("A progressive web application"),
      author: parseAsString.withDefault(""),
      keywords: parseAsString.withDefault(""),
      themeColor: parseAsString.withDefault("#065f46"),
      twitterHandle: parseAsString.withDefault(""),
      ogType: parseAsString.withDefault("website"),
      siteUrl: parseAsString.withDefault(""),
      siteLanguage: parseAsString.withDefault("en_US"),
      logoSize: parseAsInteger.withDefault(60),
      includeOgImage: parseAsString.withDefault("true"),
    },
    {
      history: "replace",
      shallow: true,
    },
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Store setters are stable
  useEffect(() => {
    if (store.mode !== params.mode) store.setMode(params.mode as any);
    if (store.text !== params.text) store.setText(params.text);
    if (store.iconName !== params.iconName) store.setIconName(params.iconName);

    const settings = store.settings[store.mode];

    if (settings.fontColor !== params.fontColor)
      store.setFontColor(params.fontColor);
    if (settings.backgroundColor !== params.backgroundColor)
      store.setBackgroundColor(params.backgroundColor);
    if (settings.selectedFont !== params.selectedFont)
      store.setSelectedFont(params.selectedFont);
    if (settings.fontWeight !== params.fontWeight)
      store.setFontWeight(params.fontWeight);
    if (settings.fontSize !== params.fontSize)
      store.setFontSize(params.fontSize);
    if (settings.borderRadius !== params.borderRadius)
      store.setBorderRadius(params.borderRadius);
    if (settings.selectedColorFamily !== params.selectedColorFamily)
      store.setSelectedColorFamily(params.selectedColorFamily);

    if (store.ogTitle !== params.ogTitle) store.setOgTitle(params.ogTitle);
    if (store.ogDescription !== params.ogDescription)
      store.setOgDescription(params.ogDescription);
    if (store.includeOgImage !== (params.includeOgImage === "true"))
      store.setIncludeOgImage(params.includeOgImage === "true");

    const newMetadata = {
      appName: params.appName,
      appShortName: params.appShortName,
      description: params.description,
      author: params.author,
      keywords: params.keywords,
      themeColor: params.themeColor,
      twitterHandle: params.twitterHandle,
      ogType: params.ogType,
      siteUrl: params.siteUrl,
      siteLanguage: params.siteLanguage,
    };

    const isMetadataEqual =
      store.metadata.appName === newMetadata.appName &&
      store.metadata.appShortName === newMetadata.appShortName &&
      store.metadata.description === newMetadata.description &&
      store.metadata.author === newMetadata.author &&
      store.metadata.keywords === newMetadata.keywords &&
      store.metadata.themeColor === newMetadata.themeColor &&
      store.metadata.twitterHandle === newMetadata.twitterHandle &&
      store.metadata.ogType === newMetadata.ogType &&
      store.metadata.siteUrl === newMetadata.siteUrl &&
      store.metadata.siteLanguage === newMetadata.siteLanguage;

    if (!isMetadataEqual) {
      store.setMetadata(newMetadata);
    }
  }, [
    params.mode,
    params.text,
    params.iconName,
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
    params.twitterHandle,
    params.ogType,
    params.siteUrl,
    params.siteLanguage,
    params.logoSize,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const settings = store.settings[store.mode];
      setParams({
        mode: store.mode,
        text: store.text,
        iconName: store.iconName,
        fontColor: settings.fontColor,
        backgroundColor: settings.backgroundColor,
        selectedFont: settings.selectedFont,
        fontWeight: settings.fontWeight,
        fontSize: settings.fontSize,
        borderRadius: settings.borderRadius,
        selectedColorFamily: settings.selectedColorFamily,
        ogTitle: store.ogTitle,
        ogDescription: store.ogDescription,
        appName: store.metadata.appName,
        appShortName: store.metadata.appShortName,
        description: store.metadata.description,
        author: store.metadata.author,
        keywords: store.metadata.keywords,
        themeColor: store.metadata.themeColor,
        twitterHandle: store.metadata.twitterHandle,
        ogType: store.metadata.ogType,
        siteUrl: store.metadata.siteUrl,
        siteLanguage: store.metadata.siteLanguage,
        logoSize: settings.logoSize,
        includeOgImage: store.includeOgImage ? "true" : "false",
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    store.mode,
    store.text,
    store.iconName,
    store.settings,
    store.ogTitle,
    store.ogDescription,
    store.includeOgImage,
    store.metadata,
    setParams,
  ]);
}
