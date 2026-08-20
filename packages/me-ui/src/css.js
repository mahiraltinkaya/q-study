/**
 * Writes design tokens into the target project's stylesheet.
 *
 * Only missing declarations are added — an existing `--brand` is left alone, so
 * a project that has already retuned the colour keeps its value across upgrades.
 */

const BLOCKS = [
  { scope: "theme", selector: "@theme inline" },
  { scope: "light", selector: ":root" },
];

/** Body of `selector { … }`, located by counting braces so nested rules survive. */
function findBlock(css, selector) {
  const opening = new RegExp(
    `(^|})\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*{`,
    "m",
  );
  const match = opening.exec(css);
  if (!match) return undefined;

  const start = match.index + match[0].length;
  let depth = 1;
  let index = start;

  while (index < css.length && depth > 0) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    index += 1;
  }

  return { start, end: index - 1 };
}

function indentationOf(body) {
  const match = /\n([ \t]+)\S/.exec(body);
  return match ? match[1] : "  ";
}

function addToBlock(css, block, declarations) {
  const body = css.slice(block.start, block.end);
  const indent = indentationOf(body);
  const addition = declarations.map(([name, value]) => `${indent}${name}: ${value};`).join("\n");
  const separator = body.trimEnd().endsWith(";") || body.trim() === "" ? "" : "\n";
  return `${css.slice(0, block.end).trimEnd()}\n${separator}${addition}\n${css.slice(block.end)}`;
}

function appendBlock(css, selector, declarations) {
  const body = declarations.map(([name, value]) => `  ${name}: ${value};`).join("\n");
  return `${css.trimEnd()}\n\n${selector} {\n${body}\n}\n`;
}

/** Returns the stylesheet with every variable applied, plus the names it added. */
export function applyCssVars(css, cssVars) {
  const added = [];
  let output = css;

  for (const { scope, selector } of BLOCKS) {
    const wanted = Object.entries(cssVars[scope] ?? {});
    if (wanted.length === 0) continue;

    const block = findBlock(output, selector);
    const declared = block ? output.slice(block.start, block.end) : "";
    const missing = wanted.filter(
      ([name]) => !new RegExp(`(^|[;{\\s])${name}\\s*:`).test(declared),
    );
    if (missing.length === 0) continue;

    output = block ? addToBlock(output, block, missing) : appendBlock(output, selector, missing);

    added.push(...missing.map(([name]) => `${selector} ${name}`));
  }

  return { css: output, added };
}

/** Base tokens the components style against but do not themselves define. */
export function missingBaseTokens(css, tokens) {
  return tokens.filter((token) => !new RegExp(`(^|[;{\\s])${token}\\s*:`).test(css));
}
