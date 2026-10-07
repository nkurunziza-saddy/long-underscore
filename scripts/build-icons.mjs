// Reads every Phosphor icon out of the installed @phosphor-icons/core into
// public/phosphor/: one file of paths for each weight, and one of the words
// each icon can be found by. The icon picker and the command line read
// these, so neither depends on a CDN. Run with `bun run icons` after
// bumping @phosphor-icons/core.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const core = join(root, "node_modules/@phosphor-icons/core");
const { icons } = createRequire(import.meta.url)("@phosphor-icons/core");
const out = join(root, "public/phosphor");
mkdirSync(out, { recursive: true });

const WEIGHTS = ["thin", "light", "regular", "bold", "fill", "duotone"];
const names = icons.map((icon) => icon.name).sort();

for (const weight of WEIGHTS) {
  // An icon is its paths in order; one drawn faint (duotone's wash) is a
  // pair of path and opacity.
  const set = {};
  for (const name of names) {
    const file = weight === "regular" ? name : `${name}-${weight}`;
    const svg = readFileSync(join(core, "assets", weight, `${file}.svg`), "utf8");
    set[name] = [...svg.matchAll(/<path d="([^"]+)"(?: opacity="([^"]+)")?\/>/g)].map(
      ([, d, opacity]) => (opacity ? [d, Number(opacity)] : d),
    );
    if (set[name].length === 0) throw new Error(`No paths in ${file}.svg`);
  }
  writeFileSync(join(out, `${weight}.json`), JSON.stringify(set));
}

// What an icon is called is not always what someone types: "lightning" is
// also found by "power" and "flash".
const words = {};
for (const icon of icons) {
  const extra = [...icon.tags, ...icon.categories]
    .map((word) => String(word).toLowerCase().replace(/^\*|\*$/g, ""))
    .filter((word) => word && !icon.name.includes(word));
  words[icon.name] = [...new Set(extra)].join(" ");
}
writeFileSync(join(out, "words.json"), JSON.stringify(words));

console.log(`${names.length} icons × ${WEIGHTS.length} weights → public/phosphor/`);
