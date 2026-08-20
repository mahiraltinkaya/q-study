/** npm dependency detection and installation for the target project. */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const MANAGERS = [
  { lockfile: "bun.lock", command: "bun", verb: "add" },
  { lockfile: "bun.lockb", command: "bun", verb: "add" },
  { lockfile: "pnpm-lock.yaml", command: "pnpm", verb: "add" },
  { lockfile: "yarn.lock", command: "yarn", verb: "add" },
  { lockfile: "package-lock.json", command: "npm", verb: "install" },
];

const NPM = { command: "npm", verb: "install" };

// The npm package-name grammar. Names are interpolated into a shell string
// below, so they are checked against this first: today they only ever come
// from this package's own registry.json, but that file is data, and data can
// be edited by someone who does not know it reaches a shell.
const SAFE_NAME = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

export function detectPackageManager(root) {
  return MANAGERS.find(({ lockfile }) => existsSync(join(root, lockfile))) ?? NPM;
}

export function missingDependencies(project, dependencies) {
  return dependencies.filter((name) => !(name in project.installedDependencies));
}

export function installDependencies(project, dependencies) {
  const unsafe = dependencies.filter((name) => !SAFE_NAME.test(name));
  if (unsafe.length > 0) {
    throw new Error(`Refusing to install unexpected package name(s): ${unsafe.join(", ")}`);
  }

  const manager = detectPackageManager(project.root);
  const invocation = `${manager.command} ${manager.verb} ${dependencies.join(" ")}`;

  // Passed as one string rather than command + args: every package manager is a
  // `.cmd` shim on Windows, which Node refuses to spawn without a shell, and an
  // args array combined with `shell` is deprecated. The names are validated above.
  const result = spawnSync(invocation, { cwd: project.root, stdio: "inherit", shell: true });

  if (result.status !== 0) {
    throw new Error(
      `\`${invocation}\` failed. Install the packages yourself, or re-run with --skip-install.`,
    );
  }

  return manager.command;
}
