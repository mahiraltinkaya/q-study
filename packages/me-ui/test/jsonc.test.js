// @vitest-environment node
import { describe, expect, it } from "vitest";

import { parseJsonc } from "../src/jsonc.js";

describe("parseJsonc", () => {
  it("reads plain JSON", () => {
    expect(parseJsonc('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips line comments", () => {
    expect(parseJsonc('{\n // note\n "a": 1\n}')).toEqual({ a: 1 });
  });

  it("strips block comments, including multi-line ones", () => {
    expect(parseJsonc('{\n /* one\n    two */\n "a": 1\n}')).toEqual({ a: 1 });
  });

  it("allows a trailing comma in an object", () => {
    expect(parseJsonc('{"a": 1,}')).toEqual({ a: 1 });
  });

  it("allows a trailing comma in an array", () => {
    expect(parseJsonc('{"a": [1, 2,]}')).toEqual({ a: [1, 2] });
  });

  // The reason the reader scans instead of running a regex over the text.
  it("leaves a // inside a string alone", () => {
    expect(parseJsonc('{"url": "https://example.com/x"}')).toEqual({
      url: "https://example.com/x",
    });
  });

  it("leaves a /* inside a string alone", () => {
    expect(parseJsonc('{"glob": "src/**/*.ts"}')).toEqual({ glob: "src/**/*.ts" });
  });

  it("handles an escaped quote inside a string", () => {
    expect(parseJsonc('{"q": "he said \\"hi\\""}')).toEqual({ q: 'he said "hi"' });
  });

  it("handles a path ending in a backslash before the closing quote", () => {
    expect(parseJsonc('{"p": "C:\\\\dir\\\\"}')).toEqual({ p: "C:\\dir\\" });
  });

  it("parses a realistic tsconfig", () => {
    const text = `{
      // Compiler settings
      "compilerOptions": {
        "baseUrl": ".", /* project root */
        "paths": { "@/*": ["./src/*"] },
      },
    }`;
    expect(parseJsonc(text).compilerOptions.paths).toEqual({ "@/*": ["./src/*"] });
  });

  it("still throws on genuinely broken JSON", () => {
    expect(() => parseJsonc("{ nope }")).toThrow();
  });
});
