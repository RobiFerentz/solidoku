import { Difficulties, Difficulty, Game } from './types';

// Counts solutions of a partially filled board by backtracking search,
// stopping early once `limit` is reached. Independent of the candidate
// ordering of the generator's own solver.
function countSolutionsTo(board: number[][], limit = 2): number {
  const rows = new Array<number>(GRID_SIZE).fill(0);
  const cols = new Array<number>(GRID_SIZE).fill(0);
  const boxes = new Array<number>(GRID_SIZE).fill(0);
  const full = (1 << (GRID_SIZE + 1)) - 2;
  const bit = (num: number): number => 1 << (num - 1);
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = board[row][col];
      if (value) {
        const flag = bit(value);
        rows[row] |= flag;
        cols[col] |= flag;
        boxes[Math.floor(row / 3) * 3 + Math.floor(col / 3)] |= flag;
      }
    }
  }
  let count = 0;

  function solve(): void {
    if (count >= limit) return;
    // Minimum-remaining-values: branch on the emptiest cell first.
    let bestRow = -1;
    let bestCol = -1;
    let bestMask = 0;
    let bestCount = GRID_SIZE + 1;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col]) continue;
        const used = rows[row] | cols[col] | boxes[Math.floor(row / 3) * 3 + Math.floor(col / 3)];
        const mask = ~used & full;
        let n = 0;
        let rest = mask;
        while (rest) {
          rest &= rest - 1;
          n++;
        }
        if (n === 0) return;
        if (n < bestCount) {
          bestCount = n;
          bestRow = row;
          bestCol = col;
          bestMask = mask;
          if (n === 1) break;
        }
      }
      if (bestCount === 1) break;
    }
    if (bestRow === -1) {
      count++;
      return;
    }
    const boxIndex = Math.floor(bestRow / 3) * 3 + Math.floor(bestCol / 3);
    for (let num = 1; num <= GRID_SIZE; num++) {
      const flag = bit(num);
      if (!(bestMask & flag)) continue;
      board[bestRow][bestCol] = num;
      rows[bestRow] |= flag;
      cols[bestCol] |= flag;
      boxes[boxIndex] |= flag;
      solve();
      board[bestRow][bestCol] = 0;
      rows[bestRow] &= ~flag;
      cols[bestCol] &= ~flag;
      boxes[boxIndex] &= ~flag;
      if (count >= limit) return;
    }
  }

  solve();
  return count;
}
const GRID_SIZE = 9;
const br = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function getNumberToRemove(difficulty: Difficulty): number {
  const { min, max } = Difficulties[difficulty];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(input: number[]) {
  // Shuffle the array using Fisher-Yates algorithm
  const row = [...input];
  for (let i = row.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [row[i], row[j]] = [row[j], row[i]];
  }
  return row;
}
export function generateSudoku(difficulty: Difficulty): Game {
  const board: number[][] = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => 0)); // Create a 9x9 2D array filled with 0s
  board[0] = shuffle(br);

  // Solve the rest of the board using a backtracking algorithm
  if (!solveSudoku(board)) {
    throw new Error('Failed to generate a valid Sudoku board');
  }

  const solution = structuredClone(board);
  // Remove numbers to create a puzzle
  removeNumbers(board, getNumberToRemove(difficulty)); // Adjust the number of numbers removed to control difficulty

  return { solution, puzzle: board, difficulty, mistakes: 0, current: structuredClone(board) };
}

function solveSudoku(board: number[][]): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) {
        // Try digits in a random order so the completed grid is not determined
        // solely by the shuffled first row, widening solution variety.
        for (const num of shuffle(br)) {
          if (isValidPlacement(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let i = 0; i < GRID_SIZE; i++) {
    if (board[row][i] === num) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < GRID_SIZE; i++) {
    if (board[i][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) {
        return false;
      }
    }
  }

  return true;
}

function removeNumbers(board: number[][], numToRemove: number): void {
  // Peel the puzzle down one uniquely-removable layer at a time: each pass
  // over the shuffled cell order digs every cell (paired with its 180°
  // rotation where possible) that can go while keeping a unique solution.
  // Layering lets a cell rejected early become removable after other cells
  // are dug. The loop ends on a pass with zero digs, so a minimal grid
  // yields its best effort instead of stalling generation.
  const target = numToRemove;
  const order = shuffle(Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => index));
  // Keep digging full passes over the cell order until a pass removes
  // nothing or every target is reached. Digging in passes (rather than
  // pairwise retries) guarantees each pass strictly shrinks the set of
  // remaining cells or ends the loop, so generation always terminates.
  let removed = 0;
  const solverBoard = board.map((row) => [...row]);
  let dugThisPass = 1;
  while (removed < target && dugThisPass > 0) {
    dugThisPass = 0;
    const skipped = new Set<number>();
    for (const index of order) {
      if (removed >= target) break;
      if (skipped.has(index)) continue;
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      if (!board[row][col]) continue;
      const partnerRow = GRID_SIZE - 1 - row;
      const partnerCol = GRID_SIZE - 1 - col;
      const partnerIndex = partnerRow * GRID_SIZE + partnerCol;
      const backup = board[row][col];
      board[row][col] = 0;
      solverBoard[row][col] = 0;
      let partnerBackup = 0;
      const allowPair = removed + 2 <= target;
      const hasPartner =
        allowPair && partnerIndex !== index && board[partnerRow][partnerCol] !== 0 && !skipped.has(partnerIndex);
      if (hasPartner) {
        partnerBackup = board[partnerRow][partnerCol];
        board[partnerRow][partnerCol] = 0;
        solverBoard[partnerRow][partnerCol] = 0;
      }
      if (countSolutionsTo(solverBoard) === 1) {
        const dug = hasPartner ? 2 : 1;
        removed += dug;
        dugThisPass += dug;
        continue;
      }
      board[row][col] = backup;
      solverBoard[row][col] = backup;
      if (hasPartner) {
        board[partnerRow][partnerCol] = partnerBackup;
        solverBoard[partnerRow][partnerCol] = partnerBackup;
      }
      // A rejected cell still needs its digit; its partner stays eligible
      // alongside a different cell later in this pass.
      skipped.add(index);
    }
  }
}
