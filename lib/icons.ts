/** One SVG element in Lucide's 24×24 grid: `[tag, attributes]`. */
export type IconNode = [string, Record<string, string | number>];
export type IconSet = Record<string, IconNode[]>;

/** Drawn before (or instead of) the full set, so the first paint never waits. */
export const FALLBACK_ICONS: IconSet = {
  zap: [
    [
      "path",
      {
        d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      },
    ],
  ],
};

let iconSet: Promise<IconSet> | null = null;

/** The full Lucide set, bundled at /lucide.json and fetched once on demand. */
export function loadIconSet(): Promise<IconSet> {
  if (!iconSet) {
    iconSet = fetch("/lucide.json")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .catch(() => {
        iconSet = null;
        return FALLBACK_ICONS;
      });
  }
  return iconSet as Promise<IconSet>;
}

const num = (value: string | number | undefined) => Number(value ?? 0);

function nodeToPath(tag: string, attrs: IconNode[1]): Path2D | null {
  const path = new Path2D();
  switch (tag) {
    case "path":
      return new Path2D(String(attrs.d));
    case "circle":
      path.arc(num(attrs.cx), num(attrs.cy), num(attrs.r), 0, Math.PI * 2);
      return path;
    case "ellipse":
      path.ellipse(
        num(attrs.cx),
        num(attrs.cy),
        num(attrs.rx),
        num(attrs.ry),
        0,
        0,
        Math.PI * 2,
      );
      return path;
    case "rect":
      path.roundRect(
        num(attrs.x),
        num(attrs.y),
        num(attrs.width),
        num(attrs.height),
        num(attrs.rx ?? attrs.ry),
      );
      return path;
    case "line":
      path.moveTo(num(attrs.x1), num(attrs.y1));
      path.lineTo(num(attrs.x2), num(attrs.y2));
      return path;
    case "polyline":
    case "polygon": {
      const points = String(attrs.points)
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      for (let i = 0; i + 1 < points.length; i += 2) {
        if (i === 0) path.moveTo(points[i], points[i + 1]);
        else path.lineTo(points[i], points[i + 1]);
      }
      if (tag === "polygon") path.closePath();
      return path;
    }
    default:
      return null;
  }
}

/** Stroke an icon into a 24×24 box at the context's current origin. */
export function strokeIcon(
  ctx: CanvasRenderingContext2D,
  nodes: IconNode[],
  color: string,
  strokeWidth: number,
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [tag, attrs] of nodes) {
    const path = nodeToPath(tag, attrs);
    if (!path) continue;
    if (attrs.fill && attrs.fill !== "none") ctx.fill(path);
    ctx.stroke(path);
  }
}

/** The same icon as SVG child elements; colour comes from the parent group. */
export function iconToSvg(nodes: IconNode[]): string {
  return nodes
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .map(([key, value]) =>
          key === "fill" && value !== "none"
            ? 'fill="currentColor"'
            : `${key}="${value}"`,
        )
        .join(" ");
      return `<${tag} ${attributes}/>`;
    })
    .join("");
}
