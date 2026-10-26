import { describe, expect, it } from 'vitest';
import {
  DARK_SCHEME_QUERY,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  isTheme,
  nextTheme,
  readStoredTheme,
  readSystemTheme,
  resolveTheme,
} from './theme';

const storage = (value: string | null) => ({ getItem: () => value });

describe('isTheme', () => {
  it.each(['light', 'dark'])('accepts %s', (value) => {
    expect(isTheme(value)).toBe(true);
  });

  it.each([null, undefined, '', 'Light', 'system', 0])('rejects %s', (value) => {
    expect(isTheme(value)).toBe(false);
  });
});

describe('readStoredTheme', () => {
  it('returns null when nothing is stored', () => {
    expect(readStoredTheme(storage(null))).toBeNull();
  });

  it('returns the stored theme', () => {
    expect(readStoredTheme(storage('dark'))).toBe('dark');
    expect(readStoredTheme(storage('light'))).toBe('light');
  });

  it('returns null for an unknown stored value', () => {
    expect(readStoredTheme(storage('sepia'))).toBeNull();
  });

  it('reads the documented storage key', () => {
    const keys: string[] = [];
    readStoredTheme({ getItem: (key: string) => (keys.push(key), null) });
    expect(keys).toEqual([THEME_STORAGE_KEY]);
  });
});

describe('readSystemTheme', () => {
  it('reports dark when the OS preference matches', () => {
    const queries: string[] = [];
    const theme = readSystemTheme((query) => {
      queries.push(query);
      return { matches: true };
    });
    expect(theme).toBe('dark');
    expect(queries).toEqual([DARK_SCHEME_QUERY]);
  });

  it('reports light when the OS preference does not match', () => {
    expect(readSystemTheme(() => ({ matches: false }))).toBe('light');
  });

  it('falls back to light when matchMedia is unavailable', () => {
    expect(readSystemTheme(undefined)).toBe('light');
  });
});

describe('resolveTheme', () => {
  it('prefers an explicit stored choice over the OS preference', () => {
    expect(resolveTheme('light', 'dark')).toBe('light');
    expect(resolveTheme('dark', 'light')).toBe('dark');
  });

  it('follows the OS preference when no choice is stored', () => {
    expect(resolveTheme(null, 'dark')).toBe('dark');
    expect(resolveTheme(null, 'light')).toBe('light');
  });
});

describe('nextTheme', () => {
  it('flips between light and dark', () => {
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('light');
  });
});

describe('THEME_COLORS', () => {
  it('provides a browser chrome colour per theme', () => {
    expect(THEME_COLORS.light).toMatch(/^#[0-9a-f]{6}$/i);
    expect(THEME_COLORS.dark).toMatch(/^#[0-9a-f]{6}$/i);
    expect(THEME_COLORS.dark).not.toBe(THEME_COLORS.light);
  });
});
