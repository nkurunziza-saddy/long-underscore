// Extracts every Lucide icon's node list from the installed lucide-react
// package into public/lucide.json, so the icon picker never depends on a CDN.
// Run with `bun run icons` after bumping lucide-react.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "node_modules/lucide-react/dist/esm/icons");

const icons = {};
for (const file of readdirSync(iconsDir).sort()) {
  if (!file.endsWith(".js")) continue;
  const source = readFileSync(join(iconsDir, file), "utf8");
  const match = source.match(/const __iconNode = (\[[\s\S]*?\n\]);/);
  if (!match) continue; // alias re-exports carry no nodes of their own
  const nodes = new Function(`return ${match[1]}`)();
  icons[file.slice(0, -3)] = nodes.map(([tag, { key, ...attrs }]) => [
    tag,
    attrs,
  ]);
}

const out = join(root, "public/lucide.json");
writeFileSync(out, JSON.stringify(icons));
console.log(`${Object.keys(icons).length} icons → public/lucide.json`);
