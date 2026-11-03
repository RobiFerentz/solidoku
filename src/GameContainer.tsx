import { For, createSignal } from 'solid-js';
import { NumberSquare } from './NumberSquare';
import { NumberPad } from './NumberPad';
import styles from './GameContainer.module.css';
import { gameController } from './stores/GameStore';
import { WinModal } from './WinModal';

type GameContainerProps = {
  onGameSolved: () => void;
};
export const GameContainer = (props: GameContainerProps) => {
  const [selected, setSelected] = createSignal<{ x: number; y: number } | null>(null);
  const handleGuess = (row: number, col: number) => {
    return (guess: number) => {
      gameController.setCurrentBoardValue(row, col, guess);
      if (gameController.isMistakenGuess(row, col, guess)) {
        gameController.incrementMistakes();
      }
      gameController.saveGame();
    };
  };

  const handlePadInput = (digit: number) => {
    const sel = selected();
    if (!sel) return;
    if (gameController.isFixedValue(sel.y, sel.x)) return;
    handleGuess(sel.y, sel.x)(digit);
  };

  const handlePadErase = () => {
    const sel = selected();
    if (!sel) return;
    if (gameController.isFixedValue(sel.y, sel.x)) return;
    handleGuess(sel.y, sel.x)(0);
  };

  const isPadDisabled = () => {
    const sel = selected();
    if (!sel) return true;
    return gameController.isFixedValue(sel.y, sel.x);
  };

  const onWinConfirm = () => {
    props.onGameSolved();
    gameController.deleteGame();
    setSelected(null);
  };

  const handleSelect = ({ x, y }: { x: number; y: number }) => {
    if (!gameController.currentBoard?.length) return;
    const board = gameController.currentBoard;
    if (x < 0) x = board[0].length - 1;
    if (y < 0) y = board.length - 1;
    if (x >= board[0].length) x = 0;
    if (y >= board.length) y = 0;
    setSelected({ x, y });
  };

  const isSelected = (x: number, y: number) => {
    return selected()?.x === x && selected()?.y === y;
  };

  return (
    <>
      <div class={styles.info}>
        <span>Difficulty: {gameController.difficulty}</span>
        <span>Mistakes: {gameController.mistakes}</span>
      </div>
      <div class={styles.container} role="grid" aria-label="Sudoku board">
        <For each={gameController.currentBoard}>
          {(row, rowIndex) => (
            <For each={row}>
              {(item, colIndex) => (
                <NumberSquare
                  tabIndex={rowIndex() * gameController.currentBoard.length + (colIndex() + 1)}
                  onGuess={handleGuess(rowIndex(), colIndex())}
                  value={item}
                  coords={{ x: colIndex(), y: rowIndex() }}
                  isSelected={isSelected(colIndex(), rowIndex())}
                  onSelected={handleSelect}
                  isCorrect={gameController.isCorrectGuess(rowIndex(), colIndex(), item)}
                  isMistake={gameController.isMistakenGuess(rowIndex(), colIndex(), item)}
                  isFixed={gameController.isFixedValue(rowIndex(), colIndex())}
                />
              )}
            </For>
          )}
        </For>
      </div>
      <NumberPad onInput={handlePadInput} onErase={handlePadErase} disabled={isPadDisabled()} />
      <WinModal open={gameController.isSolved} onClose={onWinConfirm} />
    </>
  );
};
