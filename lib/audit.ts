import { contrast, harmonicContrast, mix, tone } from "./color";
import {
  cardTagline,
  cardTitle,
  type Design,
  hasDarkVariant,
  resolveColors,
  siteOrigin,
  TAB_DARK,
  TAB_LIGHT,
} from "./design";
import { getFont, heaviestWeight, nearestWeight } from "./fonts";
import { HALFTONE_GRID } from "./halftone";
import type { SvgSource } from "./svg-source";

export type CheckLevel = "pass" | "note" | "warn" | "fail";

export interface Check {
  id: string;
  level: CheckLevel;
  title: string;
  detail: string;
  /** A one-click remedy, when there is an unambiguous one. */
  fix?: { label: string; patch: Partial<Design> };
  /** Where to go when the remedy is something only the user can type. */
  goto?: "site" | "card";
}

function graphemes(text: string): string[] {
  const trimmed = text.trim();
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return [...new Intl.Segmenter().segment(trimmed)].map((s) => s.segment);
  }
  return [...trimmed];
}

const ratio = (value: number) => `${value.toFixed(1)}:1`;

/**
 * The studio's opinions, as checks. A favicon is judged at 16 pixels on
 * someone else's browser chrome, so most of these are about survival there.
 */
export function audit(design: Design, svg: SvgSource | null): Check[] {
  const checks: Check[] = [];
  const light = resolveColors(design, "light");
  const plate = light.bg2 ? mix(light.bg, light.bg2, 0.5) : light.bg;
  const drawn = design.source !== "svg";

  if (design.source === "svg") {
    if (!svg) {
      checks.push({
        id: "svg",
        level: "fail",
        title: "No artwork yet",
        detail: "Drop an .svg file anywhere on the page, or paste its markup.",
      });
    } else {
      const issues: string[] = [];
      if (svg.hasText) {
        issues.push(
          "it contains <text>, which renders in a fallback font inside a favicon; convert text to outlines",
        );
      }
      if (svg.hasRaster) {
        issues.push("it embeds a bitmap, which will blur when scaled");
      }
      if (svg.bytes > 15_000) {
        issues.push(
          `it weighs ${(svg.bytes / 1024).toFixed(0)} KB; favicons load on every page, so run it through SVGO`,
        );
      }
      checks.push(
        issues.length > 0
          ? {
              id: "svg",
              level: "warn",
              title: "Artwork needs attention",
              detail: `Your SVG works, but ${issues.join("; ")}.`,
            }
          : {
              id: "svg",
              level: "pass",
              title: "Clean vector artwork",
              detail: `${(svg.bytes / 1024).toFixed(1)} KB of pure vector, no text or bitmaps.`,
            },
      );
    }
  }

  if (design.source === "letter") {
    const count = graphemes(design.text).length;
    if (count === 0) {
      checks.push({
        id: "letters",
        level: "fail",
        title: "The mark is empty",
        detail: "Type one or two characters. An emoji counts.",
      });
    } else if (count > 2) {
      checks.push({
        id: "letters",
        level: count > 3 ? "fail" : "warn",
        title: `${count} characters is a word, not a mark`,
        detail:
          "At 16px each letter gets about four pixels. One character is ideal, two is the limit.",
        fix: {
          label: `Use “${graphemes(design.text)[0]}”`,
          patch: { text: graphemes(design.text)[0] },
        },
      });
    } else {
      checks.push({
        id: "letters",
        level: "pass",
        title: count === 1 ? "One character" : "Two characters",
        detail: "Short enough to stay sharp in a browser tab.",
      });
    }

    const font = getFont(design.font);
    if (design.weight < 600 && heaviestWeight(design.font) >= 600) {
      const heavier = nearestWeight(design.font, 700);
      checks.push({
        id: "weight",
        level: "warn",
        title: "Strokes are thin for 16px",
        detail:
          "Regular weights dissolve into grey anti-aliasing at tab size. Bold survives.",
        fix: { label: `Use ${heavier}`, patch: { weight: heavier } },
      });
    } else if (font.category === "script") {
      checks.push({
        id: "weight",
        level: "warn",
        title: "Script faces blur when small",
        detail: `${font.name} is lovely at 180px and a smudge at 16px. Check the pixel loupe before shipping.`,
      });
    } else {
      checks.push({
        id: "weight",
        level: "pass",
        title: "Sturdy letterform",
        detail: `${font.name} at ${design.weight} has enough stroke to survive tab size.`,
      });
    }
  }

  if (design.source === "halftone") {
    if (design.htShape === "letter" && !design.text.trim()) {
      checks.push({
        id: "letters",
        level: "fail",
        title: "No letter to screen",
        detail:
          "The mark is a letter in halftone, and there is none. Type one under Mark, or pick another shape.",
      });
    }
    // What one cell of the grid gets in a 16px tab.
    const pitch = ((design.scale / 100) * 16) / design.htGrid;
    if (pitch < 1.5) {
      const coarser = Math.max(
        HALFTONE_GRID.min,
        Math.floor(((design.scale / 100) * 16) / 1.5),
      );
      checks.push({
        id: "cells",
        level: "warn",
        title: "Cells blur together at 16px",
        detail: `Each one gets ${pitch.toFixed(1)}px in a tab, so the pattern turns into a grey shape. A coarser grid keeps the cells apart.`,
        fix: {
          label: `Use ${coarser} × ${coarser}`,
          patch: { htGrid: coarser },
        },
      });
    } else {
      checks.push({
        id: "cells",
        level: "pass",
        title: "Cells hold at tab size",
        detail: `About ${pitch.toFixed(1)}px a cell at 16px: it still reads as a pattern, not a smudge.`,
      });
    }
  }

  if (
    design.source === "icon" &&
    (design.iconWeight === "thin" || design.iconWeight === "light")
  ) {
    checks.push({
      id: "weight",
      level: "warn",
      title: "Hairline icon strokes",
      detail:
        "Thin and light strokes drop under one pixel at 16px and fade out. Bold is drawn for this size.",
      fix: { label: "Use bold", patch: { iconWeight: "bold" } },
    });
  }

  if (drawn && !light.transparent) {
    const value = contrast(light.fg, plate);
    if (value < 3) {
      checks.push({
        id: "contrast",
        level: value < 1.8 ? "fail" : "warn",
        title: `Glyph and plate are too close (${ratio(value)})`,
        detail:
          "Graphics need at least 3:1 to be told apart; small ones need more.",
        fix: {
          label: "Fix contrast",
          patch: { fg: harmonicContrast(plate), treatment: "custom" },
        },
      });
    } else {
      checks.push({
        id: "contrast",
        level: "pass",
        title: `Strong contrast (${ratio(value)})`,
        detail: "The glyph separates cleanly from its plate.",
      });
    }
  }

  if (drawn) {
    const min = design.source === "letter" ? 50 : 55;
    const max = design.source === "letter" ? 94 : 86;
    if (design.scale < min) {
      const px = Math.round(
        (design.scale / 100) * 16 * (design.source === "letter" ? 0.72 : 1),
      );
      checks.push({
        id: "size",
        level: "warn",
        title: "Glyph is small",
        detail: `In a tab it is only about ${px}px tall. Fill the plate; whitespace is wasted at this size.`,
        fix: {
          label: "Enlarge",
          patch: { scale: design.source === "letter" ? 66 : 68 },
        },
      });
    } else if (design.scale > max && !light.transparent) {
      checks.push({
        id: "size",
        level: "warn",
        title: "Glyph crowds the plate",
        detail:
          "It nearly touches the edge, and round home-screen masks will clip it.",
        fix: {
          label: "Add room",
          patch: { scale: design.source === "letter" ? 68 : 64 },
        },
      });
    }
  }

  if (drawn && light.transparent) {
    const dark = resolveColors(design, "dark");
    const onLight = contrast(light.fg, TAB_LIGHT);
    const onDark = contrast(dark.fg, TAB_DARK);
    if (onLight < 3) {
      checks.push({
        id: "tabs",
        level: "fail",
        title: "Vanishes on light tabs",
        detail: `Without a plate the glyph sits straight on browser chrome, where it reaches only ${ratio(onLight)}.`,
        fix: {
          label: "Darken glyph",
          patch: { fg: tone(light.fg, 38), treatment: "custom" },
        },
      });
    } else if (onDark < 3) {
      checks.push({
        id: "tabs",
        level: "fail",
        title: "Vanishes on dark tabs",
        detail: `On dark browser chrome the glyph reaches only ${ratio(onDark)}. Let the SVG adapt.`,
        fix: { label: "Adapt to dark", patch: { adaptive: true } },
      });
    } else {
      checks.push({
        id: "tabs",
        level: "pass",
        title: "Visible on light and dark tabs",
        detail: hasDarkVariant(design)
          ? "The SVG lightens itself for dark chrome. Safari and legacy browsers get the static .ico."
          : "The glyph has enough contrast against both tab strips as drawn.",
      });
    }
  } else if (drawn) {
    checks.push({
      id: "tabs",
      level: "pass",
      title: "Plate carries it on any tab",
      detail: hasDarkVariant(design)
        ? "A pale plate glares in dark chrome, so the SVG ships a dark variant."
        : "An opaque plate looks the same on light and dark chrome.",
    });
  }

  if (!design.name.trim()) {
    checks.push({
      id: "name",
      level: "warn",
      title: "The site has no name",
      detail:
        "It labels the home-screen icon, the manifest and the social card.",
      goto: "site",
    });
  }

  if (!siteOrigin(design)) {
    checks.push({
      id: "url",
      level: "warn",
      title: "No domain set",
      detail:
        "Social crawlers reject relative image paths. Add your domain so og:image is absolute and paste-ready.",
      goto: "site",
    });
  }

  const title = cardTitle(design);
  if (title.length > 70) {
    checks.push({
      id: "card",
      level: "warn",
      title: `Card headline runs ${title.length} characters`,
      detail: "It will shrink to fit, but link previews truncate around 60.",
      goto: "card",
    });
  } else if (!cardTagline(design)) {
    checks.push({
      id: "card",
      level: "note",
      title: "Card has no tagline",
      detail: "Add a description; it also becomes the meta description.",
      goto: "site",
    });
  }

  return checks;
}

export function summarize(checks: Check[]) {
  const graded = checks.filter((check) => check.level !== "note");
  return {
    passed: graded.filter((check) => check.level === "pass").length,
    total: graded.length,
    failing: graded.some((check) => check.level === "fail"),
  };
}
