import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Target } from "../../lib/design";

/** What kind of project a folder is, and where its icons belong. */
export interface Project {
  target: Target;
  /** The App Router folder of a Next.js project: `app` or `src/app`. */
  appDir: string;
  /** Where a plain site serves static files from, relative to the folder. */
  staticDir: string;
}

/** Read the folder: a Next.js app is one that depends on `next`. */
export function detectProject(root: string): Project {
  let next = false;
  try {
    const manifest = JSON.parse(
      readFileSync(join(root, "package.json"), "utf8"),
    );
    next = Boolean(
      manifest.dependencies?.next ?? manifest.devDependencies?.next,
    );
  } catch {
    // No package.json, or not one that parses: a plain site.
  }
  return {
    target: next ? "next" : "html",
    appDir:
      !existsSync(join(root, "app")) && existsSync(join(root, "src/app"))
        ? "src/app"
        : "app",
    staticDir:
      ["public", "static"].find((dir) => existsSync(join(root, dir))) ?? ".",
  };
}

/**
 * Where one of the kit's files goes, relative to the project. The kit names
 * its files for a zip (`app/icon.svg`, `icon.svg`); a project may keep its
 * app in `src/`, or its static files in `public/`.
 */
export function placeFile(
  path: string,
  target: Target,
  project: Project,
  /** Whether `--out` named the folder itself: then a plain site's files go straight into it. */
  exact: boolean,
): string {
  if (target === "next") {
    return path.startsWith("app/")
      ? join(project.appDir, path.slice("app/".length))
      : path;
  }
  return exact ? path : join(project.staticDir, path);
}
