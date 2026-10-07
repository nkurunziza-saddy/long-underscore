---
name: long-underscore
description: Give a website its favicon, app icons, web manifest and social card with one command and no browser. Use when asked to add or fix a favicon, an app icon, an Open Graph image or a manifest, or when a site is missing them.
---

# long underscore

`long-underscore` draws one mark and writes the whole icon kit into a
project: a real multi-size `favicon.ico`, an `icon.svg` that restyles itself
for dark browser chrome, Apple and maskable icons, a web manifest and a
matching 1200 × 630 social card. It is the command line of the studio at
https://longunderscore.vercel.app and draws with the same code, so what it
writes is what the studio would export.

Your job is to choose a mark that suits the site, run the command, and wire
the result in. Do not draw icon files by hand, and do not resize one PNG
into many.

## Steps

1. **Learn what the site is.** Its name, one sentence on what it does, and
   its address. Look in `package.json`, the README, and the existing
   `<title>` and metadata.
2. **Look for a mark it already has.** A logo as SVG (`public/logo.svg`,
   `src/assets/`, an inline `<svg>` in the header) is the mark: pass it with
   `--svg`. Only when there is none do you choose one (next section).
3. **Look for a colour it already has.** A brand colour in the CSS or the
   Tailwind theme can be given exactly (`--bg`), or matched to a hue
   (`list hues`). With none, leave colour alone: the default is a dark
   neutral, which suits most sites.
4. **Check before you write.** Run `check` with your flags. It judges the
   mark at the size a browser tab draws it; fix what it fails or warns
   about, or pass `--fix` to take every one-step fix it offers.
5. **Build.** Run `build` in the project root. It finds out whether the
   project is Next.js and puts every file where that kind of project wants
   it.
6. **Wire it in.** `build` prints what to add and where (below).
7. **Tell the user** what was added and give them the studio link `build`
   printed.

## Choosing a mark

In this order:

- **Their own SVG** (`--svg logo.svg`), if they have one. A square
  `viewBox` works best. It is drawn as it is, with no plate; add
  `--bg <hex>` to set it on one.
- **A letter** (`--letter N`): the default, and the name's initial unless
  you say otherwise. One character; two at most. Bold weights survive 16
  pixels and thin ones do not.
- **A halftone** (`--halftone <preset>`): a clean abstract mark made of
  cells, for a product with no letter worth using. `list presets` names
  them. `--shape letter --grid 8` screens the site's own letter through
  the grid.
- **An icon** (`--icon rocket`): a Lucide icon by name. Search with
  `list icons <word>`. Use one only when it says something about the
  product; a generic icon is a worse mark than a letter.

## Commands

```sh
# The usual case: name, sentence, address. Letter mark, dark neutral.
npx long-underscore build --name "Northwind" --url northwind.app \
  --description "Invoices and payouts for small teams."

# Their own logo, on a plate in their colour.
npx long-underscore build --name "Northwind" --url northwind.app \
  --svg public/logo.svg --bg "#0f172a"

# A halftone mark in a named hue.
npx long-underscore build --name "Northwind" --halftone halftone --hue slate

# Judge a design without writing anything.
npx long-underscore check --name "Northwind" --letter Nw --json

# Everything a flag accepts.
npx long-underscore list hues
npx long-underscore list fonts
npx long-underscore list presets
npx long-underscore list icons chart
```

`--help` lists every flag. The ones that matter most:

| Flag | What it sets |
| --- | --- |
| `--name`, `--description`, `--url` | The site. All three are used by the manifest, the card and the tags; give all three. |
| `--letter`, `--font`, `--weight` | A letter mark. |
| `--svg`, `--icon`, `--halftone` | The other kinds of mark. The last kind named wins. |
| `--hue`, `--treatment` | Colour by name. Treatments: `ink` (near-black plate), `solid`, `fade`, `soft`, `paper`, `ghost` (no plate). |
| `--fg`, `--bg`, `--no-plate` | Exact colours, as hex. |
| `--title`, `--tagline` | The social card's words, when they should differ from the name and description. |
| `--layout`, `--tone`, `--texture` | The social card's look. Defaults are a safe choice. |
| `--fix` | Apply every one-step fix the checks offer. |
| `--dry-run` | Say what would be written and write nothing. |
| `--json` | Print the result as JSON: files, the snippet, the checks, the studio link. |
| `--from <link>` | Start from a design someone made in the studio (below). |

`check` exits 1 when a check fails. A mistake in the flags exits 2 with one
line saying what was wrong and what would work.

## Wiring it in

**Next.js (App Router).** The files go in `app/` (or `src/app/`) and
`public/` under the names Next.js picks up by itself: `favicon.ico`,
`icon.svg`, `apple-icon.png`, `opengraph-image.png`,
`manifest.webmanifest`. `build` prints a `metadata` object; merge its
fields into the one `app/layout.tsx` already exports rather than adding a
second. Delete any older `favicon.ico`, `icon.*` or `opengraph-image.*` in
`app/` that the kit did not just write, or Next.js will serve both.

**Anything else.** The files go in the folder the site serves static files
from (`public/` where there is one). `build` prints the tags; put them in
the `<head>` of every page, in the layout or template the pages share, and
remove the favicon and Open Graph tags that were there before.

In both cases, do not edit the image files afterwards. To change the mark,
run `build` again with different flags: it replaces what it wrote.

## Checklist

- [ ] `--name`, `--description` and `--url` were all given, so the card's
      address is absolute and the tags are ready to paste.
- [ ] `check` reports no `fail`, and each `warn` is either fixed or one you
      can explain.
- [ ] The snippet is in the shared layout once, and the tags it replaces
      are gone.
- [ ] No older icon files are left beside the new ones.
- [ ] The project still builds.

## What to tell the user

Say which files were added and where, and what you changed in the layout.
Give them the studio link from `build`: it opens the same design in the
browser, where they can see it on a tab, a home screen and a link preview,
and change anything. If they change it, **Share** in the studio gives a
link, and this rebuilds the kit from it:

```sh
npx long-underscore build --from "<the link>"
```

A link cannot carry an imported SVG; pass `--svg` again alongside it.

## Good to know

- Typefaces are fetched from Google Fonts the first time and kept in the
  user's cache. With no connection the command still runs and says which
  text was drawn in a fallback face; `--offline` skips the fetch.
- A fine grid or a detailed halftone looks right at 180 pixels and turns
  to texture at 16. `check` says so; believe it.
- Dark neutral hues come first in `list hues` on purpose. Reach for a
  colour only when the brand has one.
