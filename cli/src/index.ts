import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { audit, type Check, summarize } from "../../lib/audit";
import { cardWeights } from "../../lib/card";
import {
  applyTreatment,
  type Design,
  HUES,
  hueLabel,
  siteName,
  TREATMENTS,
} from "../../lib/design";
import { fetchSubsetFont } from "../../lib/font-loader";
import { FONT_WEIGHT_NAMES, FONTS, getFont } from "../../lib/fonts";
import { HALFTONE_PRESETS, HALFTONE_SHAPES } from "../../lib/halftone";
import { buildKit } from "../../lib/kit";
import { buildMarkSvg } from "../../lib/mark-svg";
import { type MarkAssets, measureText } from "../../lib/render-mark";
import { encodeDesign, sanitizeDesign } from "../../lib/share";
import { dominantColor, type SvgSource } from "../../lib/svg-source";
import { loadAssets, loadIcons } from "./assets";
import {
  describeFlags,
  designFromFlags,
  type Flags,
  LAYOUTS,
  PARSE_OPTIONS,
  TEXTURES,
  TONES,
  UsageError,
} from "./options";
import { BROWSER, decodeSvg, loadFont, setUp, toPng } from "./platform";
import { detectProject, placeFile } from "./project";
import { parseSvgText } from "./svg";

const STUDIO = "https://longunderscore.vercel.app";

const HELP = `long-underscore: one mark, every surface it has to live on.

Design a mark in flags and get the whole icon kit written into a project:
a real favicon.ico, a dark-mode-aware icon.svg, Apple and maskable icons, a
manifest and a matching 1200 × 630 social card. No browser needed.

Usage
  long-underscore build [flags]     Write the kit into this project
  long-underscore check [flags]     Judge the design; exits 1 if a check fails
  long-underscore link  [flags]     Print a studio link to the design
  long-underscore list <what> [word]
                                    hues, treatments, fonts, icons, shapes,
                                    presets, layouts, tones, textures

The design
${describeFlags()}

Where it goes
  --target <html|next>    Default: next if the project depends on it
  --out <folder>          The project (next), or the folder to fill (html).
                          Default: here, and a plain site's public/ folder
  --dry-run               Say what would be written, and write nothing

Also
  --fix                   Apply every one-step fix the checks offer first
  --json                  Print the result as JSON
  --offline               Do not fetch fonts; use what is cached
  --studio <address>      The studio links point at (default: ${STUDIO})
  -h, --help   -v, --version

Examples
  long-underscore build --name Northwind --url northwind.app \\
    --description "Invoices and payouts for small teams."
  long-underscore build --name Northwind --halftone halftone --hue slate
  long-underscore build --name Northwind --icon zap --hue obsidian --treatment ink
  long-underscore build --from "${STUDIO}/#d=…"
  long-underscore check --name Northwind --letter Nw --json
`;

/** What the mark is, in a few words. */
function describe(design: Design): string {
  const mark =
    design.source === "letter"
      ? `letter “${design.text}” in ${getFont(design.font).name} ${FONT_WEIGHT_NAMES[design.weight] ?? design.weight}`
      : design.source === "icon"
        ? `icon ${design.icon}`
        : design.source === "halftone"
          ? `${design.htShape === "letter" ? `letter “${design.text}”` : design.htShape} halftone`
          : "your SVG";
  const colours =
    design.treatment === "custom"
      ? `${design.fg} on ${design.transparent ? "no plate" : design.bg}`
      : `${hueLabel(design.hue)} ${design.treatment}`;
  return `${mark}, ${colours}`;
}

interface Prepared {
  design: Design;
  assets: MarkAssets;
  svg: SvgSource | null;
  /** Things that went less than fully right, worth a line each. */
  notes: string[];
}

/** Read the flags, load what the design needs, and apply fixes if asked. */
async function prepare(flags: Flags): Promise<Prepared> {
  let design = designFromFlags(flags);
  const notes: string[] = [];

  let svg: SvgSource | null = null;
  if (design.source === "svg") {
    if (!flags.svg) {
      throw new UsageError(
        "This design's mark is an imported SVG, and a link or a design file does not carry one. Give it again with --svg <file>.",
      );
    }
    let text: string;
    try {
      text = await readFile(flags.svg, "utf8");
    } catch {
      throw new UsageError(`--svg "${flags.svg}" cannot be read.`);
    }
    svg = parseSvgText(text);
    if (!svg) {
      throw new UsageError(
        `--svg "${flags.svg}" is not an SVG that can be drawn.`,
      );
    }
  }

  setUp();
  const missing = await loadFont(
    design.font,
    [design.weight, ...cardWeights(design)],
    Boolean(flags.offline),
  );
  if (missing.length > 0) {
    notes.push(
      `${getFont(design.font).name} ${missing.join(", ")} could not be loaded, so text is drawn in a fallback face. Run again with a connection.`,
    );
  }

  if (svg) {
    // As the studio does on import: untouched art, full size, no plate, and
    // a glyph colour taken from the art for the card to derive its tones.
    const fresh = !flags.from;
    const coloured =
      flags.hue ?? flags.treatment ?? flags.bg ?? flags.bg2 ?? flags.fg;
    const patch: Partial<Design> = {};
    if (fresh && flags.size === undefined) patch.scale = 100;
    if (fresh && coloured === undefined) {
      patch.transparent = true;
      patch.treatment = "custom";
    }
    if (flags.fg === undefined && flags.hue === undefined) {
      patch.fg = dominantColor(await decodeSvg(svg.markup));
    }
    design = sanitizeDesign({ ...design, ...patch });
  }

  let assets = await loadAssets(design, svg);
  if (design.source === "icon" && !assets.iconNodes) {
    const names = Object.keys(await loadIcons());
    const close = names
      .filter((name) =>
        design.icon.split("-").some((part) => name.includes(part)),
      )
      .slice(0, 8);
    throw new UsageError(
      `--icon "${design.icon}" is not a Lucide icon.${close.length > 0 ? ` Close: ${close.join(", ")}.` : ""} Search with: list icons <word>.`,
    );
  }

  if (flags.fix) {
    // A fix can uncover another, so go round a few times.
    for (let round = 0; round < 4; round++) {
      const fixable = audit(design, svg).filter(
        (check) =>
          check.fix && (check.level === "fail" || check.level === "warn"),
      );
      if (fixable.length === 0) break;
      for (const check of fixable) {
        design = sanitizeDesign({ ...design, ...check.fix?.patch });
        notes.push(`Fixed “${check.title}”: ${check.fix?.label}.`);
      }
    }
    assets = await loadAssets(design, svg);
  }

  return { design, assets, svg, notes };
}

const studioLink = (design: Design, flags: Flags) =>
  `${(flags.studio ?? STUDIO).replace(/\/+$/, "")}/#d=${encodeDesign(design)}`;

/** The standalone SVG, with the letter's font subset inlined where it can be. */
async function svgFile(design: Design, assets: MarkAssets, offline: boolean) {
  if (design.source !== "letter") {
    return { svg: buildMarkSvg(design, assets), fontEmbedded: false };
  }
  const fontDataUrl =
    design.text && !offline
      ? await fetchSubsetFont(design.font, design.weight, design.text, BROWSER)
      : null;
  return {
    svg: buildMarkSvg(design, assets, {
      textLayout: measureText(design),
      fontDataUrl,
    }),
    fontEmbedded: fontDataUrl !== null,
  };
}

const LEVEL_ORDER = ["fail", "warn", "note", "pass"];

function checksOf(design: Design, svg: SvgSource | null) {
  const checks = audit(design, svg).sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level),
  );
  return { checks, ...summarize(checks) };
}

/** A check as the terminal shows it: its level, what and why, and the way out. */
function printCheck(check: Check): string {
  const lines = [`  ${check.level.padEnd(5)} ${check.title}`];
  if (check.level !== "pass") lines.push(`        ${check.detail}`);
  if (check.fix)
    lines.push(`        One-step fix: ${check.fix.label} (--fix applies it)`);
  if (check.goto === "site") {
    lines.push("        Set with --name, --description or --url");
  }
  if (check.goto === "card")
    lines.push("        Set with --title or --tagline");
  return lines.join("\n");
}

async function build(flags: Flags) {
  const prepared = await prepare(flags);
  const base = resolve(flags.out ?? ".");
  const project = detectProject(base);
  // The project decides where files go unless told otherwise.
  const design: Design = {
    ...prepared.design,
    target: flags.target ? prepared.design.target : project.target,
  };
  const { assets, svg, notes } = prepared;

  const drawn = await svgFile(design, assets, Boolean(flags.offline));
  if (design.source === "letter" && !drawn.fontEmbedded) {
    notes.push(
      "The letter's font could not be embedded in icon.svg, so it falls back to a system face there. Run again with a connection.",
    );
  }
  const kit = await buildKit(design, assets, { ...drawn, png: toPng });

  // The kit's README and its snippet are for a zip. In a project the first
  // would overwrite the project's own, and the second is pasted, not kept.
  const snippet = kit.find((file) => file.kind === "snippet");
  const files = [];
  for (const file of kit) {
    if (file.kind === "readme" || file.kind === "snippet") continue;
    const path = placeFile(
      file.path,
      design.target,
      project,
      flags.out !== undefined,
    );
    const full = join(base, path);
    const status = existsSync(full) ? "replaced" : "created";
    if (!flags["dry-run"]) {
      await mkdir(dirname(full), { recursive: true });
      await writeFile(full, file.data);
    }
    files.push({ path, status, bytes: Buffer.byteLength(file.data) });
  }

  const judged = checksOf(design, svg);
  const link = design.source === "svg" ? null : studioLink(design, flags);
  const pasteInto =
    design.target === "next"
      ? join(project.appDir, "layout.tsx")
      : "the <head> of every page";

  if (flags.json) {
    console.log(
      JSON.stringify(
        {
          ok: !judged.failing,
          written: !flags["dry-run"],
          target: design.target,
          root: base,
          mark: describe(design),
          files,
          snippet: { into: pasteInto, code: snippet?.data },
          checks: judged.checks,
          link,
          notes,
          design,
        },
        null,
        2,
      ),
    );
    return;
  }

  const framework = design.target === "next" ? "Next.js" : "plain HTML";
  console.log(`${siteName(design)}: ${describe(design)}\n`);
  console.log(
    `${flags["dry-run"] ? "Would write" : "Wrote"} ${files.length} files into ${base} (${framework})`,
  );
  for (const file of files) {
    console.log(`  ${file.status.padEnd(9)} ${file.path}`);
  }
  console.log(`\nAdd to ${pasteInto}:\n\n${String(snippet?.data).trimEnd()}\n`);
  console.log(`Checks: ${judged.passed} of ${judged.total} pass`);
  for (const check of judged.checks) {
    if (check.level !== "pass") console.log(printCheck(check));
  }
  for (const note of notes) console.log(`\nNote: ${note}`);
  if (link) console.log(`\nSee or adjust it in the studio:\n${link}`);
}

async function check(flags: Flags) {
  const { design, svg, notes } = await prepare(flags);
  const judged = checksOf(design, svg);
  if (flags.json) {
    console.log(
      JSON.stringify(
        {
          ok: !judged.failing,
          passed: judged.passed,
          total: judged.total,
          mark: describe(design),
          checks: judged.checks,
          notes,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`${siteName(design)}: ${describe(design)}\n`);
    console.log(`Checks: ${judged.passed} of ${judged.total} pass`);
    for (const each of judged.checks) console.log(printCheck(each));
    for (const note of notes) console.log(`\nNote: ${note}`);
  }
  if (judged.failing) process.exitCode = 1;
}

async function link(flags: Flags) {
  const design = designFromFlags(flags);
  if (design.source === "svg") {
    throw new UsageError(
      "A link cannot carry an imported SVG: it is too large for an address.",
    );
  }
  console.log(studioLink(design, flags));
}

/** The options a flag takes, one a line, for a person or an agent to read. */
async function list(
  what: string | undefined,
  word: string | undefined,
  json: boolean,
) {
  const lists: Record<string, () => Promise<string[][]> | string[][]> = {
    hues: () =>
      HUES.map((hue) => {
        const ink = applyTreatment(hue, "ink");
        const solid = applyTreatment(hue, "solid");
        return [hue, `ink ${ink.bg}`, `solid ${solid.bg}`];
      }),
    treatments: () => TREATMENTS.map((option) => [option.value, option.hint]),
    fonts: () =>
      FONTS.map((font) => [font.value, font.category, font.weights.join(" ")]),
    icons: async () =>
      Object.keys(await loadIcons())
        .filter(
          (name) =>
            !word ||
            word
              .toLowerCase()
              .split(/\s+/)
              .every((part) => name.includes(part)),
        )
        .map((name) => [name]),
    shapes: () => HALFTONE_SHAPES.map((shape) => [shape.value]),
    presets: () =>
      HALFTONE_PRESETS.map(({ name, halftone }) => [
        name.toLowerCase(),
        `${halftone.shape} ${halftone.mode}, ${halftone.cell} cells, ${halftone.grid}×${halftone.grid}, towards ${halftone.flow}`,
      ]),
    layouts: () => LAYOUTS.map((layout) => [layout]),
    tones: () => TONES.map((tone) => [tone]),
    textures: () => TEXTURES.map((texture) => [texture]),
  };
  const make = what ? lists[what] : undefined;
  if (!make) {
    throw new UsageError(
      `list takes one of: ${Object.keys(lists).join(", ")}.`,
    );
  }
  const rows = await make();
  if (json) {
    console.log(
      JSON.stringify(rows.map((row) => (row.length === 1 ? row[0] : row))),
    );
    return;
  }
  const width = Math.max(...rows.map((row) => row[0].length));
  for (const [first, ...rest] of rows) {
    console.log(
      rest.length > 0 ? `${first.padEnd(width + 2)}${rest.join("  ")}` : first,
    );
  }
  if (what === "icons" && rows.length === 0) {
    console.log(
      `Nothing matches “${word}”. Lucide names are literal: try arrow, chart or heart.`,
    );
  }
}

function version(): string {
  const manifest = join(
    dirname(fileURLToPath(import.meta.url)),
    "../package.json",
  );
  return JSON.parse(readFileSync(manifest, "utf8")).version;
}

async function main() {
  const { values, positionals } = parseArgs({
    options: PARSE_OPTIONS,
    allowPositionals: true,
  });
  const flags = values as Flags;
  const [command, ...rest] = positionals;

  if (flags.version) return console.log(version());
  if (flags.help || !command || command === "help") return console.log(HELP);

  if (command === "build") return build(flags);
  if (command === "check") return check(flags);
  if (command === "link") return link(flags);
  if (command === "list")
    return list(
      rest[0],
      rest.slice(1).join(" ") || undefined,
      Boolean(flags.json),
    );
  throw new UsageError(
    `"${command}" is not a command. They are: build, check, link, list.`,
  );
}

main().catch((error: unknown) => {
  // A mistake in the command is the user's to fix: say it and no more.
  if (error instanceof UsageError) {
    console.error(error.message);
  } else if (
    error instanceof TypeError &&
    "code" in error &&
    String(error.code).startsWith("ERR_PARSE_ARGS")
  ) {
    // Node explains at length; its first sentence is the whole of it.
    console.error(
      `${error.message.split(". ")[0]}. Run with --help for every flag.`,
    );
  } else {
    console.error(error);
  }
  process.exitCode = process.exitCode || 2;
});
