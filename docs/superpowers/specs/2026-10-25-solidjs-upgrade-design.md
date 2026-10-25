# Solidoku dependency upgrade — design

Date: 2026-10-25

## Intent

Bring Solidoku's toolchain up to current stable releases. The app is a small
Solid 1.x sudoku game; nothing in its behavior should change.

## Goals

- Upgrade `solid-js` to the latest stable release (1.9.17).
- Upgrade the build toolchain to current stable: Vite 8, `vite-plugin-solid`
  2.11, TypeScript 7, pnpm 12 lockfile.
- Move the Node baseline to Node 24 LTS in `.nvmrc` and CI (Vite 8 requires
  Node >= 22.12).
- Update the GitHub Pages workflow to current action majors.
- Regenerate and commit `pnpm-lock.yaml`.

## Non-goals

- No Solid 2.0 migration. Solid 2 is still a release candidate and would
  require renderer, effect, store, and JSX changes.
- No new test framework. The project has no existing tests; verification is
  typecheck, production build, and a preview smoke check.
- No application feature work and no unrelated refactors.

## Anti-goals

- Shipping a build that only type-checks but fails at runtime.
- Silently dropping the GitHub Pages base path (`/solidoku/`).
- Leaving a stale lockfile or Node version behind.

## Approaches considered

1. **Full latest stable stack** — chosen. Solid 1.9.17, Vite 8, TypeScript 7,
   pnpm 12, Node 24 LTS, current Actions. Requires `moduleResolution:
   "bundler"` and dropping the unused `solid-devtools` package.
2. **Latest stack + Vitest/jsdom tests** — rejected for now. Adds test
   infrastructure the project never had; out of scope for a dependency bump.
3. **Conservative tooling** — rejected. Vite 7 / TypeScript 6 would leave the
   project one upgrade behind and does not satisfy the request.

## Decisions

| Item | From | To |
|------|------|----|
| `solid-js` | 1.8.12 | 1.9.17 |
| `vite` | 5.0.12 | 8.3.5 |
| `vite-plugin-solid` | 2.9.1 | 2.11.14 |
| `typescript` | 5.3.3 | 7.0.2 |
| `@types/node` | not present | 24.19.2 (required by Vite 8's types) |
| `solid-devtools` | 0.29.3 | removed (disabled, incompatible) |
| Node (`.nvmrc` / CI) | 21 / 18 | 24 LTS |
| pnpm lockfile | v6.0 | regenerated with pnpm 12; `packageManager` pins `pnpm@12.15.0` |
| Actions | checkout@v4, setup-node@v3, pnpm@v2, cache@v3, configure-pages@v3, upload-pages-artifact@v2, deploy-pages@v2 | checkout@v7, setup-node@v7, pnpm@v6, configure-pages@v6, upload-pages-artifact@v5, deploy-pages@v5 |

Details:

- `tsconfig.json`: `moduleResolution` changes from `node` to `bundler`
  (TypeScript 7 removed `node`/`node10`), and `types` gains `node` for
  Vite 8's Node typings.
- `package.json`: adds `"type": "module"` so the ESM Vite config loads
  without Vite's CommonJS compatibility warning.
- `vite.config.ts`: keep `solidPlugin()` and `base: '/solidoku/'`; remove the
  commented-out devtools import now that the package is gone.
- Workflow: use `actions/setup-node`'s built-in pnpm cache instead of the
  manual `actions/cache` store steps, and set `packageManager` in
  `package.json` for reproducible CI installs.
- App source is expected to need no changes. If TypeScript 7 surfaces a real
  type error, fix it minimally rather than disabling checks.

## Verification

1. `npx pnpm@12.15.0 install` regenerates the lockfile cleanly.
2. `npx pnpm exec tsc --noEmit` passes.
3. `npx pnpm build` produces `dist/` with the `/solidoku/` base.
4. `npx pnpm serve` serves the built app; request
   `http://localhost:4173/solidoku/` and confirm the HTML and hashed assets.
5. `npx pnpm audit` reports no new high/critical vulnerabilities.
6. Review the full diff; no app behavior changes.

## Left to the builder

- Choose exact patch versions if newer stable patches appear during install.
- Handle any TypeScript 7 errors discovered during verification.
