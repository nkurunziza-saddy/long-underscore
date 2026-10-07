/**
 * The icon a mark can be: one of Phosphor's, in one of its six weights. The
 * sets are built into `public/phosphor/` by `scripts/build-icons.mjs` and
 * fetched a weight at a time, so nothing here depends on a CDN.
 */

export type IconWeight =
  | "thin"
  | "light"
  | "regular"
  | "bold"
  | "fill"
  | "duotone";

export const ICON_WEIGHTS: { value: IconWeight; label: string }[] = [
  { value: "thin", label: "Thin" },
  { value: "light", label: "Light" },
  { value: "regular", label: "Regular" },
  { value: "bold", label: "Bold" },
  { value: "fill", label: "Fill" },
  { value: "duotone", label: "Duotone" },
];

/** The side of the box every Phosphor icon is drawn in. */
export const ICON_BOX = 256;

/** One filled shape of an icon. Duotone's wash is a shape drawn faint. */
export interface IconPath {
  d: string;
  opacity?: number;
}
export type IconSet = Record<string, IconPath[]>;

/** A set as its file holds it: a path, or a path and its opacity. */
type PackedSet = Record<string, (string | [string, number])[]>;

export function unpackIcons(packed: PackedSet): IconSet {
  const set: IconSet = {};
  for (const [name, paths] of Object.entries(packed)) {
    set[name] = paths.map((path) =>
      typeof path === "string" ? { d: path } : { d: path[0], opacity: path[1] },
    );
  }
  return set;
}

/** The icon a mark starts as, and falls back to when its own is not known. */
export const FALLBACK_ICON = "lightning";

/** Drawn before (or instead of) the full set, so the first paint never waits. */
export const FALLBACK_ICONS: IconSet = {
  [FALLBACK_ICON]: [
    {
      d: "M219.71,117.38a12,12,0,0,0-7.25-8.52L161.28,88.39l10.59-70.61a12,12,0,0,0-20.64-10l-112,120a12,12,0,0,0,4.31,19.33l51.18,20.47L84.13,238.22a12,12,0,0,0,20.64,10l112-120A12,12,0,0,0,219.71,117.38ZM113.6,203.55l6.27-41.77a12,12,0,0,0-7.41-12.92L68.74,131.37,142.4,52.45l-6.27,41.77a12,12,0,0,0,7.41,12.92l43.72,17.49Z",
    },
  ],
};

const sets = new Map<IconWeight, Promise<IconSet>>();

/** Every icon in one weight, fetched once on demand. */
export function loadIconSet(weight: IconWeight): Promise<IconSet> {
  let set = sets.get(weight);
  if (!set) {
    set = fetch(`/phosphor/${weight}.json`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(unpackIcons)
      .catch(() => {
        sets.delete(weight);
        return FALLBACK_ICONS;
      });
    sets.set(weight, set);
  }
  return set;
}

let words: Promise<Record<string, string>> | null = null;

/**
 * What else each icon can be found by, besides its name: "lightning" is
 * also "power" and "flash".
 */
export function loadIconWords(): Promise<Record<string, string>> {
  if (!words) {
    words = fetch("/phosphor/words.json")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .catch(() => {
        words = null;
        return {};
      });
  }
  return words as Promise<Record<string, string>>;
}

/** The names an icon search finds: every word typed is in the name or its words. */
export function searchIcons(
  names: string[],
  words: Record<string, string>,
  query: string,
): string[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return names;
  const found = (text: string) => terms.every((term) => text.includes(term));
  // An icon named for what was typed comes before one only described by it.
  const named = names.filter((name) => found(name));
  const described = names.filter(
    (name) => !found(name) && found(`${name} ${words[name] ?? ""}`),
  );
  return [...named, ...described];
}

/** Fill an icon into its 256 unit box at the context's current origin. */
export function fillIcon(
  ctx: CanvasRenderingContext2D,
  paths: IconPath[],
  color: string,
) {
  // A faint shape is faint within whatever the caller has already set: the
  // card draws a whole icon as a watermark.
  const alpha = ctx.globalAlpha;
  ctx.fillStyle = color;
  for (const path of paths) {
    ctx.globalAlpha = alpha * (path.opacity ?? 1);
    ctx.fill(new Path2D(path.d));
  }
  ctx.globalAlpha = alpha;
}

/** The same icon as SVG paths; colour comes from the parent group. */
export function iconToSvg(paths: IconPath[]): string {
  return paths
    .map((path) =>
      path.opacity === undefined
        ? `<path d="${path.d}"/>`
        : `<path d="${path.d}" opacity="${path.opacity}"/>`,
    )
    .join("");
}
