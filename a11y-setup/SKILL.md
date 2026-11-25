---
name: a11y-setup
description: One-time setup of WCAG 2.2 AA accessibility checks in an Astro, Next.js or React (Vite) project; jsx-a11y lint, pre-commit hook, axe/keyboard/aria-snapshot Playwright tests, GitHub Action and CLAUDE.md rules. Use when asked to add or set up accessibility (a11y) checks, linting or testing in a project.
license: Apache-2.0
metadata:
    author: Chris Centrella
    version: 1.0
---

# a11y-setup

Target WCAG 2.2 AA (covers 2.1 AA). Copy files from `templates/` (next to this file) **verbatim**; only fill the marked values. Never regenerate them. Never add accessibility overlays or widgets.

**Idempotent:** check before every write. Extend configs, never overwrite or duplicate. If a target file already exists, leave it and note it for the report.

## 0. Detect (report before changing anything)
- Framework: `next` in deps → Next; `astro` → Astro; `vite` + `react` → React.
- Package manager from lockfile:

| lockfile | RUN | EXEC | INSTALL_CI | ADD_DEV | CACHE |
|---|---|---|---|---|---|
| package-lock.json / none | `npm run` | `npx` | `npm ci` | `npm i -D` | npm |
| pnpm-lock.yaml | `pnpm` | `pnpm exec` | `pnpm install --frozen-lockfile` | `pnpm add -D` | pnpm |
| yarn.lock | `yarn` | `yarn` | `yarn install --immutable` (v1: `--frozen-lockfile`) | `yarn add -D` | yarn |
| bun.lock / bun.lockb | `bun run` | `bunx` | `bun install --frozen-lockfile` | `bun add -d` | (none) |

- ESLint: flat (`eslint.config.*`), legacy (`.eslintrc*` / `eslintConfig`), or none.
- Hook tool: `.husky/`, `lefthook.yml`, `simple-git-hooks` in package.json, or none.
- Playwright: `@playwright/test` installed? Existing `playwright.config.*`?
- Ask once: "Is this a client site?" (step 6).

## 1. Lint
Install missing: `eslint`, `eslint-plugin-jsx-a11y`; Astro also `eslint-plugin-astro` (+ `typescript-eslint` if `.astro` files use TS).

| | flat | legacy |
|---|---|---|
| Astro | `...eslintPluginAstro.configs['jsx-a11y-strict']` (older plugin: `'flat/jsx-a11y-strict'`) | extends `plugin:astro/jsx-a11y-strict` |
| React | `{ files: ['**/*.{jsx,tsx}'], ...jsxA11y.flatConfigs.strict }` | extends `plugin:jsx-a11y/strict` |
| Next | `{ files: ['**/*.{jsx,tsx}'], rules: jsxA11y.flatConfigs.strict.rules }` (eslint-config-next already registers the plugin; redefining it errors) | extends `plugin:jsx-a11y/strict` |

No config: create `eslint.config.js` with the framework base plus that line.

Script `lint:a11y`:
- Astro: `eslint "src/**/*.{astro,jsx,tsx}"`
- React: `eslint "src/**/*.{jsx,tsx}"`
- Next: `eslint --no-error-on-unmatched-pattern "{app,src,pages,components}/**/*.{jsx,tsx}"`

## 2. Pre-commit (staged files only; never Playwright)
Glob `*.{astro,jsx,tsx}` (drop `astro` outside Astro).
- husky / simple-git-hooks: `ADD_DEV lint-staged`; add `"lint-staged": { "<glob>": "eslint" }` to package.json (merge with existing config); hook runs `<EXEC> lint-staged`. Append to an existing hook, don't replace it.
- lefthook: add `pre-commit.commands.a11y-lint` with `glob: "<glob>"` and `run: <EXEC> eslint {staged_files}`.
- none: `ADD_DEV husky lint-staged`, `<EXEC> husky init`, then replace the default `.husky/pre-commit` body with `<EXEC> lint-staged`.

## 3. Browser tests
- If Playwright is missing: `ADD_DEV @playwright/test`. Then `ADD_DEV @axe-core/playwright` and `<EXEC> playwright install chromium`.
- Copy `templates/tests/a11y/*` → `tests/a11y/` and `templates/playwright.a11y.config.ts` → project root. A separate config never clobbers an existing one: reuse an existing config's webServer command/port, and if its `testDir` would pick up `tests/a11y`, add `testIgnore: '**/a11y/**'` to it.
- Set PORT / BUILD / SERVE at the top of the config:
  - Astro: `4321`, `<RUN> build`, `<EXEC> astro preview --port 4321` (adapter without preview: `astro dev`)
  - Next: `3000`, `<RUN> build`, `<EXEC> next start -p 3000` (`output: 'export'`: add `serve`, use `<EXEC> serve out -l 3000`)
  - React: `4173`, `<RUN> build`, `<EXEC> vite preview --port 4173 --strictPort`
- Fill `ROUTES` in axe.spec.ts (one per page template; used only when no sitemap is built) and `KEY_PAGES` in aria-snapshot.spec.ts.
- Leave keyboard.spec.ts at `CONFIGURED = false` unless the user gives selectors; it skips until then.
- Script `test:a11y`: `playwright test -c playwright.a11y.config.ts`.
- Add `playwright-report/` and `test-results/` to `.gitignore` if missing.

## 4. GitHub Actions
Copy `templates/github-workflow-a11y.yml` → `.github/workflows/a11y.yml`. Replace `__CACHE__`, `__INSTALL_CI__`, `__RUN__`, `__EXEC__`. Keep the pnpm step only for pnpm, the bun step only for bun.

## 5. CLAUDE.md
If CLAUDE.md has no `## Accessibility` heading, append `templates/CLAUDE-accessibility.md` (create CLAUDE.md if missing). Otherwise leave it and report.

## 6. Client site only
Remind the user (don't implement): require alt text in the CMS with a "decorative" checkbox as the only skip; add an accessibility statement page with a contact email; add a contract clause that the client owns content they add.

## 7. Finish
1. Create aria baselines: `<RUN> test:a11y tests/a11y/aria-snapshot.spec.ts --update-snapshots`; tell the user to commit the `*-snapshots/` folder.
2. Run `<RUN> lint:a11y` and `<RUN> test:a11y` once.
3. Report violations grouped by rule: id, impact, count, pages/files, help URL. **Don't fix anything without asking.**
4. Summarize files added, files changed, what already existed, deps installed.
5. Remind: mark the `a11y` check as required in branch protection so failures block merge; fill in the keyboard.spec.ts TODOs.
