import { createEffect } from 'solid-js';
import styles from './WinModal.module.css';
type WinModalProps = {
  open: boolean;
  onClose: () => void;
};
export const WinModal = (props: WinModalProps) => {
  let ref: HTMLDialogElement | undefined;
  createEffect(() => {
    if (!ref) return;
    if (props.open) {
      ref.showModal();
    } else {
      ref.close();
    }
  });
  return (
    <dialog class={styles.container} ref={ref}>
      <div>You did it!!!</div>
      <div>
        <button onClick={props.onClose}>Done</button>
      </div>
    </dialog>
  );
};
