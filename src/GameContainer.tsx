import { For, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { NumberSquare } from './NumberSquare';
import { NumberPad } from './NumberPad';
import styles from './GameContainer.module.css';
import { gameController } from './stores/GameStore';
import { WinModal } from './WinModal';
import { formatTime } from './game/format-time';

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

  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
  const start = () => {
    stop();
    timer = setInterval(() => {
      if (gameController.isSolved) {
        stop();
        return;
      }
      gameController.tickSecond();
      gameController.saveGame();
    }, 1000);
  };
  const onVisibilityChange = () => {
    if (document.hidden) {
      stop();
      gameController.saveGame();
    } else if (!gameController.isSolved) {
      start();
    }
  };
  const onBlur = () => {
    stop();
    gameController.saveGame();
  };
  const onFocus = () => {
    if (!gameController.isSolved) start();
  };

  onMount(() => {
    if (!gameController.isSolved) start();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
  });

  createEffect(() => {
    if (gameController.isSolved) stop();
  });

  onCleanup(() => {
    stop();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('blur', onBlur);
    gameController.saveGame();
  });

  return (
    <>
      <div class={styles.info}>
        <span>Difficulty: {gameController.difficulty}</span>
        <span>Time: {formatTime(gameController.elapsedSeconds)}</span>
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
      <WinModal open={gameController.isSolved} onClose={onWinConfirm} elapsedSeconds={gameController.elapsedSeconds} />
    </>
  );
};
