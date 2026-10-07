/**
 * Where the renderers get a canvas to draw on. In a browser that is the
 * document; anywhere else (the command line) whoever runs them hands over a
 * canvas of their own with `setCanvasFactory` before drawing anything.
 */
type CanvasFactory = (width: number, height: number) => HTMLCanvasElement;

let factory: CanvasFactory | null = null;

export function setCanvasFactory(next: CanvasFactory) {
  factory = next;
}

/** Whether there is anything to draw on: not while a page renders on a server. */
export function canDraw(): boolean {
  return factory !== null || typeof document !== "undefined";
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  if (factory) return factory(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
