import { createEffect } from 'solid-js';
import styles from './NumberSquare.module.css';

type Coords = {
  x: number;
  y: number;
};
type NumberSquareProps = {
  value: number;
  rightBorderDark?: boolean;
  bottomBorderDark?: boolean;
  onGuess: (guess: number) => void;
  tabIndex: number;
  coords: Coords;
  isSelected: boolean;
  isCorrect: boolean;
  isMistake: boolean;
  isFixed: boolean;
  onSelected: (coords: Coords) => void;
};

export const NumberSquare = (props: NumberSquareProps) => {
  let root: HTMLDivElement | undefined;
  const handleInput = (e: KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.key.startsWith('Arrow')) {
      switch (e.key) {
        case 'ArrowUp':
          props.onSelected({ x: props.coords.x, y: props.coords.y - 1 });
          break;
        case 'ArrowDown':
          props.onSelected({ x: props.coords.x, y: props.coords.y + 1 });
          break;
        case 'ArrowLeft':
          props.onSelected({ x: props.coords.x - 1, y: props.coords.y });
          break;
        case 'ArrowRight':
          props.onSelected({ x: props.coords.x + 1, y: props.coords.y });
          break;
      }
      return;
    }

    if (props.isFixed) return;

    const allowInputs = /([1-9]{1,1})/gi;

    if (!allowInputs.test(e.key)) {
      props.onGuess(0);
      return;
    }
    const guess = parseInt(e.key, 10);
    if (guess === props.value) return;
    props.onGuess(guess);
  };

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    props.onSelected(props.coords);
  };

  createEffect(() => {
    if (props.isSelected) {
      root?.focus();
    }
  });

  return (
    <div
      ref={root}
      tabIndex={props.tabIndex}
      class={styles.square}
      classList={{
        // [styles.rightBorderDark]: props.rightBorderDark,
        // [styles.bottomBorderDark]: props.bottomBorderDark,
        [styles.selected]: props.isSelected,
        [styles.mistake]: props.isMistake && !props.isFixed,
        [styles.correct]: props.isCorrect && !props.isFixed,
        [styles.weird]: props.coords.x % 3 === 0 && props.coords.y % 3 === 0,
      }}
      onKeyDown={handleInput}
      onClick={handleClick}
    >
      <div>{props.value || ''}</div>
    </div>
  );
};
