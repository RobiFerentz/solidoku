# Game Timer — Design Doc (2026-11-06)

## Intent / Why

Add a game timer to Solidoku so players can see how long a puzzle is taking
them, pause automatically when they're not playing, and see their final time
when they solve the puzzle.

Requested behavior:
- Starts on new game
- Pauses: tab switches / tab loses focus, browser or window closes,
  player exits to menu
- Resumes: tab gains focus, browser reopens with saved game, player resumes game
- Persists in `localStorage` with the saved game
- Shows as `MM:SS` in the center of the info row in `src/GameContainer.tsx`,
  between Difficulty and Mistakes
- Freezes on solve; final time appears in the win modal

## Goals

- Timer visible during play as `MM:SS` between Difficulty and Mistakes.
- Elapsed time survives reload/close via the existing saved-game blob.
- Pause on blur/hide/unmount, resume on focus/show/mount (Approach A).
- Win modal shows frozen final time.
- New game resets to `00:00`.
- Existing save validation keeps working; missing `elapsed` in old saves
  defaults to `0` (backward compatible).

## Non-goals

- Sub-second precision, milliseconds display.
- Pause/resume button (automatic only).
- Best-times / leaderboard / per-difficulty stats.
- Countdown or time limits.

## Anti-goals

- A second `localStorage` key that can desync from the saved game.
- Timer keeps running after solve or on the menu screen.

## Constraints

- Existing stack: SolidJS + `GameStore` singleton (`GameController`),
  single base64 `localStorage` key `'game'`.
- Must follow existing patterns: signals in store, save/load via
  `saveGame()` / `loadGame()` / `deleteGame()`, validation in `loadGame()`.
- Tests run under vitest + jsdom (timer fakes should use `vi.useFakeTimers`
  where feasible).

## Approaches

### A: Store-owned counter + interval in GameContainer (CHOSEN)

Add `elapsedSeconds` signal to `GameStore` alongside `difficulty`/`mistakes`;
add `elapsed` field to `Game` type in `src/game/types.ts`; include it in the
existing base64 `localStorage` blob. `GameContainer` runs a 1s `setInterval`,
pauses on `visibilitychange`/`blur`/unmount (exit to menu auto-pauses via
unmount), resumes on `focus`/mount. On `isSolved`, stop ticking and pass the
frozen value to `WinModal`.

Tradeoffs: matches how the project already works; one save blob so no
desync; easy to test. ~1s drift over long games — irrelevant for `MM:SS`.

### B: Wall-clock timestamps (rejected)

Store `accumulatedMs + lastResumeAt`, derive elapsed as
`accumulated + (now - lastResumeAt)` while running. Exact even if the
browser throttles timers or the laptop sleeps, survives close precisely.
Rejected: more code to serialize, clock-skew edge cases, harder tests with
mocked time — overkill for a minute/second display.

### C: Isolated timer component with its own storage key (rejected)

New `GameTimer.tsx` owns its state in a separate `solidoku-timer` key, never
touches `GameStore`. Smallest touch to existing files. Rejected: two blobs
can desync (game deleted, timer left behind; resume loads one but not the
other), and the win modal needs the time drilled through — works against
the single-blob pattern already in place.

## Design (Approach A)

### State (`src/stores/GameStore.ts`)

- New signal: `const [elapsed, setElapsed] = createSignal<number>(0);`
- `GameController` additions:
  - `get elapsedSeconds(): number`
  - `tickSecond(): void` — increments by 1 (called by interval)
  - `resetElapsed()` or set via `storeGame` — new game sets `0`
- `storeGame()` copies `game.elapsed`.
- `createGame()` starts from `elapsed: 0` (via `generateSudoku` or override).
- `saveGame()` includes `elapsed: elapsed()` in the blob.
- `loadGame()` validates `parsed.elapsed` is a number; missing/invalid in
  old saves defaults to `0` (backward compatible, keep save loadable).
- `deleteGame()` resets to `0`.

### Type (`src/game/types.ts`)

- `Game` gains `elapsed: number;` (seconds).

### Generation (`src/game/generate.ts`)

- `generateSudoku()` returns `elapsed: 0` in the created `Game`.

### Display + ticking (`src/GameContainer.tsx`)

- Middle `<span>Time: {formatTime(gameController.elapsedSeconds)}</span>`
  in the `.info` div, between Difficulty and Mistakes.
- `formatTime(s)` → `MM:SS` with `String(...).padStart(2, '0')`
  (hours roll into minutes, e.g. `75:00` — acceptable for v1; no `HH:`).
- Interval lifecycle with `onMount`/`onCleanup`:
  - `onMount`: if not solved, start 1s interval calling `tickSecond()` +
    `saveGame()` (persist each tick, or throttle saves — see open question).
  - `createEffect` on `gameController.isSolved`: clear interval when solved
    (freeze), capture final value for modal.
  - `document.addEventListener('visibilitychange')`: clear on hidden,
    restart on visible (if not solved).
  - `window.addEventListener('blur'/'focus')`: same pause/resume.
  - `onCleanup`: clear interval + remove listeners + final `saveGame()`
    (covers exit-to-menu unmount and window close ordering where possible;
    note: `beforeunload` save is best-effort).
- Resume on mount covers reopen/resume-from-menu since `loadGame()` restores
  `elapsed` before `GameContainer` mounts.

### Win modal (`src/WinModal.tsx`)

- New prop: `elapsedSeconds: number` (frozen value passed from container).
- Render `Your time: MM:SS` alongside "You did it!!!".
- Share the same `formatTime` helper — put it in a small module
  (e.g. `src/game/format-time.ts`) so container and modal don't duplicate it.

### Persistence notes

- Tick saves: writing base64 blob every second is small (~tens of KB for a
  board) and matches existing "save on every guess" chattiness. Simpler and
  crash-safe. Alternative: save every N ticks + on pause/unmount. Builder
  default: save every tick unless profiling shows a problem.
- Old saves without `elapsed`: default `0`, keep loadable (validation
  `typeof parsed.elapsed === 'number' ? parsed.elapsed : 0` or require +
  default — builder picks, must not break `GameStore.test.ts` existing cases).

### Tests

- `GameStore.test.ts`: elapsed starts `0` on create, `tickSecond`
  increments, save/load round-trips elapsed, old blob without `elapsed`
  loads with `0`.
- New `format-time.test.ts`: `0 → 00:00`, `65 → 01:05`, padding.
- `GameContainer.test.tsx` (or new): timer span renders `MM:SS`,
  stops advancing after solve (fake timers).
- `WinModal` test (if a test file exists pattern — check): shows final time.

## Open questions for builder (defaults in parentheses)

1. Save every tick vs throttled saves? (Every tick — simplest, matches
   existing chattiness.)
2. `MM:SS` past one hour: `75:00` vs `1:15:00`? (`75:00`, keep `MM:SS`.)

## Approval

Partner approved Approach A. Awaiting approval of this doc before plan.
