import { Show } from 'solid-js';
import styles from './Header.module.css';
import { currentTheme, toggleTheme } from './theme/theme-store';

type HeaderProps = {
  onBack: () => void;
  showBackButton: boolean;
};

const isDark = () => currentTheme() === 'dark';
const toggleLabel = () => (isDark() ? 'Switch to light theme' : 'Switch to dark theme');

const SunIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="1.5em"
    height="1.5em"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="1.5em"
    height="1.5em"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

export const Header = (props: HeaderProps) => {
  return (
    <header class={styles.header}>
      <div class={styles.spacer}>
        <Show when={props.showBackButton}>
          <button tabIndex={0} type="button" title="back to main menu" onClick={props.onBack}>
            ◀
          </button>
        </Show>
      </div>
      <h1 class={styles.appName}>Solidoku</h1>
      <div class={`${styles.spacer} ${styles.actions}`}>
        <button
          type="button"
          class={styles.themeToggle}
          title={toggleLabel()}
          aria-label={toggleLabel()}
          onClick={toggleTheme}
        >
          <Show when={isDark()} fallback={<MoonIcon />}>
            <SunIcon />
          </Show>
        </button>
      </div>
    </header>
  );
};
