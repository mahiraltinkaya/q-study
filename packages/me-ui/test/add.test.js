// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { add } from "../src/commands/add.js";

/**
 * Exercises the whole command against a real directory: manifest resolution,
 * alias mapping, import rewriting and stylesheet mutation all at once. This is
 * the code that writes into someone else's repository, so it is tested against
 * a filesystem rather than against mocks.
 */
const made = [];

function project({ componentsJson, css = ":root {\n  --radius: 0.625rem;\n}\n" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "me-gui-add-"));
  made.push(root);

  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "target", dependencies: {} }));
  writeFileSync(
    join(root, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { baseUrl: ".", paths: { "@/*": ["./src/*"] } } }),
  );
  mkdirSync(join(root, "src", "app"), { recursive: true });
  writeFileSync(join(root, "src", "app", "globals.css"), css);
  if (componentsJson) {
    writeFileSync(join(root, "components.json"), JSON.stringify(componentsJson));
  }
  return root;
}

const read = (root, ...parts) => readFileSync(join(root, ...parts), "utf8");
const cssOf = (root) => read(root, "src", "app", "globals.css");

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  while (made.length) rmSync(made.pop(), { recursive: true, force: true });
});

describe("add", () => {
  it("insists on being given something to install", () => {
    expect(() => add({ items: [], cwd: project(), skipInstall: true })).toThrow(
      "Name at least one item",
    );
  });

  it("writes the item and everything it depends on", () => {
    const root = project();
    add({ items: ["input"], cwd: root, skipInstall: true });

    expect(existsSync(join(root, "src", "components", "ui", "input.tsx"))).toBe(true);
    expect(existsSync(join(root, "src", "components", "ui", "field-hint.tsx"))).toBe(true);
    expect(existsSync(join(root, "src", "lib", "utils.ts"))).toBe(true);
  });

  it("writes nothing at all on a dry run", () => {
    const root = project();
    const before = cssOf(root);
    add({ items: ["input"], cwd: root, skipInstall: true, dryRun: true });

    expect(existsSync(join(root, "src", "components", "ui", "input.tsx"))).toBe(false);
    expect(cssOf(root)).toBe(before);
  });

  it("adds the design tokens the items declare", () => {
    const root = project();
    add({ items: ["input"], cwd: root, skipInstall: true });

    const css = cssOf(root);
    expect(css).toMatch(/--brand:\s*#870052;/);
    expect(css).toMatch(/--ink:\s*#0b1324;/);
  });

  it("keeps a token the project has already retuned", () => {
    const root = project({ css: ":root {\n  --brand: #123456;\n}\n" });
    add({ items: ["input"], cwd: root, skipInstall: true });

    expect(cssOf(root)).toMatch(/--brand:\s*#123456;/);
    expect(cssOf(root)).not.toMatch(/#870052/);
  });

  it("follows the aliases in components.json and rewrites imports to match", () => {
    const root = project({
      componentsJson: { aliases: { ui: "@/ds/controls", components: "@/ds", lib: "@/utils" } },
    });
    add({ items: ["input"], cwd: root, skipInstall: true });

    expect(existsSync(join(root, "src", "ds", "controls", "input.tsx"))).toBe(true);
    expect(read(root, "src", "ds", "controls", "input.tsx")).toContain('"@/utils/utils"');
    expect(read(root, "src", "ds", "controls", "input.tsx")).toContain(
      '"@/ds/controls/field-hint"',
    );
  });

  it("leaves an existing file alone unless overwrite is asked for", () => {
    const root = project();
    const target = join(root, "src", "components", "ui", "input.tsx");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, "// mine\n");

    add({ items: ["input"], cwd: root, skipInstall: true });
    expect(readFileSync(target, "utf8")).toBe("// mine\n");

    add({ items: ["input"], cwd: root, skipInstall: true, overwrite: true });
    expect(readFileSync(target, "utf8")).not.toBe("// mine\n");
  });

  it("is idempotent — a second run changes nothing", () => {
    const root = project();
    add({ items: ["input"], cwd: root, skipInstall: true });
    const first = { file: read(root, "src", "components", "ui", "input.tsx"), css: cssOf(root) };

    add({ items: ["input"], cwd: root, skipInstall: true });

    expect(read(root, "src", "components", "ui", "input.tsx")).toBe(first.file);
    expect(cssOf(root)).toBe(first.css);
  });

  it("keeps the stepper self-contained — nested files, no asset to carry", () => {
    // The divider used to be an <img> pointing at /assets, which made this item
    // drag a public/ file and a Next dependency behind it. It draws inline now,
    // and nothing should reappear outside the alias roots.
    const root = project();
    add({ items: ["stepper"], cwd: root, skipInstall: true });

    expect(existsSync(join(root, "src", "components", "ui", "stepper", "stepper-rail.tsx"))).toBe(
      true,
    );
    expect(existsSync(join(root, "public"))).toBe(false);
  });

  it("refuses an unknown item before touching the project", () => {
    const root = project();
    expect(() => add({ items: ["nope"], cwd: root, skipInstall: true })).toThrow(
      'Unknown item "nope"',
    );
    expect(existsSync(join(root, "src", "components"))).toBe(false);
  });

  it("refuses a directory that is not a project", () => {
    const root = mkdtempSync(join(tmpdir(), "me-gui-empty-"));
    made.push(root);
    expect(() => add({ items: ["input"], cwd: root, skipInstall: true })).toThrow(
      "No package.json",
    );
  });
});
