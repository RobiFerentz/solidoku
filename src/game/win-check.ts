// Win detection for a sudoku board: the board is solved only when every cell
// is filled AND matches the puzzle's unique solution. Checking fullness alone
// is not enough, because wrong guesses stay on the board.
export function isSolvedBoard(current: number[][], solution: number[][]): boolean {
  return current.every((row, rowIndex) =>
    row.every((value, colIndex) => value !== 0 && value === solution[rowIndex][colIndex])
  );
}
