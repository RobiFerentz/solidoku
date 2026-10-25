# Solidoku Dependency Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Solidoku to Solid 1.9.17 and current stable tooling (Vite 8, TypeScript 7, pnpm 12, Node 24 LTS) without changing app behavior.

**Architecture:** This is a manifest-and-config upgrade. `package.json` and the lockfile move first, then TypeScript/Vite config is aligned, then the Node/CI baseline is raised. Application source is intentionally untouched; any TypeScript 7 error is fixed minimally in place.

**Tech Stack:** Solid 1.9.17, Vite 8.3.5, vite-plugin-solid 2.11.14, TypeScript 7.0.2, pnpm 12.15.0, Node 24 LTS, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-25-solidjs-upgrade-design.md`

## Global Constraints

- `solid-js` must be `^1.9.17`; do **not** install Solid 2 (currently only a release candidate).
- `vite` must be `^8.3.5`; `vite-plugin-solid` must be `^2.11.14`; `typescript` must be `^7.0.2`.
- `solid-devtools` must be removed; it is disabled in config and incompatible with Vite 8.
- Node baseline is 24 LTS in `.nvmrc` and CI. Vite 8 requires Node >= 22.12.
- pnpm is not installed globally; run it as `npx pnpm@12.15.0 ...`.
- The GitHub Pages base path must remain `/solidoku/`.
- No new test framework, no application features, no unrelated refactors.
- Do not hand-edit `pnpm-lock.yaml`; regenerate it with pnpm.

## Review Focus

- **Cold CI install:** a clean `pnpm install --frozen-lockfile` from the committed lockfile must succeed under pnpm 12 (Task 3).
- **GitHub Pages base path:** built assets must be requested from `/solidoku/assets/...`, not `/assets/...` (Task 2).
- **Saved games:** existing `localStorage` games must still load; the stored JSON shape must not change (Task 4 source-diff guard and manual click-through).
- **Keyboard controls:** arrow keys, digit entry, and backspace clearing must behave as before (Task 4 source-diff guard and manual click-through).
- **Pages workflow validity:** action majors, permissions, and Node/pnpm versions must be valid for GitHub Pages (Task 3 YAML parse plus diff review).

---

### Task 1: Upgrade dependency manifest and lockfile

**Files:**
- Modify: `package.json`
- Modify (regenerated): `pnpm-lock.yaml`

**Interfaces:**
- Consumes: nothing.
- Produces: installed `solid-js@1.9.17`, `vite@8.3.5`, `vite-plugin-solid@2.11.14`, `typescript@7.0.2` available to `pnpm exec`.

- [ ] **Step 1: Update `package.json`**

Set the dependency blocks exactly as follows, and add `packageManager` at the top level (after `"license"`):

```json
{
  "license": "MIT",
  "packageManager": "pnpm@12.15.0",
  "devDependencies": {
    "typescript": "^7.0.2",
    "vite": "^8.3.5",
    "vite-plugin-solid": "^2.11.14"
  },
  "dependencies": {
    "solid-js": "^1.9.17"
  }
}
```

Remove `solid-devtools` entirely. Keep the existing `scripts`, `name`, `version`, and `description` unchanged.

- [ ] **Step 2: Regenerate the lockfile**

Run: `npx pnpm@12.15.0 install`
Expected: exit 0; `pnpm-lock.yaml` is rewritten with a pnpm 12 lockfile version (not `6.0`), and no peer-dependency failure for `vite-plugin-solid`.

- [ ] **Step 3: Verify installed versions**

Run: `npx pnpm@12.15.0 list --depth 0`
Expected: the four entries show `solid-js 1.9.17`, `vite 8.3.5`, `vite-plugin-solid 2.11.14`, `typescript 7.0.2` (patch versions may be newer only if a newer stable patch was published).

- [ ] **Step 4: Verify the dead dependency is gone**

Run: `grep -R "solid-devtools" package.json pnpm-lock.yaml`
Expected: no matches (exit code 1).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): upgrade solid-js and build toolchain"
```

---

### Task 2: Align TypeScript and Vite config with the new toolchain

**Files:**
- Modify: `package.json`
- Modify (regenerated): `pnpm-lock.yaml`
- Modify: `tsconfig.json`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: installed `typescript@7.0.2` and `vite@8.3.5` from Task 1.
- Produces: a passing `tsc --noEmit` and a `dist/` build that keeps the `/solidoku/` base.

- [ ] **Step 1: Update module resolution for TypeScript 7**

In `tsconfig.json`, change:

```json
"moduleResolution": "node",
```

to:

```json
"moduleResolution": "bundler",
```

Change `"types": ["vite/client"]` to `"types": ["vite/client", "node"]`. Leave every other compiler option unchanged.

- [ ] **Step 2: Add the Node typings Vite 8 requires**

Add `"@types/node": "^24.19.2"` to `devDependencies` in `package.json`, then run `npx pnpm@12.15.0 install` and commit the regenerated lockfile.

- [ ] **Step 3: Declare the package as ESM**

Add `"type": "module"` after `"description"` in `package.json` so the ESM Vite config loads without Vite's CommonJS compatibility warning. There are no `.js` sources, so this does not change application behavior.

- [ ] **Step 4: Remove the dead devtools configuration**

In `vite.config.ts`, delete the commented `// import devtools from 'solid-devtools/vite';` line and the commented devtools explanation/`// devtools(),` block. Keep `solidPlugin()`, `base: '/solidoku/'`, `server.port`, and `build.target` unchanged.

- [ ] **Step 5: Run the type check**

Run: `npx pnpm exec tsc --noEmit`
Expected: exit 0, no output. If TypeScript 7 reports a real type error, fix that line minimally; do not relax `strict` or add `any`.

- [ ] **Step 6: Run the production build**

Run: `npx pnpm build`
Expected: exit 0 and `dist/index.html` exists.

- [ ] **Step 7: Verify the Pages base path survived**

Run: `grep -o '/solidoku/assets/[^"]*' dist/index.html`
Expected: at least one match, e.g. `/solidoku/assets/index-<hash>.js`.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json vite.config.ts
git commit -m "chore(build): align config with vite 8 and typescript 7"
```

---

### Task 3: Raise the Node baseline and modernize the Pages workflow

**Files:**
- Modify: `.nvmrc`
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: the regenerated lockfile from Task 1.
- Produces: a CI configuration that cold-installs and builds on Node 24 with pnpm 12.

- [ ] **Step 1: Update `.nvmrc`**

Replace the entire file contents with:

```
24
```

- [ ] **Step 2: Update the workflow actions and runtime**

In `.github/workflows/deploy.yml`:

- Replace `actions/checkout@v4` with `actions/checkout@v7`.
- Replace the `Set up Node` step with:

```yaml
      - name: Set up Node
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: pnpm
```

- Replace `pnpm/action-setup@v2` with `pnpm/action-setup@v6`, keeping `version: 12` and `run_install: false`.
- Delete the `Get pnpm store directory` step and the `actions/cache` step; `setup-node`'s `cache: pnpm` replaces them.
- Replace `actions/configure-pages@v3` with `actions/configure-pages@v6`.
- Replace `actions/upload-pages-artifact@v2` with `actions/upload-pages-artifact@v5`.
- Replace `actions/deploy-pages@v2` with `actions/deploy-pages@v5`.
- Leave triggers, permissions, concurrency, environment, `pnpm install`, `pnpm run build`, and `path: './dist'` unchanged.

- [ ] **Step 3: Validate the workflow YAML**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml')); print('yaml ok')"`
Expected: `yaml ok`.

- [ ] **Step 4: Simulate the CI install from the committed lockfile**

Run: `rm -rf node_modules && npx pnpm@12.15.0 install --frozen-lockfile`
Expected: exit 0; pnpm reports the lockfile is up to date and installs without resolving new versions.

- [ ] **Step 5: Commit**

```bash
git add .nvmrc .github/workflows/deploy.yml
git commit -m "ci: build on node 24 with pnpm 12 and current actions"
```

---

### Task 4: Full verification and documentation commit

**Files:**
- Verify: `dist/`, `src/**` (must be unchanged)
- Add: `docs/superpowers/specs/2026-10-25-solidjs-upgrade-design.md`
- Add: `docs/superpowers/plans/2026-10-25-solidjs-upgrade.md`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: evidence that the upgrade type-checks, builds, serves, and leaves app code untouched.

- [ ] **Step 1: Re-run type check and build from the frozen install**

Run: `npx pnpm exec tsc --noEmit && npx pnpm build`
Expected: exit 0 and a fresh `dist/`.

- [ ] **Step 2: Run the dependency audit**

Run: `npx pnpm audit`
Expected: no high or critical vulnerabilities. If one is reported, record the package and advisory; do not ignore it silently.

- [ ] **Step 3: Smoke-test the production preview**

Run: `npx pnpm serve --port 4173` in the background, then:

```bash
curl -fsS http://localhost:4173/solidoku/ | grep -q '<div id="root">'
```

Expected: exit 0. Stop the preview server afterward.

- [ ] **Step 4: Confirm application source is untouched**

Run: `git diff --quiet -- src && echo "src unchanged"`
Expected: `src unchanged`. If this fails, inspect the diff; source edits must be limited to the minimal TypeScript 7 fix allowed by Task 2.

- [ ] **Step 5: Review the complete diff**

Run: `git diff --stat HEAD~3`
Expected: only `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vite.config.ts`, `.nvmrc`, the workflow, and the two docs files. No unrelated formatting churn.

- [ ] **Step 6: Commit the design and plan**

```bash
git add docs/superpowers
git commit -m "docs: record solidjs upgrade design and plan"
```

- [ ] **Step 7: Report**

Summarize: versions installed, files changed, typecheck/build/audit results, and the remaining manual check — open the preview and click through a new game, an existing saved game, and keyboard navigation.
