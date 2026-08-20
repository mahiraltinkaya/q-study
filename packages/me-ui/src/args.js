/** Argument parsing. Hand-rolled so the package stays dependency-free. */

const FLAGS = {
  overwrite: "overwrite",
  o: "overwrite",
  "dry-run": "dryRun",
  "skip-install": "skipInstall",
  help: "help",
  h: "help",
  version: "version",
  v: "version",
};

const OPTIONS = { cwd: "cwd", c: "cwd" };

export function parseArgs(argv) {
  const result = { command: undefined, items: [], cwd: process.cwd() };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith("-")) {
      if (result.command === undefined) result.command = arg;
      else result.items.push(arg);
      continue;
    }

    // `--cwd=x` and `--cwd x` are both accepted.
    const [name, inlineValue] = arg.replace(/^--?/, "").split(/=(.*)/s);

    if (OPTIONS[name]) {
      const value = inlineValue ?? argv[++index];
      if (value === undefined) throw new Error(`--${name} needs a value.`);
      result[OPTIONS[name]] = value;
      continue;
    }

    if (FLAGS[name]) {
      result[FLAGS[name]] = true;
      continue;
    }

    throw new Error(`Unknown option "${arg}".`);
  }

  return result;
}
