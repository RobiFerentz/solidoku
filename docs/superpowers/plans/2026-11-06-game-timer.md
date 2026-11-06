# Game Timer Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Goal:** Add a persisted MM:SS game timer that auto-pauses/resumes and freezes on solve.
> **Architecture:** Elapsed seconds live in `GameController` as a signal alongside `mistakes`; included in the existing base64 `localStorage` blob; `GameContainer` owns the 1s interval and pause/resume listeners.
> **Tech Stack:** SolidJS 1.9 signals/store, TypeScript, vitest + jsdom, vite-plugin-solid.
> **Spec:** `docs/superpowers/specs/2026-11-06-game-timer-design.md`

## Global Constraints
- Single `localStorage` key `'game'`, base64-encoded JSON — no second key.
- `MM:SS` display with zero-padding; past one hour rolls into minutes (e.g. `75:00`).
- Old saves without `elapsed` must still load, defaulting to `0`.
- Timer ticks only while a game is mounted and unsolved; frozen after solve.
- Follow existing patterns: signals in `GameStore.ts`, validation in `loadGame()`.
- Run `pnpm test` (vitest run) to verify; jsdom environment, single shared worker.

## Review Focus
- Old save blob without `elapsed` field loads and timer starts at `00:00`.
- `elapsed` present but wrong type (string/null) is rejected-or-defaulted, never crashes or shows `NaN:NaN`.
- Timer does not keep ticking after `isSolved` becomes true or after exit to menu (unmount).
- Rapid blur/focus or hide/show cycles never stack two intervals (no 2x speed).
- Very large elapsed (e.g. 4500s) formats as `75:00` without crashing or switching to `HH:`.

---
### Task 1: formatTime helper
**Files:**
- Create: `src/game/format-time.ts`
- Test: `src/game/format-time.test.ts`
**Interfaces:**
- Consumes: nothing.
- Produces: `formatTime(totalSeconds: number): string` — used by Task 4 (`GameContainer`) and Task 5 (`WinModal`).

- [ ] **Step 1: Write failing test `src/game/format-time.test.ts`**
```ts
import { describe, expect, it } from 'vitest';
import { formatTime } from './format-time';
describe('formatTime', () => {
  it('formats 0 as 00:00', () => { expect(formatTime(0)).toBe('00:00'); });
  it('formats 65 as 01:05', () => { expect(formatTime(65)).toBe('01:05'); });
  it('pads single digits', () => { expect(formatTime(61)).toBe('01:01'); });
  it('rolls hours into minutes', () => { expect(formatTime(4500)).toBe('75:00'); });
});
```
- [ ] **Step 2: Run test verify fails** Run: `pnpm vitest run src/game/format-time.test.ts` Expected: FAIL with "Cannot find module './format-time'".
- [ ] **Step 3: Implement `formatTime(totalSeconds: number): string` in `src/game/format-time.ts`** Approach: `Math.floor(totalSeconds / 60)` minutes, `totalSeconds % 60` seconds, both `String(...).padStart(2, '0')`.
- [ ] **Step 4: Run test verify passes** Run: `pnpm vitest run src/game/format-time.test.ts` Expected: PASS (4 tests).
- [ ] **Step 5: Commit** Run: `git add src/game/format-time.ts src/game/format-time.test.ts && git commit -m "feat: add formatTime MM:SS helper"`

---
### Task 2: Game type + generation carry elapsed
**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/generate.ts` (line ~108 return statement)
**Interfaces:**
- Consumes: nothing new.
- Produces: `Game` type gains `elapsed: number` (seconds); `generateSudoku()` returns `elapsed: 0`. Used by Task 3 `storeGame()`.

- [ ] **Step 1: Add `elapsed: number` to `Game` type in `src/game/types.ts`** Exact field: `elapsed: number;` with comment `// seconds elapsed`.
- [ ] **Step 2: Return `elapsed: 0` from `generateSudoku` in `src/game/generate.ts`** Change return to `{ solution, puzzle: board, difficulty, mistakes: 0, current: structuredClone(board), elapsed: 0 }`.
- [ ] **Step 3: Typecheck** Run: `pnpm exec tsc --noEmit` Expected: FAIL listing `GameStore.ts` `storeGame`/`deleteGame` missing `elapsed` (proves wiring needed, no test file for this task).
- [ ] **Step 4: Commit** Run: `git add src/game/types.ts src/game/generate.ts && git commit -m "feat: add elapsed to Game type and generation"`

---
### Task 3: GameStore elapsed state + persistence
**Files:**
- Modify: `src/stores/GameStore.ts`
- Test: `src/stores/GameStore.test.ts` (append new `it` blocks)
**Interfaces:**
- Consumes: `Game.elapsed` from Task 2.
- Produces: `gameController.elapsedSeconds: number` (getter), `gameController.tickSecond(): void`. Used by Task 4 interval/display.

- [ ] **Step 1: Write failing tests in `src/stores/GameStore.test.ts`** Append:
```ts
it('starts new game with elapsed 0', () => {
  gameController.createGame('Easy');
  expect(gameController.elapsedSeconds).toBe(0);
});
it('tickSecond increments and save/load round-trips elapsed', () => {
  gameController.createGame('Easy');
  gameController.tickSecond();
  gameController.tickSecond();
  gameController.saveGame();
  gameController.tickSecond();
  expect(gameController.loadGame()).toBe(true);
  expect(gameController.elapsedSeconds).toBe(2);
});
it('old save without elapsed loads defaulting to 0', () => {
  gameController.createGame('Easy');
  const raw = JSON.parse(atob(localStorage.getItem('game')!));
  delete raw.elapsed;
  localStorage.setItem('game', btoa(JSON.stringify(raw)));
  expect(gameController.loadGame()).toBe(true);
  expect(gameController.elapsedSeconds).toBe(0);
});
```
- [ ] **Step 2: Run tests verify fail** Run: `pnpm vitest run src/stores/GameStore.test.ts` Expected: FAIL with `gameController.tickSecond is not a function` / `elapsedSeconds` undefined.
- [ ] **Step 3: Implement in `src/stores/GameStore.ts`** Add `const [elapsed, setElapsed] = createSignal<number>(0);` next to `mistakes`; in `storeGame()` add `setElapsed(game.elapsed ?? 0);`; in `saveGame()` blob add `elapsed: elapsed()`; in `loadGame()` validation accept missing/invalid elapsed and default `0` (keep returning true for old saves; only reject when solution/puzzle/current/difficulty/mistakes invalid per existing logic); in `deleteGame()` reset via `elapsed: 0` in the cleared object; add `get elapsedSeconds(): number { return elapsed(); }` and `tickSecond(): void { setElapsed(this.elapsedSeconds + 1); }`; add `tickSecond` persistence is caller-driven (Task 4 calls `saveGame()` after tick).
- [ ] **Step 4: Run tests verify pass** Run: `pnpm vitest run src/stores/GameStore.test.ts` Expected: PASS (all existing + 3 new).
- [ ] **Step 5: Commit** Run: `git add src/stores/GameStore.ts src/stores/GameStore.test.ts && git commit -m "feat: persist elapsed seconds in GameStore"`

---
### Task 4: GameContainer timer display + ticking + pause/resume
**Files:**
- Modify: `src/GameContainer.tsx`
- Test: extend `src/GameContainer.test.tsx`
**Interfaces:**
- Consumes: `gameController.elapsedSeconds`, `gameController.tickSecond()`, `gameController.saveGame()`, `formatTime` (Task 1).
- Produces: frozen `elapsedSeconds` value passed to `WinModal` as `elapsedSeconds` prop (Task 5 consumes).

- [ ] **Step 1: Write failing test in `src/GameContainer.test.tsx`** Append:
```tsx
it('displays timer MM:SS and advances each second while unsolved', async () => {
  vi.useFakeTimers();
  try {
    const container = document.createElement('div');
    document.body.append(container);
    const dispose = render(() => <GameContainer onGameSolved={() => {}} />, container);
    try {
      const info = container.querySelector('[class*="info"]')!.textContent;
      expect(info).toMatch(/00:00/);
      const before = gameController.elapsedSeconds;
      await vi.advanceTimersByTimeAsync(3000);
      expect(gameController.elapsedSeconds).toBe(before + 3);
      expect(container.querySelector('[class*="info"]')!.textContent).toMatch(/00:0/);
    } finally { dispose(); container.remove(); }
  } finally { vi.useRealTimers(); }
});
```
  (Needs `import { vi } from 'vitest'` added to test file imports.)
- [ ] **Step 2: Run test verify fails** Run: `pnpm vitest run src/GameContainer.test.tsx` Expected: FAIL — timer text `00:00` absent / elapsed never advances.
- [ ] **Step 3: Implement in `src/GameContainer.tsx`** Add imports `onMount, onCleanup, createEffect` from `solid-js` and `formatTime` from `./game/format-time`; middle span `<span>Time: {formatTime(gameController.elapsedSeconds)}</span>` between Difficulty and Mistakes spans in `.info` div; interval management: `let timer: ReturnType<typeof setInterval> | undefined;` + `start()` (clear existing, `timer = setInterval(() => { if (gameController.isSolved) { stop(); return; } gameController.tickSecond(); gameController.saveGame(); }, 1000)`) + `stop()` (clearInterval, `timer = undefined`); `onMount(() => { if (!gameController.isSolved) start(); document.addEventListener('visibilitychange', onVis); window.addEventListener('focus', onFocus); window.addEventListener('blur', onBlur); })` where `onVis = () => document.hidden ? (stop(), gameController.saveGame()) : (!gameController.isSolved && start())`, `onBlur = () => { stop(); gameController.saveGame(); }`, `onFocus = () => { if (!gameController.isSolved) start(); }`; `createEffect(() => { if (gameController.isSolved) stop(); })`; `onCleanup(() => { stop(); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', onFocus); window.removeEventListener('blur', onBlur); gameController.saveGame(); })`; pass `elapsedSeconds={gameController.elapsedSeconds}` to `<WinModal>`.
- [ ] **Step 4: Run tests verify pass** Run: `pnpm vitest run src/GameContainer.test.tsx src/stores/GameStore.test.ts` Expected: PASS.
- [ ] **Step 5: Commit** Run: `git add src/GameContainer.tsx src/GameContainer.test.tsx && git commit -m "feat: ticking pausable game timer in info row"`

---
### Task 5: WinModal shows frozen final time
**Files:**
- Modify: `src/WinModal.tsx`
- Test: create `src/WinModal.test.tsx`
**Interfaces:**
- Consumes: `elapsedSeconds: number` prop from Task 4, `formatTime` from Task 1. Produces: nothing downstream.

- [ ] **Step 1: Write failing test `src/WinModal.test.tsx`**
```tsx
import { describe, expect, it } from 'vitest';
import { render } from 'solid-js/web';
import { WinModal } from './WinModal';
describe('WinModal', () => {
  it('shows final time MM:SS', () => {
    HTMLDialogElement.prototype.showModal ??= function () {};
    HTMLDialogElement.prototype.close ??= function () {};
    const container = document.createElement('div');
    document.body.append(container);
    const dispose = render(() => <WinModal open={true} onClose={() => {}} elapsedSeconds={65} />, container);
    try {
      expect(container.textContent).toMatch(/01:05/);
    } finally { dispose(); container.remove(); }
  });
});
```
- [ ] **Step 2: Run test verify fails** Run: `pnpm vitest run src/WinModal.test.tsx` Expected: FAIL — TypeScript prop `elapsedSeconds` missing / `01:05` absent.
- [ ] **Step 3: Implement in `src/WinModal.tsx`** Add `elapsedSeconds: number` to `WinModalProps`; import `formatTime` from `./game/format-time`; render `<div>Your time: {formatTime(props.elapsedSeconds)}</div>` under "You did it!!!".
- [ ] **Step 4: Run full suite verify passes** Run: `pnpm test` Expected: PASS (all files).
- [ ] **Step 5: Commit** Run: `git add src/WinModal.tsx src/WinModal.test.tsx && git commit -m "feat: show frozen final time in win modal"`
