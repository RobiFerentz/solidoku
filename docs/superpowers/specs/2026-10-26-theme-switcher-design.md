# Dark theme + header theme switcher

Date: 2026-10-26
Status: Approved (user chose approach 1 and system-theme default in conversation)

## Intent and why

The app only has a light theme: a flame gradient (red → orange) on white.
Players who use dark mode want a dark variant that keeps the brand gradient
recognisable, plus a way to switch in place and have the choice remembered.
The win modal's Done button is currently a flat orange rectangle that ignores
the rest of the design language.

## Goals

- Preserve the current appearance exactly as the light theme.
- Add a dark theme using the same flame accents.
- Add a theme switcher in the header, keyboard accessible, with a label.
- Follow the OS theme when the player has never chosen one.
- Remember an explicit choice across reloads.
- Restyle the win modal Done button with the gradient button treatment used
  for difficulty selection.

## Non-goals

- No backend or account-level theme sync (state stays in localStorage).
- No additional themes or accent-colour pickers.
- No redesign of layout, typography, or the sudoku board.

## Constraints

- Solid + CSS Modules; Vite 8; vitest 5 with jsdom already installed.
- Theme must apply before first paint to avoid a light flash.
- Existing light-theme colours must not change.

## Approach chosen

CSS custom-property tokens (approach 1 from the discussion):

- Light values become `:root` tokens (`--bg`, `--surface`, `--text`,
  `--grid-line`, `--grid-line-strong`, `--selected`, `--correct`, `--mistake`,
  `--shadow`). Their values are the colours currently hard-coded in the CSS
  modules, so light rendering is unchanged.
- A `[data-theme='dark']` block overrides the tokens with a warm near-black
  palette; the flame gradient stays as the brand accent.
- `data-theme` is set on `<html>`. CSS modules replace literal colours with
  token references; no per-component theme classes.
- A small theme module resolves the initial theme (stored choice, else OS
  preference via `prefers-color-scheme`), exposes a Solid signal for the
  header, applies the attribute + `meta[name=theme-color]`, and listens for OS
  changes only while no explicit choice is stored.
- `initTheme()` runs in `index.tsx` before `render`.

Rejected: per-component `.dark` overrides (duplicated colour logic in five
files) and swapping whole stylesheets (duplication + flash risk).

## Parts decided by the builder

- Dark palette: `--bg #100e0d`, `--surface #1b1816`, `--text #f4efe9`,
  `--grid-line #3d3733`, `--grid-line-strong #9a8f86`,
  `--selected rgba(255, 173, 6, 0.22)`, `--correct #7fb3ff`,
  `--mistake #ff6b6b`, `--shadow #000`.
- Switcher is an icon-only button (sun/moon) in the header's right slot, with
  `aria-label`/`title` naming the action and a visible focus ring.
- `color-scheme` is set per theme so native controls and the modal backdrop
  follow the theme.
- Win modal Done button mirrors the difficulty buttons: flame gradient, white
  bold text, 0.6rem radius, hard shadow, hover gradient swap, dashed focus
  ring.

## What is left to the builder

- Exact token names/values may be adjusted for contrast while keeping the
  light theme pixel-equivalent.
- Test structure: pure resolver tests plus a jsdom integration test for
  persistence, OS-following, and the header toggle.

## Verification

- Unit/integration tests: stored-theme parsing, system fallback, explicit
  preference wins, persistence, OS-change behaviour, header toggle flips theme.
- `pnpm test`, `tsc --noEmit`, `pnpm build` all clean.
- Browser screenshots in light and dark, plus a check that the win modal's
  Done button uses the gradient.
