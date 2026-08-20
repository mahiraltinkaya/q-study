// @vitest-environment node
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { displayPathOf, rewriteImports, targetPathOf } from "../src/paths.js";

const ROOT = join("/", "app");

const project = {
  root: ROOT,
  aliases: {
    ui: "@/components/ui",
    components: "@/components",
    lib: "@/lib",
    hooks: "@/hooks",
  },
  directories: {
    ui: join(ROOT, "src", "components", "ui"),
    components: join(ROOT, "src", "components"),
    lib: join(ROOT, "src", "lib"),
    hooks: join(ROOT, "src", "hooks"),
  },
};

/** A project that keeps its UI somewhere else entirely. */
const custom = {
  root: ROOT,
  aliases: { ui: "@/ds/controls", components: "@/ds", lib: "@/utils", hooks: "@/hooks" },
  directories: {
    ui: join(ROOT, "app", "ds", "controls"),
    components: join(ROOT, "app", "ds"),
    lib: join(ROOT, "app", "utils"),
    hooks: join(ROOT, "app", "hooks"),
  },
};

describe("targetPathOf", () => {
  it("prefers the longest matching root, so ui never lands under components", () => {
    expect(targetPathOf({ path: "components/ui/input.tsx" }, project)).toBe(
      join(ROOT, "src", "components", "ui", "input.tsx"),
    );
  });

  it("maps a nested path under its root", () => {
    expect(targetPathOf({ path: "components/ui/stepper/index.tsx" }, project)).toBe(
      join(ROOT, "src", "components", "ui", "stepper", "index.tsx"),
    );
  });

  it("maps a plain component", () => {
    expect(targetPathOf({ path: "components/stepper-provider.tsx" }, project)).toBe(
      join(ROOT, "src", "components", "stepper-provider.tsx"),
    );
  });

  it("pins a targeted file to the project root, which is how assets reach public/", () => {
    const file = { path: "assets/arrow.svg", target: "public/assets/images/arrow.svg" };
    expect(targetPathOf(file, project)).toBe(join(ROOT, "public", "assets", "images", "arrow.svg"));
  });

  it("refuses a path outside every known root", () => {
    expect(() => targetPathOf({ path: "weird/x.ts" }, project)).toThrow("outside every known root");
  });
});

describe("displayPathOf", () => {
  it("is relative to the project and uses forward slashes", () => {
    expect(displayPathOf({ path: "components/ui/input.tsx" }, project)).toBe(
      "src/components/ui/input.tsx",
    );
  });
});

describe("rewriteImports", () => {
  it("leaves imports alone when the project uses the default aliases", () => {
    const source = 'import { cn } from "@/lib/utils";';
    expect(rewriteImports(source, project)).toBe(source);
  });

  it("retargets each root to the project's own alias", () => {
    const source = [
      'import { cn } from "@/lib/utils";',
      'import { Input } from "@/components/ui/input";',
      'import { Provider } from "@/components/stepper-provider";',
    ].join("\n");

    expect(rewriteImports(source, custom)).toBe(
      [
        'import { cn } from "@/utils/utils";',
        'import { Input } from "@/ds/controls/input";',
        'import { Provider } from "@/ds/stepper-provider";',
      ].join("\n"),
    );
  });

  // Rewriting root by root would let `components` match the `@/ds/controls`
  // that the `components/ui` rule had just produced.
  it("rewrites each specifier exactly once", () => {
    const source = 'import { Input } from "@/components/ui/input";';
    expect(rewriteImports(source, custom)).toBe('import { Input } from "@/ds/controls/input";');
  });

  it("does not touch a root the components never import from", () => {
    const source = 'import { thing } from "@/features/thing";';
    expect(rewriteImports(source, custom)).toBe(source);
  });

  it("handles single quotes", () => {
    expect(rewriteImports("import x from '@/lib/utils';", custom)).toBe(
      "import x from '@/utils/utils';",
    );
  });

  it("does not rewrite a bare alias that is not followed by a path separator", () => {
    const source = 'import x from "@/libra/thing";';
    expect(rewriteImports(source, custom)).toBe(source);
  });
});
