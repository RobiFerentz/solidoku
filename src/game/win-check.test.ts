import { describe, expect, it } from 'vitest';
import { isSolvedBoard } from './win-check';

const solved = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

describe('isSolvedBoard', () => {
  it('returns true when every cell matches the solution', () => {
    expect(
      isSolvedBoard(
        solved.map((row) => [...row]),
        solved
      )
    ).toBe(true);
  });

  it('returns false when the board has empty cells', () => {
    const current = solved.map((row) => [...row]);
    current[0][0] = 0;
    expect(isSolvedBoard(current, solved)).toBe(false);
  });

  it('returns false when the board is full but contains a wrong value', () => {
    const current = solved.map((row) => [...row]);
    current[0][0] = 1;
    expect(isSolvedBoard(current, solved)).toBe(false);
  });
});
