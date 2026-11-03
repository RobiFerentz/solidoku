import { createEffect } from 'solid-js';
import styles from './NumberSquare.module.css';

type Coords = {
  x: number;
  y: number;
};
type NumberSquareProps = {
  value: number;
  onGuess: (guess: number) => void;
  tabIndex: number;
  coords: Coords;
  isSelected: boolean;
  isCorrect: boolean;
  isMistake: boolean;
  isFixed: boolean;
  onSelected: (coords: Coords) => void;
};

const CLEAR_KEYS = new Set(['Backspace', 'Delete', '0', ' ']);
const DIGIT_KEYS = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9']);

export const NumberSquare = (props: NumberSquareProps) => {
  let root: HTMLDivElement | undefined;
  const handleInput = (e: KeyboardEvent) => {
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
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

    if (CLEAR_KEYS.has(e.key)) {
      e.preventDefault();
      props.onGuess(0);
      return;
    }

    if (DIGIT_KEYS.has(e.key)) {
      e.preventDefault();
      const guess = parseInt(e.key, 10);
      if (guess === props.value) return;
      props.onGuess(guess);
      return;
    }
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
      role="gridcell"
      aria-rowindex={props.coords.y + 1}
      aria-colindex={props.coords.x + 1}
      aria-label={`Row ${props.coords.y + 1}, Column ${props.coords.x + 1}, ${props.value ? `value ${props.value}` : 'empty'}`}
      tabIndex={props.tabIndex}
      class={styles.square}
      classList={{
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
