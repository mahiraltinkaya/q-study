/** The shipped item catalogue and its dependency graph. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
export const registryDir = join(packageRoot, "registry");

export const manifest = JSON.parse(readFileSync(join(packageRoot, "registry.json"), "utf8"));

const byName = new Map(manifest.items.map((item) => [item.name, item]));

export const itemNames = manifest.items.map((item) => item.name);

/**
 * Flattens the requested names into the full set of items to install, with each
 * dependency ordered ahead of whatever asked for it. Cycles resolve rather than
 * hang: a name already being visited is treated as satisfied.
 */
export function resolveItems(names) {
  const ordered = [];
  const settled = new Set();
  const visiting = new Set();

  const visit = (name) => {
    if (settled.has(name) || visiting.has(name)) return;

    const item = byName.get(name);
    if (!item) throw new Error(`Unknown item "${name}". Run \`me-ui list\` to see what exists.`);

    visiting.add(name);
    for (const dependency of item.registryDependencies ?? []) visit(dependency);
    visiting.delete(name);

    settled.add(name);
    ordered.push(item);
  };

  names.forEach(visit);
  return ordered;
}

/** npm packages the given items need, deduplicated and in install order. */
export function npmDependenciesOf(items) {
  return [...new Set(items.flatMap((item) => item.dependencies ?? []))];
}

/** Merges every item's CSS variables into one `{ theme, light }` block. */
export function cssVarsOf(items) {
  const merged = { theme: {}, light: {} };
  for (const item of items) {
    for (const scope of ["theme", "light"]) {
      Object.assign(merged[scope], item.cssVars?.[scope] ?? {});
    }
  }
  return merged;
}
