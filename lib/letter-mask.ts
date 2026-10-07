import { canDraw, createCanvas } from "./canvas";
import { getCSSFontFamily } from "./fonts";
import type { CellMask } from "./halftone";

/** Pixels sampled along one side of a cell. */
const SAMPLES = 10;

/**
 * How much of a cell the ink has to cover for the cell to be drawn. Under a
 * half, because a curve or a diagonal never fills the cells it passes
 * through, and at a half an S loses its sides.
 */
const ENOUGH = 0.4;

/**
 * Sizes the letter is tried at, as a share of the grid. A letter rarely
 * lands on a grid cleanly; a few percent smaller, its strokes often do.
 */
const FITS = [1, 0.96, 0.92, 0.88, 0.84];

/** How much of each cell of the grid the ink covers, 0 to 1, row by row. */
function coverage(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: (px: number) => string,
  grid: number,
  fit: number,
): number[] {
  const size = grid * SAMPLES;
  ctx.clearRect(0, 0, size, size);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Fit the ink, not the em box, to the grid: the longer of its two sides
  // fills it, whatever the font's metrics claim.
  ctx.font = font(size);
  let ink = ctx.measureText(text);
  const longest = Math.max(
    ink.actualBoundingBoxLeft + ink.actualBoundingBoxRight,
    ink.actualBoundingBoxAscent + ink.actualBoundingBoxDescent,
  );
  if (longest <= 0) return [];
  ctx.font = font((size * size * fit) / longest);
  ink = ctx.measureText(text);
  const width = ink.actualBoundingBoxLeft + ink.actualBoundingBoxRight;
  const height = ink.actualBoundingBoxAscent + ink.actualBoundingBoxDescent;
  ctx.fillText(
    text,
    (size - width) / 2 + ink.actualBoundingBoxLeft,
    (size - height) / 2 + ink.actualBoundingBoxAscent,
  );

  const { data } = ctx.getImageData(0, 0, size, size);
  const cells: number[] = [];
  for (let row = 0; row < grid; row++) {
    for (let column = 0; column < grid; column++) {
      let alpha = 0;
      for (let y = 0; y < SAMPLES; y++) {
        const start = ((row * SAMPLES + y) * size + column * SAMPLES) * 4 + 3;
        for (let x = 0; x < SAMPLES; x++) alpha += data[start + x * 4];
      }
      cells.push(alpha / (SAMPLES * SAMPLES * 255));
    }
  }
  return cells;
}

/**
 * Screen a letter onto a grid: which cells its ink covers enough of. Of the
 * sizes tried, the one kept is the one whose cells are most decided, nearly
 * full or nearly empty, which is where a letter's strokes line up with the
 * grid and it reads best.
 *
 * Draws with whatever of the face has loaded, so make it again once the font
 * arrives. `null` where there is no canvas, or nothing to draw.
 */
export function letterMask(
  text: string,
  fontValue: string,
  weight: number,
  grid: number,
): CellMask | null {
  if (!canDraw() || !text.trim() || grid < 1) return null;
  const canvas = createCanvas(grid * SAMPLES, grid * SAMPLES);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const family = getCSSFontFamily(fontValue);
  const font = (px: number) => `${weight} ${px}px ${family}`;

  let best: number[] = [];
  let bestScore = -1;
  for (const fit of FITS) {
    const cells = coverage(ctx, text.trim(), font, grid, fit);
    // Only the cells the ink reaches are judged, or a smaller letter would
    // win for the empty cells round it.
    const inked = cells.filter((cell) => cell > 0.02);
    if (inked.length === 0) continue;
    const score =
      inked.reduce((sum, cell) => sum + Math.abs(cell - ENOUGH), 0) /
      inked.length;
    // A smaller fit has to be clearly better to be worth the size it costs.
    if (score > bestScore * 1.02) {
      best = cells;
      bestScore = score;
    }
  }
  if (best.length === 0) return null;
  return { grid, on: best.map((cell) => cell >= ENOUGH) };
}
