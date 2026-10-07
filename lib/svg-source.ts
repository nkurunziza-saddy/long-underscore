import { createCanvas } from "./canvas";
import { hexToHsl, rgbToHex } from "./color";

export interface SvgSource {
  /** Cleaned markup with an explicit viewBox, safe to rasterise or nest. */
  markup: string;
  /** Everything inside the root element. */
  inner: string;
  viewBox: [number, number, number, number];
  /** Root attributes worth keeping when the art is nested in a plate. */
  rootAttrs: string;
  bytes: number;
  hasText: boolean;
  hasRaster: boolean;
  hadViewBox: boolean;
}

export const KEEP_ROOT_ATTRS = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "fill-rule",
  "clip-rule",
  "color",
  "style",
];

/**
 * Parse pasted or dropped SVG. Scripts, event handlers and foreign content
 * are stripped: the art is only ever drawn through an <img>, but it is also
 * written into the files people ship.
 */
export function parseSvg(source: string): SvgSource | null {
  if (!source.trim() || typeof DOMParser === "undefined") return null;
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  const root = doc.documentElement;
  if (doc.querySelector("parsererror") || root.nodeName !== "svg") return null;

  for (const node of root.querySelectorAll("script, foreignObject")) {
    node.remove();
  }
  for (const node of [root, ...root.querySelectorAll("*")]) {
    for (const attr of [...node.attributes]) {
      const value = attr.value.trim().toLowerCase();
      if (attr.name.startsWith("on") || value.startsWith("javascript:")) {
        node.removeAttribute(attr.name);
      }
    }
  }

  const hadViewBox = root.hasAttribute("viewBox");
  let viewBox = (root.getAttribute("viewBox") ?? "")
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (viewBox.length !== 4 || viewBox.some(Number.isNaN)) {
    const width = Number.parseFloat(root.getAttribute("width") ?? "") || 24;
    const height = Number.parseFloat(root.getAttribute("height") ?? "") || 24;
    viewBox = [0, 0, width, height];
  }
  if (viewBox[2] <= 0 || viewBox[3] <= 0) return null;

  root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  root.setAttribute("viewBox", viewBox.join(" "));
  // Explicit pixel size gives the decoded image a reliable intrinsic size.
  const longest = Math.max(viewBox[2], viewBox[3]);
  root.setAttribute("width", String((viewBox[2] / longest) * 1024));
  root.setAttribute("height", String((viewBox[3] / longest) * 1024));

  const serializer = new XMLSerializer();
  const inner = [...root.childNodes]
    .map((node) => serializer.serializeToString(node))
    .join("");
  const rootAttrs = KEEP_ROOT_ATTRS.filter((name) => root.hasAttribute(name))
    .map(
      (name) => `${name}="${root.getAttribute(name)?.replace(/"/g, "&quot;")}"`,
    )
    .join(" ");

  return {
    markup: serializer.serializeToString(root),
    inner,
    viewBox: viewBox as [number, number, number, number],
    rootAttrs,
    bytes: new Blob([source]).size,
    hasText: root.querySelector("text") !== null,
    hasRaster: root.querySelector("image") !== null,
    hadViewBox,
  };
}

export function loadSvgImage(markup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(
      new Blob([markup], { type: "image/svg+xml;charset=utf-8" }),
    );
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode SVG"));
    };
    image.src = url;
  });
}

/**
 * The colour that best represents a piece of artwork: an average of its
 * opaque pixels, weighted towards the saturated ones so a brand colour wins
 * over black outlines and white fills.
 */
export function dominantColor(image: CanvasImageSource): string {
  const size = 32;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "#0a0a0a";
  ctx.drawImage(image, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let r = 0;
  let g = 0;
  let b = 0;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const { s } = hexToHsl(rgbToHex(data[i], data[i + 1], data[i + 2]));
    const weight = (s / 100) ** 2 + 0.02;
    r += data[i] * weight;
    g += data[i + 1] * weight;
    b += data[i + 2] * weight;
    total += weight;
  }
  return total > 0 ? rgbToHex(r / total, g / total, b / total) : "#0a0a0a";
}
