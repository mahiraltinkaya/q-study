# me-ui

Copies the design system's components into your project. They land as your files —
edit them, restyle them, delete the parts you do not need. Nothing is imported from
`node_modules` at runtime, so there is no version to keep in step and no wrapper to
fight when a screen needs something slightly different.

```bash
npx @mahiraltinkaya/me-ui add input
```

## Commands

```bash
npx @mahiraltinkaya/me-ui add <item…>     # copy items and everything they depend on
npx @mahiraltinkaya/me-ui list            # show every item
```

| Option             |                                                      |
| ------------------ | ---------------------------------------------------- |
| `-c, --cwd <path>` | project to install into (default: current directory) |
| `-o, --overwrite`  | replace files that already exist                     |
| `--dry-run`        | show what would happen, write nothing                |
| `--skip-install`   | do not run the package manager                       |

Existing files are never replaced silently. A file you have edited is reported and
left alone until you pass `--overwrite`, so re-running `add` to pick up a dependency
cannot cost you local changes.

## Items

| Item               | What it is                                                         |
| ------------------ | ------------------------------------------------------------------ |
| `utils`            | `cn` — clsx piped through tailwind-merge.                          |
| `brand-theme`      | The `--brand` token the fields paint focus and error states with.  |
| `field-hint`       | Focus-driven explanatory panel anchored to a field.                |
| `input`            | Text field with optional leading icon and hint.                    |
| `select`           | Dropdown over a string list, matching `input`'s affordances.       |
| `button`           | Button with `cva` variant and size sets.                           |
| `tooltip`          | Tooltip provider, root, trigger and content.                       |
| `stepper`          | Progress rail for multi-step flows.                                |
| `stepper-provider` | Step state, next/back guards and the `useStepper` hook.            |
| `step-field`       | Label, control and validation message.                             |
| `form-fields`      | `FormInput` and `FormSelect`, bound to react-hook-form.            |
| `normalize`        | `digits` — strips everything that is not a digit.                  |
| `tckn`             | T.C. kimlik no validation, check digits included.                  |
| `quote-schema`     | Zod schemas for the quote flow, plus per-step fields and defaults. |

Dependencies resolve on their own — `me-ui add form-fields` also brings `input`,
`select`, `step-field`, `cn`, the npm packages and the `--brand` token.

## Where files land

A `components.json` is honoured when the project has one, so files follow the
aliases the rest of its UI already uses. Otherwise the CLI reads `tsconfig.json`
paths, falling back to the `src/` convention:

| Registry path     | Default destination   |
| ----------------- | --------------------- |
| `components/ui/…` | `src/components/ui/…` |
| `components/…`    | `src/components/…`    |
| `lib/…`           | `src/lib/…`           |

Imports inside the copied files are rewritten to match, whatever the aliases are.

## What the project needs first

- **React 19** and **Tailwind CSS v4**.
- **A shadcn base theme.** The components style against `--border`, `--input`,
  `--muted-foreground` and friends. `add` warns about any that are missing —
  `npx shadcn@latest init` is the quickest way to get them.

## Publishing

Public package on npmjs.com — anyone can run `npx @mahiraltinkaya/me-ui` without an account or a
token.

```bash
bun run ui:sync                 # from the repo root, after changing any component
cd packages/me-ui
npm version patch               # npm refuses to overwrite a published version
npm publish
```

`prepublishOnly` re-checks that `registry/` still matches the app it was copied
from, so a stale component cannot ship.

Copied files do not update themselves — that is the point of copying rather than
importing. To take a newer version of a component:

```bash
npx @mahiraltinkaya/me-ui@latest add input --overwrite
```

`@latest` matters because npx will otherwise happily reuse a cached older build,
and `--overwrite` matters because `add` protects existing files by default. Run it
with `--dry-run` first if the file has local edits worth keeping.
