# long-underscore

One mark, every surface it has to live on, from the command line.

```sh
npx long-underscore build --name "Northwind" --url northwind.app \
  --description "Invoices and payouts for small teams."
```

That draws a mark and writes the whole kit into the project you are in: a
real multi-size `favicon.ico`, an `icon.svg` that restyles itself for dark
browser chrome, Apple and maskable icons, a web manifest and a matching
1200 × 630 social card. In a Next.js project the files take the names the
App Router picks up by itself. It then prints the tags or the `metadata` to
add, what its checks make of the mark, and a link that opens the same
design in the [studio](https://longunderscore.vercel.app).

It needs no browser, so an agent can run it. The drawing code is the
studio's own.

| Command | |
| --- | --- |
| `build` | Write the kit into this project |
| `check` | Judge a design; exits 1 if a check fails |
| `link` | Print a studio link to a design |
| `list <what>` | `hues`, `treatments`, `fonts`, `icons`, `shapes`, `presets`, `layouts`, `tones`, `textures` |

`long-underscore --help` lists every flag. A mark is a letter (the
default), a Phosphor icon (`--icon`), a halftone (`--halftone`) or your own
SVG (`--svg`); colour is a hue and a treatment (`--hue slate --treatment
ink`) or exact (`--fg`, `--bg`). `--from` starts from a link shared from
the studio, `--json` prints the result for a program to read, and
`--dry-run` writes nothing.

For agents there is a skill that says when and how to use it:

```sh
npx skills add nkurunziza-saddy/long-underscore
```
