import { createSignal } from 'solid-js';
import {
  DARK_SCHEME_QUERY,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  Theme,
  nextTheme,
  readStoredTheme,
  readSystemTheme,
  resolveTheme,
} from './theme';

export { THEME_COLORS, THEME_STORAGE_KEY, type Theme } from './theme';

function browserMatchMedia(): ((query: string) => MediaQueryList) | undefined {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia.bind(window)
    : undefined;
}

const [theme, setThemeSignal] = createSignal<Theme>(
  resolveTheme(readStoredTheme(localStorage), readSystemTheme(browserMatchMedia()))
);

export function currentTheme(): Theme {
  return theme();
}

export function applyTheme(next: Theme): void {
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[next]);
}

export function setTheme(next: Theme): void {
  setThemeSignal(next);
  localStorage.setItem(THEME_STORAGE_KEY, next);
  applyTheme(next);
}

export function toggleTheme(): void {
  setTheme(nextTheme(theme()));
}

/**
 * Applies the initial theme before first paint and follows OS theme changes
 * until the player makes an explicit choice. Returns a cleanup function.
 */
export function initTheme(): () => void {
  applyTheme(theme());
  const matchMedia = browserMatchMedia();
  if (!matchMedia) return () => {};

  const query = matchMedia(DARK_SCHEME_QUERY);
  const onChange = (event: MediaQueryListEvent) => {
    if (readStoredTheme(localStorage)) return;
    setThemeSignal(event.matches ? 'dark' : 'light');
    applyTheme(event.matches ? 'dark' : 'light');
  };
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
