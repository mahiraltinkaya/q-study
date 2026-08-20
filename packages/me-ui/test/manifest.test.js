// @vitest-environment node
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  cssVarsOf,
  itemNames,
  manifest,
  npmDependenciesOf,
  registryDir,
  resolveItems,
} from "../src/manifest.js";

const names = (items) => items.map((item) => item.name);

describe("resolveItems", () => {
  it("orders every dependency ahead of whatever asked for it", () => {
    const ordered = names(resolveItems(["input"]));
    expect(ordered).toContain("input");
    expect(ordered.indexOf("utils")).toBeLessThan(ordered.indexOf("field-hint"));
    expect(ordered.indexOf("field-hint")).toBeLessThan(ordered.indexOf("input"));
  });

  it("installs a shared dependency once, not per dependant", () => {
    const ordered = names(resolveItems(["input", "select"]));
    expect(ordered.filter((name) => name === "utils")).toHaveLength(1);
    expect(ordered.filter((name) => name === "field-hint")).toHaveLength(1);
  });

  it("returns nothing for an empty request", () => {
    expect(resolveItems([])).toEqual([]);
  });

  it("names the unknown item rather than failing obscurely", () => {
    expect(() => resolveItems(["nope"])).toThrow('Unknown item "nope"');
  });

  it("is idempotent when the same name is asked for twice", () => {
    expect(names(resolveItems(["utils", "utils"]))).toEqual(["utils"]);
  });
});

describe("npmDependenciesOf", () => {
  it("deduplicates across items", () => {
    const deps = npmDependenciesOf(resolveItems(["input", "select"]));
    expect(deps).toEqual([...new Set(deps)]);
    expect(deps).toContain("@base-ui/react");
  });

  it("is empty for an item that needs no packages", () => {
    expect(npmDependenciesOf([{ name: "x" }])).toEqual([]);
  });
});

describe("cssVarsOf", () => {
  it("always returns both scopes", () => {
    expect(Object.keys(cssVarsOf([]))).toEqual(["theme", "light"]);
  });

  it("merges the tokens every requested item declares", () => {
    const vars = cssVarsOf(resolveItems(["input"]));
    // brand-theme comes in through field-hint, which also brings its own token.
    expect(vars.light["--brand"]).toBe("#870052");
    expect(vars.light["--ink"]).toBe("#0b1324");
  });
});

describe("the shipped manifest", () => {
  it("has a unique name per item", () => {
    expect(new Set(itemNames).size).toBe(itemNames.length);
  });

  it("only references registry dependencies that exist", () => {
    for (const item of manifest.items) {
      for (const dependency of item.registryDependencies ?? []) {
        expect(itemNames, `${item.name} -> ${dependency}`).toContain(dependency);
      }
    }
  });

  // The check `ui:check` cannot make: that the synced copy is actually there.
  it("has every declared file present in the registry directory", () => {
    for (const item of manifest.items) {
      for (const file of item.files ?? []) {
        expect(existsSync(join(registryDir, file.path)), file.path).toBe(true);
      }
    }
  });

  it("resolves every item without a cycle hanging the process", () => {
    expect(() => resolveItems(itemNames)).not.toThrow();
  });
});
