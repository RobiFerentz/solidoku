import { beforeEach, describe, expect, it, vi } from 'vitest';

type Listener = (event: MediaQueryListEvent) => void;

function stubSystemTheme(initialDark: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches: initialDark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_type: 'change', listener: Listener) => listeners.add(listener),
    removeEventListener: (_type: 'change', listener: Listener) => listeners.delete(listener),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql)
  );
  return {
    listeners,
    emit(matches: boolean) {
      mql.matches = matches;
      for (const listener of listeners) listener({ matches } as MediaQueryListEvent);
    },
  };
}

function themeColorMeta(): string | null {
  return document.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? null;
}

async function loadStore() {
  return import('./theme-store');
}

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.head.innerHTML = '<meta name="theme-color" content="#ffad06" />';
});

describe('theme store initialisation', () => {
  it('follows the OS dark preference when no choice is stored', async () => {
    stubSystemTheme(true);
    const store = await loadStore();
    store.initTheme();
    expect(store.currentTheme()).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(themeColorMeta()).toBe(store.THEME_COLORS.dark);
  });

  it('follows the OS light preference when no choice is stored', async () => {
    stubSystemTheme(false);
    const store = await loadStore();
    store.initTheme();
    expect(store.currentTheme()).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('prefers a stored explicit choice over the OS preference', async () => {
    localStorage.setItem('theme', 'light');
    stubSystemTheme(true);
    const store = await loadStore();
    store.initTheme();
    expect(store.currentTheme()).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('ignores an invalid stored value and follows the OS', async () => {
    localStorage.setItem('theme', 'sepia');
    stubSystemTheme(true);
    const store = await loadStore();
    store.initTheme();
    expect(store.currentTheme()).toBe('dark');
  });
});

describe('theme store changes', () => {
  it('persists and applies an explicit theme', async () => {
    stubSystemTheme(false);
    const store = await loadStore();
    store.initTheme();

    store.setTheme('dark');

    expect(store.currentTheme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(themeColorMeta()).toBe(store.THEME_COLORS.dark);
  });

  it('toggles between themes and persists the result', async () => {
    stubSystemTheme(false);
    const store = await loadStore();
    store.initTheme();

    store.toggleTheme();
    expect(store.currentTheme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    store.toggleTheme();
    expect(store.currentTheme()).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('follows OS changes while the player has not chosen a theme', async () => {
    const system = stubSystemTheme(false);
    const store = await loadStore();
    store.initTheme();

    system.emit(true);
    expect(store.currentTheme()).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    system.emit(false);
    expect(store.currentTheme()).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('stops following OS changes once the player has chosen a theme', async () => {
    const system = stubSystemTheme(false);
    const store = await loadStore();
    store.initTheme();
    store.setTheme('light');

    system.emit(true);

    expect(store.currentTheme()).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('removes the OS listener on cleanup', async () => {
    const system = stubSystemTheme(false);
    const store = await loadStore();
    const cleanup = store.initTheme();
    expect(system.listeners.size).toBe(1);

    cleanup();

    expect(system.listeners.size).toBe(0);
  });
});
