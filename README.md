# _ (long underscore)

One mark, every surface it has to live on.

Design a mark once (a letter, a Phosphor icon, a halftone, or your own SVG) and see it
where it will actually appear: a browser tab on light and dark chrome, a
16px pixel loupe, an iOS and an Android home screen, a search result and a
link preview. Then export a small, correct kit instead of a folder of sixty
PNGs.

Live at [longunderscore.vercel.app](https://longunderscore.vercel.app).

## What it believes

- **A favicon is judged at 16 pixels.** The stage shows the real pixels,
  magnified, next to the pretty version. The page's own tab wears your mark
  while you work.
- **One brand, one design.** Mark, colours and typeface are a single object.
  The social card is derived from it, so it cannot drift off-brand.
- **Colour is a hue and a treatment, not sixty swatches.** Six treatments
  (solid, fade, ink, soft, paper, ghost) are computed per hue by measured
  contrast; every combination clears 3:1.
- **The tool should have opinions.** The verdict panel checks letter count,
  stroke weight, contrast, size and tab-strip survival, and offers one-click
  fixes.
- **Ship less.** The kit is ten files:

  | File | Why |
  | --- | --- |
  | `favicon.ico` | A real multi-size ICO (16, 32, 48), not a renamed PNG |
  | `icon.svg` | Vector, with a `prefers-color-scheme` dark variant and the letter's font subset inlined |
  | `apple-touch-icon.png` | 180px, opaque and padded, because iOS masks it |
  | `icon-192.png`, `icon-512.png` | Manifest icons |
  | `icon-maskable.png` | Separate safe-zone icon; never `"any maskable"` |
  | `manifest.webmanifest` | |
  | `og.png` | 1200 × 630 social card |
  | `head.html` | The tags to paste |
  | `README.md` | Where each file goes |

  Pick **Next.js** as the target and the same kit is laid out in App Router
  file conventions (`app/icon.svg`, `app/apple-icon.png`,
  `app/opengraph-image.png`…) with a `metadata` export instead of tags.

Everything is drawn in the browser. Nothing is uploaded. Work is kept in
`localStorage`; **Share** copies a link that carries the whole design in its
hash.

Shortcuts: `S` shuffle, `Z` undo, `E` export. Drop or paste an SVG anywhere.

## From the command line

The same kit, with no browser, written straight into a project:

```bash
npx long-underscore build --name "Northwind" --url northwind.app \
  --description "Invoices and payouts for small teams."
```

It detects Next.js, puts each file where that kind of project wants it,
prints the tags or `metadata` to add, runs the checks and gives a link that
opens the same design in the studio. `check`, `link` and `list` are its
other commands, and `--from <link>` rebuilds a kit from a design shared out
of the studio. See [cli/README.md](cli/README.md).

The package is `cli/`. `bun run cli -- <command>` runs it from source,
`bun run cli:build` bundles it into `cli/dist/`, and `npm publish` from
`cli/` ships it.

### For agents

`skills/long-underscore/SKILL.md` teaches a coding agent when to reach for
the command and how to wire the result in:

```bash
npx skills add nkurunziza-saddy/long-underscore
```

## Development

```bash
bun install
bun dev
```

| Script | |
| --- | --- |
| `bun run lint` | Biome check |
| `bun run build` | Production build |
| `bun run icons` | Regenerate `public/phosphor/` from the installed `@phosphor-icons/core` |
| `bun run fonts:check` | Verify every font in `lib/fonts.ts` still resolves on Google Fonts |
| `bun run brand` | Rebuild the studio's own icons and social card from `lib/brand.ts` |
| `bun run cli -- build …` | Run the command line from source |
| `bun run cli:build` | Bundle the command line into `cli/dist/` |

## Layout

```
lib/design.ts        The Design type, treatments, dark-mode derivation, shuffle
lib/render-mark.ts   Canvas renderer (favicon / apple / maskable variants)
lib/mark-svg.ts      The same mark as a standalone SVG
lib/card.ts          Social card renderer
lib/ico.ts           ICO encoder
lib/audit.ts         The verdict checks
lib/kit.ts           Every file of the kit, drawn and named
lib/package.ts       Zips the kit for the browser
lib/canvas.ts        Where a canvas comes from: the document, or the command line
lib/halftone.ts      Halftone marks: shapes screened onto a grid of cells
lib/brand.ts         The studio's own name, words, colours and mark
lib/snippets.ts      head.html, Next.js metadata, manifest, kit README
lib/share.ts         Share-link codec and input sanitising
stores/              Zustand store: design, undo history, persistence
components/studio/   The UI: the page that shows the mark, the controls beside it
cli/                 The command line: the same renderers on a canvas outside the browser
skills/              The skill that teaches an agent to use it
```

The app's own icons and social card in `app/` and `public/` are built from
`lib/brand.ts` by `bun run brand`, with the same kit builder as everything
else.
