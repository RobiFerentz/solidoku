import { Difficulties, Difficulty, Game } from './types';
const GRID_SIZE = 9;
const br = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function getNumberToRemove(difficulty: Difficulty): number {
  const { min, max } = Difficulties[difficulty];
  return Math.floor(Math.random() * (max - min)) + min;
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
        for (let num = 1; num <= GRID_SIZE; num++) {
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

function removeOneFromEachRow(board: number[][]): number {
  const numbersToRemove = shuffle(br);  
  let row = 0;
  for (row = 0; row < GRID_SIZE; row++) {
    const col = board[row].findIndex((num) => num === numbersToRemove[row]);
    board[row][col] = 0;
  }
  return row;
}

function removeOneFromEachColumn(board: number[][]): number {
  let col = 0;
  for (col = 0; col < GRID_SIZE; col++) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    if (board[row][col]) {
      board[row][col] = 0;
    } else {
      col--;
    }
  }
  return col;
}

function removeNumbers(board: number[][], numToRemove: number): void {
  let removed = removeOneFromEachRow(board) + removeOneFromEachColumn(board);
  while (removed < numToRemove) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
      removed++;
    }
  }
}
