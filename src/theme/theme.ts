export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

// Browser chrome colour (meta theme-color) per theme. Light keeps the existing
// header orange; dark matches the dark page background.
export const THEME_COLORS: Record<Theme, string> = {
  light: '#ffad06',
  dark: '#100e0d',
};

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export function readStoredTheme(storage: Pick<Storage, 'getItem'>): Theme | null {
  const value = storage.getItem(THEME_STORAGE_KEY);
  return isTheme(value) ? value : null;
}

export function readSystemTheme(matchMedia: ((query: string) => { matches: boolean }) | undefined): Theme {
  if (!matchMedia) return 'light';
  return matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
}

export function resolveTheme(stored: Theme | null, system: Theme): Theme {
  return stored ?? system;
}

export function nextTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}
