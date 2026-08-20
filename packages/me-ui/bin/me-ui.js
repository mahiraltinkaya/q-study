#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseArgs } from "../src/args.js";
import { add } from "../src/commands/add.js";
import { list } from "../src/commands/list.js";
import { bold, cyan, dim, fail, line } from "../src/log.js";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const { version } = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));

const HELP = `
${bold("me-ui")} ${dim(`v${version}`)}

  Copies components into your project. They become your files — edit them freely.

${bold("Usage")}
  ${cyan("npx @mahiraltinkaya/me-ui add")} <item…>     copy items and their dependencies
  ${cyan("npx @mahiraltinkaya/me-ui list")}            show every item

${bold("Options")}
  -c, --cwd <path>            project to install into ${dim("(default: current directory)")}
  -o, --overwrite             replace files that already exist
      --dry-run               show what would happen, write nothing
      --skip-install          do not run the package manager
  -h, --help                  this text
  -v, --version               print the version

${bold("Examples")}
  ${dim("$")} npx @mahiraltinkaya/me-ui add input
  ${dim("$")} npx @mahiraltinkaya/me-ui add form-fields quote-schema
  ${dim("$")} npx @mahiraltinkaya/me-ui add stepper --dry-run
`;

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.version) return line(version);
  if (options.help || !options.command) return line(HELP);

  switch (options.command) {
    case "add":
      return add(options);
    case "list":
    case "ls":
      return list();
    default:
      throw new Error(`Unknown command "${options.command}". Try \`me-ui --help\`.`);
  }
}

try {
  main();
} catch (error) {
  fail(error.message);
  process.exit(1);
}
