/**
 * Copies the components the `me-ui` CLI ships into `packages/me-ui/registry`.
 *
 * The app under `src/` stays the single source of truth — an npm package cannot
 * reference files outside its own directory, so the published copy is generated
 * rather than maintained by hand. Import specifiers are rewritten on the way out
 * for any file whose registry path differs from its path in the app.
 *
 * Pass `--check` to fail instead of writing, which is what `prepublishOnly` runs
 * so a stale copy can never be published.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageDir = join(root, "packages", "me-ui");
const outputDir = join(packageDir, "registry");

const manifest = JSON.parse(readFileSync(join(packageDir, "registry.json"), "utf8"));
const files = manifest.items.flatMap((item) => item.files ?? []);

/** `src/components/ui/input.tsx` and `components/ui/input.tsx` both mean `@/components/ui/input`. */
const specifierOf = (path) => `@/${path.replace(/^src\//, "").replace(/\.(tsx?|jsx?)$/, "")}`;

// Longest first, so `@/components/ui/x` is never clipped by a `@/components/x` rule.
// Assets — anything with a fixed `target` — are copied byte for byte instead.
const rewrites = files
  .filter((file) => !file.target)
  .map((file) => [specifierOf(file.source), specifierOf(file.path)])
  .filter(([from, to]) => from !== to)
  .sort(([a], [b]) => b.length - a.length);

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function render(file) {
  if (file.target) return readFileSync(join(root, file.source), "utf8");

  const source = readFileSync(join(root, file.source), "utf8").replace(/\r\n/g, "\n");
  return rewrites.reduce(
    (content, [from, to]) =>
      content.replace(new RegExp(`(["'])${escape(from)}\\1`, "g"), `$1${to}$1`),
    source,
  );
}

function listExisting(dir, prefix = "") {
  const entries = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) entries.push(...listExisting(path, `${prefix}${name.name}/`));
    else entries.push(`${prefix}${name.name}`);
  }
  return entries;
}

const rendered = new Map(files.map((file) => [file.path, render(file)]));

/**
 * Every `@/…` import in an item's files must resolve to a file that item already
 * pulls in through `registryDependencies`.
 *
 * Without this, adding a helper under `src/` and importing it from a shipped
 * component publishes a broken install: the CLI rewrites the import, copies
 * nothing to satisfy it, and the consumer's build fails on a module that only
 * ever existed in this repo.
 */
function reportUnreachableImports() {
  const byName = new Map(manifest.items.map((item) => [item.name, item]));

  const closureOf = (name, seen = new Set()) => {
    if (seen.has(name)) return seen;
    seen.add(name);
    for (const dependency of byName.get(name)?.registryDependencies ?? []) {
      closureOf(dependency, seen);
    }
    return seen;
  };

  const problems = [];

  for (const item of manifest.items) {
    const reachable = new Set(
      [...closureOf(item.name)].flatMap((name) =>
        (byName.get(name)?.files ?? []).filter((file) => !file.target).map((file) => file.path),
      ),
    );
    const resolves = (specifier) => {
      const base = specifier.slice(2);
      return [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].some((path) =>
        reachable.has(path),
      );
    };

    for (const file of item.files ?? []) {
      if (file.target) continue;
      for (const specifier of new Set(rendered.get(file.path).match(/@\/[\w/.-]+/g) ?? [])) {
        if (resolves(specifier)) continue;
        problems.push(`${item.name} → ${file.path} imports ${specifier}, which it never installs`);
      }
    }
  }

  return problems;
}

const unreachable = reportUnreachableImports();
if (unreachable.length) {
  console.error(`registry items have unsatisfied imports:\n  ${unreachable.join("\n  ")}`);
  console.error("\nadd the missing file to registry.json, or declare the item that ships it.");
  process.exit(1);
}

function reportDrift() {
  const present = statSync(outputDir, { throwIfNoEntry: false });
  const existing = new Set(present ? listExisting(outputDir) : []);
  return [
    ...[...rendered.keys()]
      .filter((path) => !existing.has(path))
      .map((path) => `missing:  ${path}`),
    ...[...existing].filter((path) => !rendered.has(path)).map((path) => `stale:    ${path}`),
    ...[...rendered]
      .filter(
        ([path, body]) =>
          existing.has(path) && readFileSync(join(outputDir, path), "utf8") !== body,
      )
      .map(([path]) => `outdated: ${path}`),
  ];
}

if (process.argv.includes("--check")) {
  const drift = reportDrift();
  if (drift.length) {
    console.error(`registry copy is out of sync with src/:\n  ${drift.join("\n  ")}`);
    console.error("\nrun `bun run ui:sync` and commit the result.");
    process.exit(1);
  }
  console.log(`registry copy is in sync (${rendered.size} files)`);
} else {
  rmSync(outputDir, { recursive: true, force: true });
  for (const [path, body] of rendered) {
    const target = join(outputDir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, body);
  }
  console.log(`synced ${rendered.size} files to ${relative(root, outputDir)}`);
}
