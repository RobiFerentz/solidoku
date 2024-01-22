const br = [1, 2, 3, 4, 5, 6, 7, 8, 9]
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
function getNumberToRemove(difficulty: Difficulty): number {
  let min = 34,
    max = 41
  switch (difficulty) {
    case 'Hard':
      min = 58
      max = 64
      break
    case 'Medium':
      min = 42
      max = 57
      break
    case 'Easy':
    default:
      break
  }
  return Math.floor(Math.random() * (max - min)) + min  
}

export type Game = {
  solution: number[][]
  puzzle: number[][]
  current: number[][]
  mistakes: number
  difficulty: Difficulty
}
function shuffle(input: number[]) {
  // Shuffle the array using Fisher-Yates algorithm
  const row = [...input]
  for (let i = row.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[row[i], row[j]] = [row[j], row[i]]
  }
  return row
}
export function generateSudoku(difficulty: Difficulty): Game {
  const board: number[][] = new Array(9).fill(0).map(() => new Array(9).fill(0))
  board[0] = shuffle(br)

  // Solve the rest of the board using a backtracking algorithm
  if (!solveSudoku(board)) {
    throw new Error('Failed to generate a valid Sudoku board')
  }

  const solution = structuredClone(board)
  // Remove numbers to create a puzzle
  removeNumbers(board, getNumberToRemove(difficulty)) // Adjust the number of numbers removed to control difficulty

  return { solution, puzzle: board, difficulty, mistakes: 0, current: structuredClone(board) }
}

function solveSudoku(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(board, row, col, num)) {
            board[row][col] = num
            if (solveSudoku(board)) {
              return true
            }
            board[row][col] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

function isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) {
      return false
    }
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) {
      return false
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) {
        return false
      }
    }
  }

  return true
}

function removeNumbers(board: number[][], numToRemove: number): void {
  let removed = 0
  while (removed < numToRemove) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)
    if (board[row][col] !== 0) {
      board[row][col] = 0
      removed++
    }
  }
}

