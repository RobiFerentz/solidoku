import { describe, expect, it, vi } from 'vitest';
import { render } from 'solid-js/web';
import { NumberPad } from './NumberPad';

describe('NumberPad', () => {
  it('renders buttons 1 through 9 and an erase button', () => {
    const onInput = vi.fn();
    const onErase = vi.fn();

    const container = document.createElement('div');
    document.body.append(container);
    const dispose = render(() => <NumberPad onInput={onInput} onErase={onErase} disabled={false} />, container);

    try {
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(10);

      // Buttons 1-9
      for (let i = 1; i <= 9; i++) {
        const btn = Array.from(buttons).find((b) => b.textContent?.trim() === String(i));
        expect(btn).toBeTruthy();
      }

      // Erase button
      const eraseBtn = Array.from(buttons).find(
        (b) => b.getAttribute('aria-label') === 'Erase' || b.textContent?.trim() === '⌫'
      );
      expect(eraseBtn).toBeTruthy();
    } finally {
      dispose();
      container.remove();
    }
  });

  it('triggers onInput with corresponding number when digit button is clicked', () => {
    const onInput = vi.fn();
    const onErase = vi.fn();

    const container = document.createElement('div');
    document.body.append(container);
    const dispose = render(() => <NumberPad onInput={onInput} onErase={onErase} disabled={false} />, container);

    try {
      const button7 = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.trim() === '7');
      button7?.click();
      expect(onInput).toHaveBeenCalledWith(7);
      expect(onErase).not.toHaveBeenCalled();
    } finally {
      dispose();
      container.remove();
    }
  });

  it('triggers onErase when erase button is clicked', () => {
    const onInput = vi.fn();
    const onErase = vi.fn();

    const container = document.createElement('div');
    document.body.append(container);
    const dispose = render(() => <NumberPad onInput={onInput} onErase={onErase} disabled={false} />, container);

    try {
      const eraseBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.getAttribute('aria-label') === 'Erase' || b.textContent?.trim() === '⌫'
      );
      eraseBtn?.click();
      expect(onErase).toHaveBeenCalled();
      expect(onInput).not.toHaveBeenCalled();
    } finally {
      dispose();
      container.remove();
    }
  });

  it('disables all buttons when disabled is true', () => {
    const onInput = vi.fn();
    const onErase = vi.fn();

    const container = document.createElement('div');
    document.body.append(container);
    const dispose = render(() => <NumberPad onInput={onInput} onErase={onErase} disabled={true} />, container);

    try {
      const buttons = container.querySelectorAll('button');
      buttons.forEach((b) => {
        expect(b.disabled).toBe(true);
      });
    } finally {
      dispose();
      container.remove();
    }
  });
});
