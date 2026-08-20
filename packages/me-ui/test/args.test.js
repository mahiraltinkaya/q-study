// @vitest-environment node
import { describe, expect, it } from "vitest";

import { parseArgs } from "../src/args.js";

describe("parseArgs", () => {
  it("takes the first bare word as the command and the rest as items", () => {
    const result = parseArgs(["add", "input", "select"]);
    expect(result.command).toBe("add");
    expect(result.items).toEqual(["input", "select"]);
  });

  it("defaults cwd to the process directory", () => {
    expect(parseArgs(["list"]).cwd).toBe(process.cwd());
  });

  it.each([
    [["add", "input", "--cwd", "/tmp/app"], "/tmp/app"],
    [["add", "input", "--cwd=/tmp/app"], "/tmp/app"],
    [["add", "input", "-c", "/tmp/app"], "/tmp/app"],
  ])("reads the cwd option from %j", (argv, expected) => {
    expect(parseArgs(argv).cwd).toBe(expected);
  });

  it("keeps an `=` that appears inside the value", () => {
    expect(parseArgs(["add", "--cwd=/tmp/a=b"]).cwd).toBe("/tmp/a=b");
  });

  it.each([
    ["--overwrite", "overwrite"],
    ["-o", "overwrite"],
    ["--dry-run", "dryRun"],
    ["--skip-install", "skipInstall"],
    ["--help", "help"],
    ["-h", "help"],
    ["--version", "version"],
    ["-v", "version"],
  ])("turns %s into %s", (flag, key) => {
    expect(parseArgs(["add", flag])[key]).toBe(true);
  });

  it("does not swallow the next argument after a flag", () => {
    const result = parseArgs(["add", "--overwrite", "input"]);
    expect(result.items).toEqual(["input"]);
  });

  it("rejects an unknown option rather than ignoring it", () => {
    expect(() => parseArgs(["add", "--nope"])).toThrow('Unknown option "--nope"');
  });

  it("rejects a value option with nothing after it", () => {
    expect(() => parseArgs(["add", "--cwd"])).toThrow("--cwd needs a value");
  });

  it("leaves the command undefined when only flags are given", () => {
    expect(parseArgs(["--help"]).command).toBeUndefined();
  });
});
