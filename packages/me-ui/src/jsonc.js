/**
 * Minimal JSON-with-comments reader, for `tsconfig.json` — which is routinely
 * written with comments and trailing commas that `JSON.parse` rejects.
 *
 * Comments are stripped by scanning rather than by regex, so a `//` or `/*`
 * sitting inside a string literal (a path, a URL) is left alone.
 */

export function parseJsonc(text) {
  let output = "";
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    if (char === '"') {
      const start = index;
      index += 1;
      while (index < text.length && text[index] !== '"') {
        index += text[index] === "\\" ? 2 : 1;
      }
      index += 1;
      output += text.slice(start, index);
      continue;
    }

    if (char === "/" && text[index + 1] === "/") {
      while (index < text.length && text[index] !== "\n") index += 1;
      continue;
    }

    if (char === "/" && text[index + 1] === "*") {
      index += 2;
      while (index < text.length && !(text[index] === "*" && text[index + 1] === "/")) index += 1;
      index += 2;
      continue;
    }

    output += char;
    index += 1;
  }

  return JSON.parse(output.replace(/,(\s*[}\]])/g, "$1"));
}
