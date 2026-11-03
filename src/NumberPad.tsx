import { For } from 'solid-js';
import styles from './NumberPad.module.css';

type NumberPadProps = {
  onInput: (digit: number) => void;
  onErase: () => void;
  disabled?: boolean;
};

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const NumberPad = (props: NumberPadProps) => {
  return (
    <div class={styles.container} role="toolbar" aria-label="Sudoku input pad">
      <div class={styles.grid}>
        <For each={DIGITS}>
          {(digit) => (
            <button
              type="button"
              class={styles.button}
              disabled={props.disabled}
              onClick={() => props.onInput(digit)}
              aria-label={`Enter ${digit}`}
            >
              {digit}
            </button>
          )}
        </For>
      </div>
      <div class={styles.actionRow}>
        <button
          type="button"
          class={`${styles.button} ${styles.erase}`}
          disabled={props.disabled}
          onClick={props.onErase}
          aria-label="Erase"
          title="Erase cell"
        >
          ⌫
        </button>
      </div>
    </div>
  );
};
