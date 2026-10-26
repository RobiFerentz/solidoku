// Shared helpers for the sudoku test suite: solution validation and an
// independent solution counter (MRV bitmask solver, distinct from the
// backtracking implementation in src/game/generate.ts).
export type Grid = number[][];

const FULL = 0b111111111;
const digitBit = (n: number): number => 1 << (n - 1);

/** True when every row, column, and 3x3 box contains digits 1-9 exactly once. */
export function isValidSolution(grid: Grid): boolean {
  for (let i = 0; i < 9; i++) {
    let row = 0;
    let col = 0;
    let box = 0;
    for (let j = 0; j < 9; j++) {
      row |= digitBit(grid[i][j]);
      col |= digitBit(grid[j][i]);
      box |= digitBit(grid[Math.floor(i / 3) * 3 + Math.floor(j / 3)][(i % 3) * 3 + (j % 3)]);
    }
    if (row !== FULL || col !== FULL || box !== FULL) return false;
  }
  return true;
}

/** Counts solutions of a puzzle grid, stopping early once `limit` is reached. */
export function countSolutions(puzzle: Grid, limit = 2): number {
  const grid = puzzle.map((row) => [...row]);
  const rows = new Array<number>(9).fill(0);
  const cols = new Array<number>(9).fill(0);
  const boxes = new Array<number>(9).fill(0);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v) {
        const b = digitBit(v);
        rows[r] |= b;
        cols[c] |= b;
        boxes[Math.floor(r / 3) * 3 + Math.floor(c / 3)] |= b;
      }
    }
  }
  let count = 0;

  function solve(): void {
    if (count >= limit) return;
    // Minimum-remaining-values: pick the empty cell with fewest candidates.
    let bestR = -1;
    let bestC = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c]) continue;
        const used = rows[r] | cols[c] | boxes[Math.floor(r / 3) * 3 + Math.floor(c / 3)];
        const mask = ~used & FULL;
        let n = 0;
        let m = mask;
        while (m) {
          m &= m - 1;
          n++;
        }
        if (n === 0) return;
        if (n < bestCount) {
          bestCount = n;
          bestR = r;
          bestC = c;
          bestMask = mask;
          if (n === 1) break;
        }
      }
      if (bestCount === 1) break;
    }
    if (bestR === -1) {
      count++;
      return;
    }
    const boxIndex = Math.floor(bestR / 3) * 3 + Math.floor(bestC / 3);
    for (let v = 1; v <= 9; v++) {
      const b = digitBit(v);
      if (!(bestMask & b)) continue;
      grid[bestR][bestC] = v;
      rows[bestR] |= b;
      cols[bestC] |= b;
      boxes[boxIndex] |= b;
      solve();
      grid[bestR][bestC] = 0;
      rows[bestR] &= ~b;
      cols[bestC] &= ~b;
      boxes[boxIndex] &= ~b;
      if (count >= limit) return;
    }
  }

  solve();
  return count;
}

export function countClues(puzzle: Grid): number {
  return puzzle.flat().filter(Boolean).length;
}
