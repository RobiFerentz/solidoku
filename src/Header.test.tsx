import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'solid-js/web';

function stubSystemTheme(initialDark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: initialDark,
      media: '(prefers-color-scheme: dark)',
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  );
}

async function mountHeader(showBackButton = false) {
  const { initTheme } = await import('./theme/theme-store');
  initTheme();
  const { Header } = await import('./Header');
  const container = document.createElement('div');
  document.body.append(container);
  const dispose = render(() => <Header onBack={() => {}} showBackButton={showBackButton} />, container);
  return {
    container,
    dispose: () => {
      dispose();
      container.remove();
    },
  };
}

function themeToggle(container: HTMLElement): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>('button[aria-label^="Switch to"]');
  if (!button) throw new Error('theme toggle button not found');
  return button;
}

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('Header theme switcher', () => {
  it('shows the action needed to reach the other theme', async () => {
    stubSystemTheme(false);
    const { container, dispose } = await mountHeader();
    try {
      const toggle = themeToggle(container);
      expect(toggle.getAttribute('aria-label')).toBe('Switch to dark theme');
      expect(toggle.getAttribute('title')).toBe('Switch to dark theme');
    } finally {
      dispose();
    }
  });

  it('switches the document to the dark theme when clicked', async () => {
    stubSystemTheme(false);
    const { container, dispose } = await mountHeader();
    try {
      const toggle = themeToggle(container);
      toggle.click();

      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
      expect(themeToggle(container).getAttribute('aria-label')).toBe('Switch to light theme');
    } finally {
      dispose();
    }
  });

  it('switches back to the light theme on a second click', async () => {
    stubSystemTheme(false);
    const { container, dispose } = await mountHeader();
    try {
      themeToggle(container).click();
      themeToggle(container).click();

      expect(document.documentElement.dataset.theme).toBe('light');
      expect(localStorage.getItem('theme')).toBe('light');
      expect(themeToggle(container).getAttribute('aria-label')).toBe('Switch to dark theme');
    } finally {
      dispose();
    }
  });

  it('keeps the back button when it is shown', async () => {
    stubSystemTheme(false);
    const { container, dispose } = await mountHeader(true);
    try {
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].getAttribute('title')).toBe('back to main menu');
    } finally {
      dispose();
    }
  });
});
