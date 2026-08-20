// @vitest-environment node
import { describe, expect, it } from "vitest";

import { applyCssVars, missingBaseTokens } from "../src/css.js";

const vars = (light = {}, theme = {}, dark = {}) => ({ theme, light, dark });

describe("applyCssVars", () => {
  it("adds a missing token to an existing block", () => {
    const css = ":root {\n  --radius: 0.5rem;\n}\n";
    const { css: out, added } = applyCssVars(css, vars({ "--brand": "#870052" }));

    expect(out).toMatch(/--brand:\s*#870052;/);
    expect(added).toEqual([":root --brand"]);
  });

  // A project that has already retuned the colour keeps its value on upgrade.
  it("leaves a token the project already declares alone", () => {
    const css = ":root {\n  --brand: #123456;\n}\n";
    const { css: out, added } = applyCssVars(css, vars({ "--brand": "#870052" }));

    expect(out).toBe(css);
    expect(added).toEqual([]);
  });

  it("does not confuse a token with one that merely starts the same way", () => {
    const css = ":root {\n  --brand-alt: #000;\n}\n";
    const { added } = applyCssVars(css, vars({ "--brand": "#870052" }));
    expect(added).toEqual([":root --brand"]);
  });

  it("creates the block when the stylesheet has none", () => {
    const { css: out, added } = applyCssVars(
      "@import 'tailwindcss';\n",
      vars({ "--brand": "#870052" }),
    );

    expect(out).toMatch(/:root \{\n {2}--brand: #870052;\n\}/);
    expect(added).toEqual([":root --brand"]);
  });

  it("matches the indentation the block already uses", () => {
    const css = ":root {\n    --radius: 0.5rem;\n}\n";
    const { css: out } = applyCssVars(css, vars({ "--brand": "#870052" }));
    expect(out).toContain("\n    --brand: #870052;");
  });

  it("counts braces, so a nested rule does not end the block early", () => {
    const css = "@theme inline {\n  --a: 1;\n  @media (min-width: 10px) { --b: 2; }\n}\n";
    const { css: out } = applyCssVars(css, vars({}, { "--color-brand": "var(--brand)" }));

    expect(out).toMatch(/--color-brand: var\(--brand\);\n\}/);
  });

  it("adds only the tokens that are missing", () => {
    const css = ":root {\n  --brand: #111;\n}\n";
    const { added } = applyCssVars(css, vars({ "--brand": "#870052", "--ink": "#0b1324" }));
    expect(added).toEqual([":root --ink"]);
  });

  // The registry ships light-only tokens, so a dark scope is not something the
  // CLI writes — not into a block the project already has, and certainly not
  // into one it would have to invent.
  it("ignores a dark scope entirely", () => {
    const css = ":root {\n  --a: 1;\n}\n\n.dark {\n  --a: 2;\n}\n";
    const { css: out, added } = applyCssVars(css, vars({}, {}, { "--b": "3" }));

    expect(out).toBe(css);
    expect(added).toEqual([]);
  });

  it("is a no-op when there is nothing to add", () => {
    const css = ":root {\n  --a: 1;\n}\n";
    expect(applyCssVars(css, vars()).css).toBe(css);
  });
});

describe("missingBaseTokens", () => {
  it("reports the tokens the stylesheet never defines", () => {
    const css = ":root {\n  --background: #fff;\n}\n";
    expect(missingBaseTokens(css, ["--background", "--ring"])).toEqual(["--ring"]);
  });

  it("finds a token declared anywhere, not only in :root", () => {
    const css = ".dark {\n  --ring: #000;\n}\n";
    expect(missingBaseTokens(css, ["--ring"])).toEqual([]);
  });

  it("does not accept a prefix match as the token", () => {
    const css = ":root {\n  --ring-offset: 1px;\n}\n";
    expect(missingBaseTokens(css, ["--ring"])).toEqual(["--ring"]);
  });
});
