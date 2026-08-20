/**
 * Maps the registry's own layout onto the target project's.
 *
 * Registry paths mirror the `@/` import they resolve to — `components/ui/input.tsx`
 * is `@/components/ui/input` — so one prefix table drives both where a file lands
 * and how the files importing it are rewritten.
 */

import { join } from "node:path";

// Longest prefix first: `components/ui` must win over `components`.
const ROOTS = [
  { prefix: "components/ui", key: "ui" },
  { prefix: "components", key: "components" },
  { prefix: "lib", key: "lib" },
  { prefix: "hooks", key: "hooks" },
];

function split(registryPath) {
  const root = ROOTS.find(
    ({ prefix }) => registryPath === prefix || registryPath.startsWith(`${prefix}/`),
  );
  if (!root) throw new Error(`Registry path "${registryPath}" is outside every known root.`);
  return { key: root.key, rest: registryPath.slice(root.prefix.length).replace(/^\//, "") };
}

/**
 * Absolute path the file should be written to. A `target` pins the file to a
 * fixed spot relative to the project root — that is how assets reach `public/`,
 * which has no alias and no alternative location.
 */
export function targetPathOf(file, project) {
  if (file.target) return join(project.root, file.target);
  const { key, rest } = split(file.path);
  return join(project.directories[key], rest);
}

/** Path shown to the user — relative, with forward slashes. */
export function displayPathOf(file, project) {
  return targetPathOf(file, project)
    .slice(project.root.length + 1)
    .replaceAll("\\", "/");
}

const KEY_BY_PREFIX = new Map(ROOTS.map(({ prefix, key }) => [prefix, key]));

// One alternation, ordered longest-first, so each specifier is rewritten exactly
// once. Rewriting root by root would let a later root match an alias an earlier
// one had just produced.
const IMPORT_PATTERN = new RegExp(
  `(["'])@/(${ROOTS.map(({ prefix }) => prefix).join("|")})(?=[/"'])`,
  "g",
);

/**
 * Rewrites `@/…` imports to the target project's aliases. Only the roots above
 * are touched, so a project's own `@/utils` or `@/features` imports — should a
 * component ever gain one — are left exactly as they are.
 */
export function rewriteImports(content, project) {
  return content.replace(
    IMPORT_PATTERN,
    (_match, quote, prefix) => `${quote}${project.aliases[KEY_BY_PREFIX.get(prefix)]}`,
  );
}
