/** `me-ui add <items…>` — copies items and everything they depend on. */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

import { applyCssVars, missingBaseTokens } from "../css.js";
import { installDependencies, missingDependencies } from "../deps.js";
import { cssVarsOf, manifest, npmDependenciesOf, registryDir, resolveItems } from "../manifest.js";
import { displayPathOf, rewriteImports, targetPathOf } from "../paths.js";
import { loadProject } from "../project.js";
import { bullet, cyan, dim, green, heading, line, warn, yellow } from "../log.js";

/** Decides, per file, between writing it, replacing it, and leaving it alone. */
function planFiles(items, project) {
  return items
    .flatMap((item) => item.files ?? [])
    .map((file) => {
      const target = targetPathOf(file, project);
      const source = readFileSync(join(registryDir, file.path), "utf8");
      const contents = file.target ? source : rewriteImports(source, project);
      const current = existsSync(target) ? readFileSync(target, "utf8") : undefined;

      const action =
        current === undefined ? "create" : current === contents ? "identical" : "conflict";

      return { display: displayPathOf(file, project), target, contents, action };
    });
}

const MARKS = {
  create: green("+"),
  overwrite: yellow("~"),
  identical: dim("="),
  conflict: yellow("!"),
};

function reportPlan(plan, overwrite) {
  heading("Files");
  for (const file of plan) {
    const action = file.action === "conflict" && overwrite ? "overwrite" : file.action;
    const note = { identical: "unchanged", conflict: "exists — pass --overwrite to replace" }[
      action
    ];
    bullet(MARKS[action], file.display, note);
  }
}

export function add({ items: names, cwd, overwrite, dryRun, skipInstall }) {
  if (names.length === 0) {
    throw new Error("Name at least one item, for example `me-ui add input`.");
  }

  const items = resolveItems(names);
  const project = loadProject(cwd);

  line(
    `${cyan("me-ui")} add ${names.join(" ")}${dryRun ? dim(" (dry run)") : ""}\n` +
      dim(`  into ${project.root}`) +
      dim(project.usesComponentsJson ? " — using its components.json aliases" : ""),
  );

  const plan = planFiles(items, project);
  const writable = plan.filter(
    (file) => file.action === "create" || (file.action === "conflict" && overwrite),
  );
  reportPlan(plan, overwrite);

  const dependencies = missingDependencies(project, npmDependenciesOf(items));
  if (dependencies.length > 0) {
    heading("Dependencies");
    dependencies.forEach((name) => bullet(green("+"), name));
  }

  const cssVars = cssVarsOf(items);
  const css = project.cssFile ? readFileSync(project.cssFile, "utf8") : undefined;
  const styles = css === undefined ? { css, added: [] } : applyCssVars(css, cssVars);
  if (styles.added.length > 0) {
    heading("Styles");
    styles.added.forEach((name) => bullet(green("+"), name));
  }

  if (dryRun) {
    line(`\n${dim("Dry run — nothing was written.")}`);
    return;
  }

  for (const file of writable) {
    mkdirSync(dirname(file.target), { recursive: true });
    writeFileSync(file.target, file.contents);
  }

  if (styles.added.length > 0) writeFileSync(project.cssFile, styles.css);

  if (dependencies.length > 0 && !skipInstall) {
    line("");
    installDependencies(project, dependencies);
  }

  line(`\n${green("Done.")} ${writable.length} file(s) written.`);

  if (!project.cssFile && Object.keys(cssVars.light).length > 0) {
    warn("No stylesheet found — add the design tokens by hand:");
    Object.entries(cssVars.light).forEach(([name, value]) => bullet(" ", `${name}: ${value};`));
  }

  const absent = css === undefined ? [] : missingBaseTokens(css, manifest.baseTokens);
  if (absent.length > 0) {
    warn(
      `These components also style against tokens this project does not define: ${absent.join(", ")}. ` +
        "They come from a shadcn base theme — run `npx shadcn@latest init` if the components look unstyled.",
    );
  }

  if (dependencies.length > 0 && skipInstall) {
    warn(`Skipped install. Add these yourself: ${dependencies.join(" ")}`);
  }
}
