import { FONTS, getFontLink } from "./lib/fonts";

async function testFonts() {
  for (const font of FONTS) {
    const url = getFontLink(font.value, font.weight);
    if (!url) {
      console.error(`❌ ${font.name}: No URL generated (missing in map?)`);
      continue;
    }
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.status === 200) {
        console.log(`✅ ${font.name}: OK`);
      } else {
        console.error(
          `❌ ${font.name}: Failed with status ${res.status} (${url})`,
        );
      }
    } catch (e) {
      console.error(`❌ ${font.name}: Error fetching ${url}`, e);
    }
  }
}

testFonts();
