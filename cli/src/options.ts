import { readFileSync } from "node:fs";
import type { ParseArgsConfig } from "node:util";
import { normalizeHex } from "../../lib/color";
import {
  applyTreatment,
  DEFAULT_DESIGN,
  type Design,
  HUES,
  type Hue,
  TREATMENTS,
  type Treatment,
  withHalftone,
} from "../../lib/design";
import { FONTS, nearestWeight } from "../../lib/fonts";
import {
  HALFTONE_CELLS,
  HALFTONE_FLOWS,
  HALFTONE_MODES,
  HALFTONE_PRESETS,
  HALFTONE_SHAPES,
} from "../../lib/halftone";
import { decodeDesign, sanitizeDesign } from "../../lib/share";

/** A mistake in how the command was written: said plainly, with what would work. */
export class UsageError extends Error {}

export const LAYOUTS = ["statement", "centered", "split", "poster"] as const;
export const TONES = ["ink", "paper", "brand"] as const;
export const TEXTURES = ["none", "grid", "dots", "glow", "halftone"] as const;

/** Every flag that describes the design, with the line `--help` prints for it. */
const DESIGN_FLAGS = {
  from: "A studio link, or a design .json, to start from",
  name: "The site's name",
  description: "One or two sentences on what it is",
  url: "Its address, such as acme.com",

  letter: "Mark: one or two characters (default: the name's initial)",
  font: "Typeface id (see: list fonts)",
  weight: "Font weight, such as 700",
  icon: "Mark: a Lucide icon by name (see: list icons <word>)",
  stroke: "Icon stroke width, 1 to 3",
  halftone: "Mark: a halftone, from a preset (see: list presets)",
  shape: "Halftone shape (see: list shapes)",
  draw: "Halftone drawn as: fill, outline or cutout",
  cells: "Halftone cells: square, soft or dot",
  grid: "Halftone cells along a side, 4 to 12",
  gap: "Space between halftone cells, 0 to 40 (0 joins them)",
  flow: "Where halftone cells grow towards: n ne e se s sw w nw centre",
  fade: "How far halftone cells shrink across the mark, 0 to 100",
  svg: "Mark: your own .svg file",

  hue: "Colour family (see: list hues). Dark neutrals come first",
  treatment: "How the hue is worn: ink, solid, fade, soft, paper or ghost",
  fg: "Exact glyph colour, as hex",
  bg: "Exact plate colour, as hex",
  bg2: "Second plate colour, for a gradient",
  size: "Glyph size as a percentage of the plate, 20 to 100",
  corners: "Plate corners, 0 (square) to 100 (circle)",

  title: "Card headline (default: the name)",
  tagline: "Card tagline (default: the description)",
  layout: "Card layout: statement, centered, split or poster",
  tone: "Card tone: ink, paper or brand",
  texture: "Card texture: none, grid, dots, glow or halftone",
} as const;

const DESIGN_SWITCHES = {
  "no-plate": "Draw the glyph alone, with no plate behind it",
  "no-adaptive": "Do not restyle icon.svg for dark browser chrome",
} as const;

type DesignFlag = keyof typeof DESIGN_FLAGS;
export type Flags = Partial<Record<DesignFlag, string>> &
  Partial<Record<keyof typeof DESIGN_SWITCHES, boolean>> & {
    target?: string;
    out?: string;
    studio?: string;
    "dry-run"?: boolean;
    json?: boolean;
    fix?: boolean;
    offline?: boolean;
    help?: boolean;
    version?: boolean;
  };

export const PARSE_OPTIONS = {
  ...Object.fromEntries(
    Object.keys(DESIGN_FLAGS).map((name) => [name, { type: "string" }]),
  ),
  ...Object.fromEntries(
    Object.keys(DESIGN_SWITCHES).map((name) => [name, { type: "boolean" }]),
  ),
  target: { type: "string" },
  out: { type: "string" },
  studio: { type: "string" },
  "dry-run": { type: "boolean" },
  json: { type: "boolean" },
  fix: { type: "boolean" },
  offline: { type: "boolean" },
  help: { type: "boolean", short: "h" },
  version: { type: "boolean", short: "v" },
} as NonNullable<ParseArgsConfig["options"]>;

/** The design flags as `--help` lists them. */
export function describeFlags(): string {
  const rows = [
    ...Object.entries(DESIGN_FLAGS).map(
      ([name, help]) => [`--${name} <value>`, help] as const,
    ),
    ...Object.entries(DESIGN_SWITCHES).map(
      ([name, help]) => [`--${name}`, help] as const,
    ),
  ];
  return rows.map(([flag, help]) => `  ${flag.padEnd(24)}${help}`).join("\n");
}

function oneOf<T extends string>(
  flag: string,
  value: string,
  allowed: readonly T[],
): T {
  const match = allowed.find(
    (option) => option.toLowerCase() === value.toLowerCase(),
  );
  if (match) return match;
  throw new UsageError(
    `--${flag} "${value}" is not one of: ${allowed.join(", ")}.`,
  );
}

function number(flag: string, value: string): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;
  throw new UsageError(`--${flag} takes a number, and "${value}" is not one.`);
}

function hex(flag: string, value: string): string {
  const colour = normalizeHex(value);
  if (colour) return colour;
  throw new UsageError(
    `--${flag} takes a hex colour such as #111213, and "${value}" is not one.`,
  );
}

/** The design a `--from` names: a studio link, or a JSON file of a design. */
function startingDesign(from: string | undefined): Design {
  if (!from) return { ...DEFAULT_DESIGN };
  const encoded = from.match(/[#&]d=([\w-]+)/)?.[1];
  if (encoded) {
    const shared = decodeDesign(encoded);
    if (shared) return shared;
    throw new UsageError(
      "--from is a studio link, but its design cannot be read.",
    );
  }
  try {
    return sanitizeDesign(JSON.parse(readFileSync(from, "utf8")));
  } catch {
    throw new UsageError(
      `--from "${from}" is neither a studio link nor a readable design .json.`,
    );
  }
}

/** The letter a name suggests for its mark. */
const initialOf = (name: string) => [...name.trim()][0]?.toUpperCase();

const HALFTONE_FLAGS = [
  "halftone",
  "shape",
  "draw",
  "cells",
  "grid",
  "gap",
  "flow",
  "fade",
] as const;

/** The size a halftone is given unless one was asked for: cells need the room. */
const HALFTONE_SIZE = 76;

/**
 * Turn the flags into a design. Each flag changes one thing and the rest is
 * the starting design's; whatever comes out has been through the same
 * sanitising as a share link, so it is always something the studio can draw.
 */
export function designFromFlags(flags: Flags): Design {
  const design = startingDesign(flags.from);
  const patch: Partial<Design> = {};
  const set = <K extends keyof Design>(key: K, value: Design[K]) => {
    patch[key] = value;
  };

  if (flags.name !== undefined) set("name", flags.name);
  if (flags.description !== undefined) set("description", flags.description);
  if (flags.url !== undefined) set("url", flags.url);

  // What the mark is: the last kind named wins, and a name alone gives its initial.
  if (flags.svg !== undefined) set("source", "svg");
  else if (flags.icon !== undefined) set("source", "icon");
  else if (HALFTONE_FLAGS.some((flag) => flags[flag] !== undefined)) {
    set("source", "halftone");
  } else if (flags.letter !== undefined) set("source", "letter");

  if (flags.letter !== undefined) set("text", flags.letter);
  else if (flags.name !== undefined && !flags.from) {
    const initial = initialOf(flags.name);
    if (initial) set("text", initial);
  }
  if (flags.icon !== undefined) set("icon", flags.icon.toLowerCase());
  if (flags.stroke !== undefined) set("stroke", number("stroke", flags.stroke));

  if (flags.font !== undefined) {
    set(
      "font",
      oneOf(
        "font",
        flags.font,
        FONTS.map((font) => font.value),
      ),
    );
  }
  if (flags.weight !== undefined) set("weight", number("weight", flags.weight));

  if (flags.halftone !== undefined) {
    const preset = HALFTONE_PRESETS.find(
      (option) => option.name.toLowerCase() === flags.halftone?.toLowerCase(),
    );
    if (!preset) {
      throw new UsageError(
        `--halftone "${flags.halftone}" is not a preset. They are: ${HALFTONE_PRESETS.map((option) => option.name.toLowerCase()).join(", ")}.`,
      );
    }
    Object.assign(patch, withHalftone(preset.halftone));
  }
  if (flags.shape !== undefined) {
    set(
      "htShape",
      oneOf(
        "shape",
        flags.shape,
        HALFTONE_SHAPES.map((shape) => shape.value),
      ),
    );
  }
  if (flags.draw !== undefined) {
    set(
      "htMode",
      oneOf(
        "draw",
        flags.draw,
        HALFTONE_MODES.map((mode) => mode.value),
      ),
    );
  }
  if (flags.cells !== undefined) {
    set(
      "htCell",
      oneOf(
        "cells",
        flags.cells,
        HALFTONE_CELLS.map((cell) => cell.value),
      ),
    );
  }
  if (flags.flow !== undefined) {
    set(
      "htFlow",
      oneOf(
        "flow",
        flags.flow,
        HALFTONE_FLOWS.map((flow) => flow.value),
      ),
    );
  }
  if (flags.grid !== undefined) set("htGrid", number("grid", flags.grid));
  if (flags.gap !== undefined) set("htGap", number("gap", flags.gap));
  if (flags.fade !== undefined) set("htFade", number("fade", flags.fade));
  if (
    patch.source === "halftone" &&
    design.source !== "halftone" &&
    flags.size === undefined
  ) {
    set("scale", Math.max(design.scale, HALFTONE_SIZE));
  }

  // Colour: a hue and a treatment resolve to exact colours; exact colours
  // given by hand make the treatment custom.
  if (flags.hue !== undefined || flags.treatment !== undefined) {
    const hue =
      flags.hue === undefined
        ? design.hue
        : (oneOf("hue", flags.hue, HUES) as Hue);
    const treatment =
      flags.treatment === undefined
        ? design.treatment === "custom"
          ? "ink"
          : design.treatment
        : oneOf(
            "treatment",
            flags.treatment,
            TREATMENTS.map((option) => option.value),
          );
    Object.assign(
      patch,
      applyTreatment(hue, treatment as Exclude<Treatment, "custom">),
    );
  }
  if (flags.fg !== undefined) set("fg", hex("fg", flags.fg));
  if (flags.bg !== undefined) set("bg", hex("bg", flags.bg));
  if (flags.bg2 !== undefined) set("bg2", hex("bg2", flags.bg2));
  if (flags["no-plate"]) set("transparent", true);
  if (
    flags.fg !== undefined ||
    flags.bg !== undefined ||
    flags.bg2 !== undefined ||
    flags["no-plate"]
  ) {
    set("treatment", "custom");
  }
  if (flags["no-adaptive"]) set("adaptive", false);

  if (flags.size !== undefined) set("scale", number("size", flags.size));
  if (flags.corners !== undefined)
    set("radius", number("corners", flags.corners));

  if (flags.title !== undefined) set("ogTitle", flags.title);
  if (flags.tagline !== undefined) set("ogTagline", flags.tagline);
  if (flags.layout !== undefined) {
    set("ogLayout", oneOf("layout", flags.layout, LAYOUTS));
  }
  if (flags.tone !== undefined) set("ogTone", oneOf("tone", flags.tone, TONES));
  if (flags.texture !== undefined) {
    set("ogPattern", oneOf("texture", flags.texture, TEXTURES));
  }
  if (flags.target !== undefined) {
    set("target", oneOf("target", flags.target, ["html", "next"] as const));
  }

  const merged = { ...design, ...patch };
  // A weight the face does not have becomes the nearest it does.
  merged.weight = nearestWeight(merged.font, merged.weight);
  return sanitizeDesign(merged);
}
