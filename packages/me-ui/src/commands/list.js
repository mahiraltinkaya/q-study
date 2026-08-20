/** `me-ui list` — the catalogue, with what each item drags in behind it. */

import { manifest } from "../manifest.js";
import { bold, cyan, dim, line } from "../log.js";

export function list() {
  line(`\n${bold("Items")} ${dim("— me-ui add <name…>")}\n`);

  const width = Math.max(...manifest.items.map((item) => item.name.length));

  for (const item of manifest.items) {
    const dependencies = item.registryDependencies ?? [];
    line(`  ${cyan(item.name.padEnd(width))}  ${item.description}`);
    if (dependencies.length > 0) {
      line(`  ${" ".repeat(width)}  ${dim(`also installs: ${dependencies.join(", ")}`)}`);
    }
  }

  line("");
}
