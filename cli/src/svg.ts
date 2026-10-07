import { KEEP_ROOT_ATTRS, type SvgSource } from "../../lib/svg-source";

/**
 * Read an SVG file without a DOM, into what the studio's own parser makes of
 * one in a browser. The file is the user's own and is only ever drawn and
 * nested, never run, but scripts and event handlers are dropped all the
 * same, since the result is written into files that ship.
 */
export function parseSvgText(source: string): SvgSource | null {
  const cleaned = source
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<script\b[^>]*\/>/gi, "")
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(
      /\s[\w:-]+\s*=\s*("\s*javascript:[^"]*"|'\s*javascript:[^']*')/gi,
      "",
    );

  const open = cleaned.match(/<svg\b([^>]*)>/i);
  const close = cleaned.lastIndexOf("</svg");
  if (!open || open.index === undefined || close < 0) return null;
  const inner = cleaned.slice(open.index + open[0].length, close).trim();

  const attrs = new Map<string, string>();
  for (const [, name, , double, single] of open[1].matchAll(
    /([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g,
  )) {
    attrs.set(name, double ?? single ?? "");
  }

  const hadViewBox = attrs.has("viewBox");
  let viewBox = (attrs.get("viewBox") ?? "")
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (viewBox.length !== 4 || viewBox.some(Number.isNaN)) {
    const width = Number.parseFloat(attrs.get("width") ?? "") || 24;
    const height = Number.parseFloat(attrs.get("height") ?? "") || 24;
    viewBox = [0, 0, width, height];
  }
  if (viewBox[2] <= 0 || viewBox[3] <= 0) return null;

  const rootAttrs = KEEP_ROOT_ATTRS.filter((name) => attrs.has(name))
    .map((name) => `${name}="${attrs.get(name)?.replace(/"/g, "&quot;")}"`)
    .join(" ");
  // An explicit pixel size gives the decoded image a reliable size of its own.
  const longest = Math.max(viewBox[2], viewBox[3]);
  const size = `width="${(viewBox[2] / longest) * 1024}" height="${(viewBox[3] / longest) * 1024}"`;

  return {
    markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.join(" ")}" ${size} ${rootAttrs}>${inner}</svg>`,
    inner,
    viewBox: viewBox as [number, number, number, number],
    rootAttrs,
    bytes: Buffer.byteLength(source),
    hasText: /<text[\s>]/i.test(inner),
    hasRaster: /<image[\s>]/i.test(inner),
    hadViewBox,
  };
}
