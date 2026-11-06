import { beforeEach, describe, expect, it } from 'vitest';
import { gameController } from './GameStore';

describe('GameStore', () => {
  beforeEach(() => {
    localStorage.clear();
    gameController.deleteGame();
  });

  it('creates and saves a new game', () => {
    gameController.createGame('Easy');
    expect(gameController.difficulty).toBe('Easy');
    expect(gameController.currentBoard).toHaveLength(9);
    expect(gameController.solutionBoard).toHaveLength(9);
    expect(gameController.puzzleBoard).toHaveLength(9);
    expect(gameController.mistakes).toBe(0);
    expect(localStorage.getItem('game')).toBeTruthy();
  });

  it('loads a previously saved game', () => {
    gameController.createGame('Medium');
    const solution = gameController.solutionBoard;
    const loaded = gameController.loadGame();
    expect(loaded).toBe(true);
    expect(gameController.difficulty).toBe('Medium');
    expect(gameController.solutionBoard).toEqual(solution);
  });

  it('handles invalid base64 in localStorage gracefully without throwing', () => {
    localStorage.setItem('game', 'not-valid-base64-%%%');
    expect(() => {
      const result = gameController.loadGame();
      expect(result).toBe(false);
    }).not.toThrow();
    expect(localStorage.getItem('game')).toBeNull();
  });

  it('handles invalid JSON in localStorage gracefully without throwing', () => {
    localStorage.setItem('game', btoa('not-json'));
    expect(() => {
      const result = gameController.loadGame();
      expect(result).toBe(false);
    }).not.toThrow();
    expect(localStorage.getItem('game')).toBeNull();
  });

  it('handles malformed game object structure gracefully', () => {
    localStorage.setItem('game', btoa(JSON.stringify({ foo: 'bar' })));
    const result = gameController.loadGame();
    expect(result).toBe(false);
    expect(localStorage.getItem('game')).toBeNull();
  });

  it('tracks mistakes and checks guesses accurately', () => {
    gameController.createGame('Easy');
    expect(gameController.mistakes).toBe(0);
    gameController.incrementMistakes();
    expect(gameController.mistakes).toBe(1);

    const solutionVal = gameController.solutionBoard[0][0];
    const wrongVal = solutionVal === 9 ? 1 : solutionVal + 1;

    expect(gameController.isCorrectGuess(0, 0, solutionVal)).toBe(true);
    expect(gameController.isCorrectGuess(0, 0, wrongVal)).toBe(false);
    expect(gameController.isCorrectGuess(0, 0, 0)).toBe(false);

    expect(gameController.isMistakenGuess(0, 0, solutionVal)).toBe(false);
    expect(gameController.isMistakenGuess(0, 0, wrongVal)).toBe(true);
    expect(gameController.isMistakenGuess(0, 0, 0)).toBe(false);
  });

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

  it.each([['65'], [null], [NaN], [-5]])('wrong-type elapsed %p loads defaulting to 0', (bad) => {
    gameController.createGame('Easy');
    const raw = JSON.parse(atob(localStorage.getItem('game')!));
    raw.elapsed = bad;
    localStorage.setItem('game', btoa(JSON.stringify(raw)));
    expect(gameController.loadGame()).toBe(true);
    expect(gameController.elapsedSeconds).toBe(0);
    gameController.tickSecond();
    expect(gameController.elapsedSeconds).toBe(1);
  });

  it('fractional elapsed floors to whole seconds', () => {
    gameController.createGame('Easy');
    const raw = JSON.parse(atob(localStorage.getItem('game')!));
    raw.elapsed = 1.9;
    localStorage.setItem('game', btoa(JSON.stringify(raw)));
    expect(gameController.loadGame()).toBe(true);
    expect(gameController.elapsedSeconds).toBe(1);
  });
});
