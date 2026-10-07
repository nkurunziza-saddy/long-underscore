import { normalizeHex } from "./color";
import { applyTreatment, DEFAULT_DESIGN, type Design, HUES } from "./design";
import { FONTS, nearestWeight } from "./fonts";
import {
  HALFTONE_CELLS,
  HALFTONE_FLOWS,
  HALFTONE_GAP,
  HALFTONE_GRID,
  HALFTONE_MODES,
  HALFTONE_SHAPES,
} from "./halftone";
import { ICON_WEIGHTS } from "./icons";

const HASH_KEY = "d";

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(
    Uint8Array.from(binary, (char) => char.charCodeAt(0)),
  );
}

/**
 * A link says only what differs from the defaults, so it means something
 * else once a default changes. Each link carries the version of the defaults
 * it was written against; a link with none is from when the default mark
 * was emerald, and is read against that.
 */
const LINK_VERSION = 2;
const FIRST_LOOK = applyTreatment("emerald", "solid");

/** Only what differs from the defaults goes in the link, so links stay short. */
export function encodeDesign(design: Design): string {
  const diff: Record<string, unknown> = { v: LINK_VERSION };
  for (const key of Object.keys(DEFAULT_DESIGN) as (keyof Design)[]) {
    if (design[key] !== DEFAULT_DESIGN[key]) diff[key] = design[key];
  }
  return toBase64Url(JSON.stringify(diff));
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const ENUMS: { [K in keyof Design]?: readonly Design[K][] } = {
  source: ["letter", "icon", "halftone", "svg"],
  iconWeight: ICON_WEIGHTS.map((weight) => weight.value),
  htShape: HALFTONE_SHAPES.map((shape) => shape.value),
  htMode: HALFTONE_MODES.map((mode) => mode.value),
  htCell: HALFTONE_CELLS.map((cell) => cell.value),
  htFlow: HALFTONE_FLOWS.map((flow) => flow.value),
  treatment: ["solid", "fade", "ink", "soft", "paper", "ghost", "custom"],
  ogLayout: ["statement", "centered", "split", "poster"],
  ogTone: ["brand", "ink", "paper"],
  ogPattern: ["none", "grid", "dots", "glow", "halftone"],
  target: ["html", "next"],
  hue: HUES,
  font: FONTS.map((font) => font.value),
};

/**
 * Turn untrusted input (a share link, old localStorage) into a valid design.
 * Unknown keys are dropped and every value is checked against its type, so a
 * hand-edited link can never put the studio in a state it cannot draw.
 */
export function sanitizeDesign(input: unknown): Design {
  const design: Design = { ...DEFAULT_DESIGN };
  if (typeof input !== "object" || input === null) return design;
  const raw = input as Record<string, unknown>;
  const target = design as unknown as Record<string, unknown>;

  for (const key of Object.keys(DEFAULT_DESIGN) as (keyof Design)[]) {
    const value = raw[key];
    const fallback = DEFAULT_DESIGN[key];
    const allowed = ENUMS[key] as readonly unknown[] | undefined;
    if (value === undefined) continue;
    if (allowed) {
      if (allowed.includes(value)) target[key] = value;
    } else if (key === "fg" || key === "bg") {
      target[key] =
        (typeof value === "string" && normalizeHex(value)) || fallback;
    } else if (key === "bg2") {
      target[key] = typeof value === "string" ? normalizeHex(value) : null;
    } else if (typeof fallback === "number") {
      if (typeof value === "number" && Number.isFinite(value))
        target[key] = value;
    } else if (typeof fallback === "boolean") {
      if (typeof value === "boolean") target[key] = value;
    } else if (typeof fallback === "string") {
      if (typeof value === "string") target[key] = value.slice(0, 400);
    }
  }

  design.scale = clamp(Math.round(design.scale), 20, 100);
  design.radius = clamp(Math.round(design.radius), 0, 100);
  design.htGrid = clamp(
    Math.round(design.htGrid),
    HALFTONE_GRID.min,
    HALFTONE_GRID.max,
  );
  design.htGap = clamp(
    Math.round(design.htGap),
    HALFTONE_GAP.min,
    HALFTONE_GAP.max,
  );
  design.htFade = clamp(Math.round(design.htFade), 0, 100);
  design.weight = nearestWeight(design.font, design.weight);
  design.text = design.text.slice(0, 12);
  return design;
}

export function decodeDesign(encoded: string): Design | null {
  try {
    const diff = JSON.parse(fromBase64Url(encoded));
    return sanitizeDesign(
      diff?.v === LINK_VERSION ? diff : { ...FIRST_LOOK, ...diff },
    );
  } catch {
    return null;
  }
}

export function shareUrl(design: Design, location: Location): string {
  return `${location.origin}${location.pathname}#${HASH_KEY}=${encodeDesign(design)}`;
}

/** Links from before the redesign carried two dozen query parameters. */
function readLegacyQuery(search: string): Design | null {
  const params = new URLSearchParams(search);
  if (!params.has("text") && !params.has("fontColor") && !params.has("mode")) {
    return null;
  }
  const mode = params.get("mode");
  const number = (key: string) =>
    params.has(key) ? Number(params.get(key)) : undefined;
  const background = params.get("backgroundColor") ?? "";
  const stops = background.match(/#[0-9a-fA-F]{3,6}/g) ?? [];
  return sanitizeDesign({
    // What such a link left unsaid was the look of its day.
    fg: FIRST_LOOK.fg,
    bg: FIRST_LOOK.bg,
    source: mode === "icon" || mode === "svg" ? mode : "letter",
    text: params.get("text") ?? undefined,
    icon: params
      .get("iconName")
      ?.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase(),
    font: params.get("selectedFont") ?? undefined,
    weight: number("fontWeight"),
    scale: number("fontSize"),
    radius: number("borderRadius"),
    ...(params.get("fontColor") ? { fg: params.get("fontColor") } : {}),
    ...(stops[0] ? { bg: stops[0] } : {}),
    bg2: stops.length > 1 ? stops[stops.length - 1] : null,
    hue: params.get("selectedColorFamily") ?? undefined,
    treatment: "custom",
    name: params.get("appName") ?? undefined,
    description: params.get("description") ?? undefined,
    url: params.get("siteUrl") ?? undefined,
    ogTitle: params.get("ogTitle") ?? undefined,
    ogTagline: params.get("ogDescription") ?? undefined,
  });
}

/** A design carried by the current URL, in either the new or the old format. */
export function readSharedDesign(location: Location): Design | null {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const encoded = hash.get(HASH_KEY);
  if (encoded) return decodeDesign(encoded);
  return readLegacyQuery(location.search);
}
