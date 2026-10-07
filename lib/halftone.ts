/**
 * Halftone marks: a simple figure screened onto a square grid, each cell
 * drawn larger or smaller by where it sits. Seven values describe one, and
 * the canvas and the SVG are both drawn from the same path, so they agree
 * exactly.
 */

/** What the cells add up to. `letter` is whatever was typed, screened. */
export type HalftoneShape =
  | "disc"
  | "ring"
  | "diamond"
  | "square"
  | "lens"
  | "triangle"
  | "plus"
  | "heart"
  | "letter";
/** Which cells of the figure are drawn: all of it, its edge, or what is round it. */
export type HalftoneMode = "fill" | "outline" | "cutout";
/** What one cell is. */
export type HalftoneCell = "square" | "soft" | "dot";
/** Where the cells grow towards: a compass point, or the middle. */
export type HalftoneFlow =
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "nw"
  | "centre";

export interface Halftone {
  shape: HalftoneShape;
  mode: HalftoneMode;
  cell: HalftoneCell;
  /** Cells along one side. */
  grid: number;
  /** The space left between two cells, as a share of a cell: 0 joins them. */
  gap: number;
  flow: HalftoneFlow;
  /** How far the cells shrink across the mark: 0 keeps them all alike. */
  fade: number;
}

export const HALFTONE_GRID = { min: 4, max: 12 } as const;
export const HALFTONE_GAP = { min: 0, max: 40 } as const;

export const HALFTONE_SHAPES: { value: HalftoneShape; label: string }[] = [
  { value: "disc", label: "Disc" },
  { value: "ring", label: "Ring" },
  { value: "diamond", label: "Diamond" },
  { value: "square", label: "Square" },
  { value: "lens", label: "Lens" },
  { value: "triangle", label: "Triangle" },
  { value: "plus", label: "Plus" },
  { value: "heart", label: "Heart" },
  { value: "letter", label: "Letter" },
];

export const HALFTONE_MODES: { value: HalftoneMode; label: string }[] = [
  { value: "fill", label: "Filled" },
  { value: "outline", label: "Outline" },
  { value: "cutout", label: "Cut out" },
];

export const HALFTONE_CELLS: { value: HalftoneCell; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "soft", label: "Rounded" },
  { value: "dot", label: "Dot" },
];

/** Laid out as a compass: three rows of three, the middle in the middle. */
export const HALFTONE_FLOWS: { value: HalftoneFlow; label: string }[] = [
  { value: "nw", label: "Top left" },
  { value: "n", label: "Top" },
  { value: "ne", label: "Top right" },
  { value: "w", label: "Left" },
  { value: "centre", label: "Centre" },
  { value: "e", label: "Right" },
  { value: "sw", label: "Bottom left" },
  { value: "s", label: "Bottom" },
  { value: "se", label: "Bottom right" },
];

const DIRECTION: Record<Exclude<HalftoneFlow, "centre">, [number, number]> = {
  n: [0, -1],
  ne: [1, -1],
  e: [1, 0],
  se: [1, 1],
  s: [0, 1],
  sw: [-1, 1],
  w: [-1, 0],
  nw: [-1, -1],
};

/** The share of its size the smallest cell gives up at full fade. */
const DEEPEST = 0.72;
/**
 * Sizes come in a few steps, not a smooth ramp: steps survive being drawn
 * small, and read as drawn on purpose.
 */
const STEPS = 4;

/**
 * Which cells of a grid a figure covers that no rule here can work out: a
 * letter, which only a browser can draw (`lib/letter-mask.ts`).
 */
export interface CellMask {
  grid: number;
  /** Row by row, `grid` × `grid` of them. */
  on: boolean[];
}

/**
 * The grid a figure is laid out on. Cut out of the cells, it is given one
 * cell less on every side, so there are cells left all the way round it.
 */
export function figureGrid(halftone: Pick<Halftone, "grid" | "mode">): number {
  return halftone.mode === "cutout" ? halftone.grid - 2 : halftone.grid;
}

/**
 * Whether the cell centred `u`, `v` from the middle belongs to the shape.
 * Both run from -0.5 to 0.5. The radii give way a little as the grid gets
 * coarser, which is what keeps a disc round at every grid.
 */
function inside(
  shape: Exclude<HalftoneShape, "letter">,
  u: number,
  v: number,
  grid: number,
): boolean {
  const reach = Math.hypot(u, v);
  const rim = 0.5 - 0.18 / grid;
  switch (shape) {
    case "square":
      return true;
    case "disc":
      return reach <= rim;
    case "ring":
      return reach <= rim && reach > 0.21;
    case "diamond":
      return Math.abs(u) + Math.abs(v) <= 0.5 + 1e-6;
    case "lens":
      // Where two discs centred on opposite corners overlap: a leaf.
      return (
        Math.hypot(u + 0.5, v + 0.5) <= 0.97 &&
        Math.hypot(u - 0.5, v - 0.5) <= 0.97
      );
    case "triangle":
      // Half as wide as it is far down, and a quarter of a cell more, so
      // the point is a cell or two and not nothing.
      return Math.abs(u) <= (v + 0.5) / 2 + 0.25 / grid + 1e-6;
    case "plus":
      return Math.min(Math.abs(u), Math.abs(v)) <= 1 / 6 + 1e-6;
    case "heart": {
      // The classic curve (x² + y² − 1)³ = x²y³, fitted to the box.
      const x = u * 2.18;
      const y = 0.14 - v * 2.2;
      return (x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0;
    }
  }
}

/** Row by row, whether each cell of a `grid` × `grid` belongs to the figure. */
function figure(
  shape: HalftoneShape,
  grid: number,
  mask: CellMask | null | undefined,
): boolean[] {
  if (shape === "letter") {
    // A mask made for another grid is a frame behind: draw nothing for it.
    return mask?.grid === grid ? mask.on : new Array(grid * grid).fill(false);
  }
  const on: boolean[] = [];
  for (let row = 0; row < grid; row++) {
    for (let column = 0; column < grid; column++) {
      on.push(
        inside(
          shape,
          (column + 0.5) / grid - 0.5,
          (row + 0.5) / grid - 0.5,
          grid,
        ),
      );
    }
  }
  return on;
}

/** One cell: its centre and its side, as fractions of the box the mark fills. */
export interface Cell {
  x: number;
  y: number;
  side: number;
}

/**
 * Every cell of the mark, in reading order. A `letter` needs the `mask` of
 * its letter, made for `figureGrid(halftone)`; without one it has no cells.
 */
export function halftoneCells(
  halftone: Halftone,
  mask?: CellMask | null,
): Cell[] {
  const { shape, mode, grid, gap, flow, fade } = halftone;
  const inner = figureGrid(halftone);
  const inset = (grid - inner) / 2;
  const shaped = figure(shape, inner, mask);
  const covered = (row: number, column: number) => {
    const r = row - inset;
    const c = column - inset;
    return r >= 0 && c >= 0 && r < inner && c < inner && shaped[r * inner + c];
  };
  const drawn = (row: number, column: number) => {
    if (mode === "cutout") return !covered(row, column);
    if (!covered(row, column)) return false;
    return (
      mode === "fill" ||
      // On the edge: the figure stops on at least one of its four sides.
      !covered(row - 1, column) ||
      !covered(row + 1, column) ||
      !covered(row, column - 1) ||
      !covered(row, column + 1)
    );
  };

  // How strongly each cell is pulled: the further along the flow, the larger.
  const pitch = 1 / grid;
  const pulled: { x: number; y: number; pull: number }[] = [];
  for (let row = 0; row < grid; row++) {
    for (let column = 0; column < grid; column++) {
      if (!drawn(row, column)) continue;
      const u = (column + 0.5) * pitch - 0.5;
      const v = (row + 0.5) * pitch - 0.5;
      const pull =
        flow === "centre"
          ? -Math.hypot(u, v)
          : u * DIRECTION[flow][0] + v * DIRECTION[flow][1];
      pulled.push({ x: u + 0.5, y: v + 0.5, pull });
    }
  }
  if (pulled.length === 0) return [];

  const most = Math.max(...pulled.map((cell) => cell.pull));
  const least = Math.min(...pulled.map((cell) => cell.pull));
  const span = most - least || 1;
  const largest = pitch * (1 - gap / 100);

  return pulled.map(({ x, y, pull }) => {
    const step = Math.round(((most - pull) / span) * (STEPS - 1)) / (STEPS - 1);
    return { x, y, side: largest * (1 - DEEPEST * (fade / 100) * step) };
  });
}

const trim = (value: number) => String(Math.round(value * 100) / 100);

/**
 * The whole mark as one SVG path, filling a square `side` wide whose top
 * left corner is at `x`, `y`. Cells that touch are one shape to whatever
 * fills the path, so a mark with no gap has no seams. Written to two
 * decimals: draw it in a box of 16 units or more.
 */
export function halftonePath(
  halftone: Halftone,
  x: number,
  y: number,
  side: number,
  mask?: CellMask | null,
): string {
  let path = "";
  for (const cell of halftoneCells(halftone, mask)) {
    const size = cell.side * side;
    const left = x + cell.x * side - size / 2;
    const top = y + cell.y * side - size / 2;
    if (halftone.cell === "dot") {
      const r = trim(size / 2);
      const across = trim(size);
      path += `M${trim(left)} ${trim(top + size / 2)}a${r} ${r} 0 1 0 ${across} 0a${r} ${r} 0 1 0 -${across} 0z`;
    } else if (halftone.cell === "soft") {
      const r = trim(size * 0.3);
      const edge = trim(size * 0.4);
      path += `M${trim(left + size * 0.3)} ${trim(top)}h${edge}a${r} ${r} 0 0 1 ${r} ${r}v${edge}a${r} ${r} 0 0 1 -${r} ${r}h-${edge}a${r} ${r} 0 0 1 -${r} -${r}v-${edge}a${r} ${r} 0 0 1 ${r} -${r}z`;
    } else {
      const edge = trim(size);
      path += `M${trim(left)} ${trim(top)}h${edge}v${edge}h-${edge}z`;
    }
  }
  return path;
}

/** What a preset says about itself; the rest is the plain halftone's. */
const PLAIN: Halftone = {
  shape: "disc",
  mode: "fill",
  cell: "square",
  grid: 6,
  gap: 15,
  flow: "sw",
  fade: 90,
};

const preset = (name: string, changes: Partial<Halftone> = {}) => ({
  name,
  halftone: { ...PLAIN, ...changes },
});

/** Marks worth starting from. The first is the plainest of them. */
export const HALFTONE_PRESETS: { name: string; halftone: Halftone }[] = [
  preset("Halftone"),
  preset("Pulse", { cell: "dot", grid: 7, flow: "centre", fade: 85 }),
  preset("Orbit", { shape: "ring", cell: "dot", flow: "ne", fade: 80 }),
  preset("Prism", { shape: "diamond", grid: 7, flow: "s" }),
  preset("Drift", { shape: "square", grid: 5, flow: "se", fade: 100 }),
  preset("Leaf", { shape: "lens", cell: "dot", grid: 7, flow: "ne", fade: 75 }),
  preset("Bloom", { cell: "soft", grid: 5, flow: "n", fade: 70 }),
  preset("Eclipse", { shape: "ring", grid: 8, flow: "w" }),
  preset("Ember", {
    shape: "diamond",
    cell: "dot",
    grid: 5,
    flow: "centre",
    fade: 70,
  }),
  preset("Tide", {
    shape: "square",
    cell: "soft",
    grid: 4,
    flow: "e",
    fade: 80,
  }),
  preset("Core", {
    shape: "square",
    cell: "dot",
    flow: "centre",
    fade: 100,
  }),
  preset("Grid", { cell: "dot", grid: 5, flow: "n", fade: 0 }),
  preset("Dissolve", { grid: 9, gap: 0, flow: "w", fade: 100 }),
  preset("Summit", {
    shape: "triangle",
    grid: 8,
    gap: 0,
    flow: "s",
    fade: 100,
  }),
  preset("Frame", {
    shape: "square",
    mode: "outline",
    grid: 5,
    flow: "nw",
    fade: 60,
  }),
  preset("Signal", {
    shape: "plus",
    cell: "dot",
    grid: 7,
    flow: "centre",
    fade: 80,
  }),
  preset("Aperture", {
    mode: "cutout",
    cell: "dot",
    grid: 8,
    flow: "centre",
    fade: 0,
    gap: 20,
  }),
  preset("Heartbeat", { shape: "heart", grid: 9, gap: 0, flow: "n", fade: 85 }),
];
