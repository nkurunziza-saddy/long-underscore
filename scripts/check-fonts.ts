// Verifies every font in lib/fonts.ts still resolves on Google Fonts with the
// weights we advertise. Run with `bun run fonts:check`.
import { FONTS, getFontLink } from "../lib/fonts";

const results = await Promise.all(
  FONTS.map(async (font) => {
    const url = getFontLink(font.value);
    try {
      const res = await fetch(url);
      return { font, ok: res.ok, detail: `${res.status} ${url}` };
    } catch (error) {
      return { font, ok: false, detail: String(error) };
    }
  }),
);

const failed = results.filter((result) => !result.ok);
for (const { font, detail } of failed)
  console.error(`✗ ${font.name}: ${detail}`);
console.log(
  `${results.length - failed.length}/${results.length} fonts resolve`,
);
if (failed.length > 0) process.exit(1);
