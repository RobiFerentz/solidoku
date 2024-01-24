import { Show } from 'solid-js';
import styles from './Header.module.css';

type HeaderProps = {
  onBack: () => void;
  showBackButton: boolean;
};

export const Header = (props: HeaderProps) => {
  return (
    <header class={styles.header}>
      <div class={styles.spacer}>
        <Show when={props.showBackButton}>
          <button type="button" title="back to main menu" onClick={props.onBack}>
            ◀
          </button>
        </Show>
      </div>
      <h1 class={styles.appName}>Solidoku</h1>
      <div class={styles.spacer}></div>
    </header>
  );
};
