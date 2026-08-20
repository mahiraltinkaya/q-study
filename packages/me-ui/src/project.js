/**
 * Reads whatever the target project already tells us about itself.
 *
 * A `components.json` is honoured when present — most projects that would want
 * these components have one, and matching its aliases means the files land where
 * the rest of that project's UI already lives. Everything else is inferred.
 */

import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

import { parseJsonc } from "./jsonc.js";

const DEFAULT_ALIASES = {
  ui: "@/components/ui",
  components: "@/components",
  lib: "@/lib",
  hooks: "@/hooks",
};

const CSS_CANDIDATES = [
  "src/app/globals.css",
  "app/globals.css",
  "src/styles/globals.css",
  "styles/globals.css",
  "src/index.css",
  "src/app.css",
];

function readJson(path) {
  if (!existsSync(path)) return undefined;
  try {
    return parseJsonc(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
}

/**
 * Turns an alias like `@/components/ui` into a directory, by running it through
 * the project's `tsconfig` paths. Falls back to the `src/` convention, which is
 * what the mapping almost always says anyway.
 */
function createAliasResolver(cwd) {
  const tsconfig = readJson(join(cwd, "tsconfig.json")) ?? readJson(join(cwd, "jsconfig.json"));
  const baseUrl = tsconfig?.compilerOptions?.baseUrl ?? ".";
  const paths = tsconfig?.compilerOptions?.paths ?? {};

  const wildcards = Object.entries(paths)
    .filter(([pattern, targets]) => pattern.endsWith("/*") && targets?.[0]?.endsWith("/*"))
    .map(([pattern, targets]) => [pattern.slice(0, -1), targets[0].slice(0, -1)])
    .sort(([a], [b]) => b.length - a.length);

  const fallbackRoot = existsSync(join(cwd, "src")) ? "src" : ".";

  return (alias) => {
    for (const [from, to] of wildcards) {
      if (alias.startsWith(from)) return resolve(cwd, baseUrl, to + alias.slice(from.length));
    }
    return resolve(cwd, fallbackRoot, alias.replace(/^@\//, ""));
  };
}

function findCssFile(cwd, configured) {
  if (configured) {
    const path = isAbsolute(configured) ? configured : join(cwd, configured);
    if (existsSync(path)) return path;
  }
  const found = CSS_CANDIDATES.map((candidate) => join(cwd, candidate)).find((path) =>
    existsSync(path),
  );
  return found;
}

export function loadProject(cwd) {
  const root = resolve(cwd);
  if (!existsSync(join(root, "package.json"))) {
    throw new Error(`No package.json in ${root}. Point --cwd at a project directory.`);
  }

  const componentsJson = readJson(join(root, "components.json"));
  const aliases = { ...DEFAULT_ALIASES, ...(componentsJson?.aliases ?? {}) };
  const resolveAlias = createAliasResolver(root);
  const packageJson = readJson(join(root, "package.json")) ?? {};

  return {
    root,
    aliases,
    directories: Object.fromEntries(
      Object.entries(aliases).map(([key, alias]) => [key, resolveAlias(alias)]),
    ),
    cssFile: findCssFile(root, componentsJson?.tailwind?.css),
    installedDependencies: {
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
      ...(packageJson.peerDependencies ?? {}),
    },
    usesComponentsJson: Boolean(componentsJson),
  };
}
