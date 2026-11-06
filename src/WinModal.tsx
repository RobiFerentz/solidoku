import { createEffect } from 'solid-js';
import styles from './WinModal.module.css';
import { formatTime } from './game/format-time';
type WinModalProps = {
  open: boolean;
  onClose: () => void;
  elapsedSeconds: number;
};
export const WinModal = (props: WinModalProps) => {
  let ref: HTMLDialogElement | undefined;
  createEffect(() => {
    if (!ref) return;
    if (props.open) {
      if (typeof ref.showModal === 'function') {
        ref.showModal();
      }
    } else {
      if (typeof ref.close === 'function') {
        ref.close();
      }
    }
  });
  return (
    <dialog class={styles.container} ref={ref}>
      <div>You did it!!!</div>
      <div>Your time: {formatTime(props.elapsedSeconds)}</div>
      <div>
        <button onClick={props.onClose}>Done</button>
      </div>
    </dialog>
  );
};
