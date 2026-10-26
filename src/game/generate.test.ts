import { describe, expect, it } from 'vitest';
import { generateSudoku } from './generate';
import { countClues, countSolutions, isValidSolution } from './test-utils';
import { Difficulties, Difficulty } from './types';

const levels = Object.keys(Difficulties) as Difficulty[];

describe('generateSudoku', () => {
  it.each(levels)('generates a valid solution grid on %s', (difficulty) => {
    const game = generateSudoku(difficulty);
    expect(isValidSolution(game.solution)).toBe(true);
  });

  it.each(levels)('generates a puzzle with a unique solution on %s', (difficulty) => {
    const game = generateSudoku(difficulty);
    // Empty cells in the puzzle must match the solution's digits.
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (game.puzzle[row][col] !== 0) {
          expect(game.puzzle[row][col]).toBe(game.solution[row][col]);
        }
      }
    }
    expect(countSolutions(game.puzzle)).toBe(1);
  });

  it('removes no more than the configured maximum for each difficulty', () => {
    for (const difficulty of levels) {
      for (let i = 0; i < 10; i++) {
        const game = generateSudoku(difficulty);
        const removed = 81 - countClues(game.puzzle);
        expect(removed).toBeLessThanOrEqual(Difficulties[difficulty].max);
      }
    }
  });

  it('produces puzzles whose clue counts overlap the historical ranges', () => {
    // The generator digs uniquely-removable cells up to the target, so the
    // observed removal range should at least touch the configured maximum.
    const removed = new Set<number>();
    for (let i = 0; i < 200; i++) {
      removed.add(81 - countClues(generateSudoku('Easy').puzzle));
    }
    expect(removed.has(Difficulties.Easy.max)).toBe(true);
  });
});
