/** Terminal output. Colour is dropped when stdout is piped or NO_COLOR is set. */

const ESC = String.fromCharCode(27);
const enabled = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (enabled ? `${ESC}[${code}m${text}${ESC}[0m` : String(text));

export const bold = paint(1);
export const dim = paint(2);
export const red = paint(31);
export const green = paint(32);
export const yellow = paint(33);
export const cyan = paint(36);

export function line(text = "") {
  console.log(text);
}

export function heading(text) {
  console.log(`\n${bold(text)}`);
}

export function bullet(mark, text, note) {
  console.log(`  ${mark} ${text}${note ? ` ${dim(note)}` : ""}`);
}

export function warn(text) {
  console.warn(`${yellow("warning")} ${text}`);
}

export function fail(text) {
  console.error(`${red("error")} ${text}`);
}
