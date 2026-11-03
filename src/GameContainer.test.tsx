import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'solid-js/web';
import { GameContainer } from './GameContainer';
import { gameController } from './stores/GameStore';

describe('GameContainer with NumberPad', () => {
  beforeEach(() => {
    localStorage.clear();
    gameController.createGame('Easy');
  });

  it('renders GameContainer with Sudoku board and NumberPad', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const dispose = render(() => <GameContainer onGameSolved={() => {}} />, container);

    try {
      const grid = container.querySelector('[role="grid"]');
      expect(grid).toBeTruthy();

      const toolbar = container.querySelector('[role="toolbar"]');
      expect(toolbar).toBeTruthy();
    } finally {
      dispose();
      container.remove();
    }
  });

  it('inputs number into selected cell via NumberPad and updates board value', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const dispose = render(() => <GameContainer onGameSolved={() => {}} />, container);

    try {
      // Find an empty non-fixed cell
      let targetRow = -1;
      let targetCol = -1;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!gameController.isFixedValue(r, c)) {
            targetRow = r;
            targetCol = c;
            break;
          }
        }
        if (targetRow !== -1) break;
      }

      // Click on target square to select it
      const targetIndex = targetRow * 9 + targetCol;
      const squares = container.querySelectorAll<HTMLDivElement>('[role="gridcell"]');
      squares[targetIndex].click();

      // Click on digit 8 on NumberPad
      const padButtons = container.querySelectorAll<HTMLButtonElement>('[role="toolbar"] button');
      const btn8 = Array.from(padButtons).find((b) => b.textContent?.trim() === '8');
      expect(btn8).toBeTruthy();
      btn8?.click();

      // Verify board value updated
      expect(gameController.currentBoard[targetRow][targetCol]).toBe(8);

      // Click Erase button on NumberPad
      const eraseBtn = Array.from(padButtons).find((b) => b.getAttribute('aria-label') === 'Erase');
      expect(eraseBtn).toBeTruthy();
      eraseBtn?.click();

      // Verify cell cleared
      expect(gameController.currentBoard[targetRow][targetCol]).toBe(0);
    } finally {
      dispose();
      container.remove();
    }
  });
});
