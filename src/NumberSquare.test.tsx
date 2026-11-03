import { describe, expect, it, vi } from 'vitest';
import { render } from 'solid-js/web';
import { NumberSquare } from './NumberSquare';

function mountSquare(props: Partial<Parameters<typeof NumberSquare>[0]> = {}) {
  const onGuess = vi.fn();
  const onSelected = vi.fn();
  const defaultProps = {
    value: 5,
    onGuess,
    tabIndex: 1,
    coords: { x: 2, y: 3 },
    isSelected: false,
    isCorrect: false,
    isMistake: false,
    isFixed: false,
    onSelected,
    ...props,
  };

  const container = document.createElement('div');
  document.body.append(container);
  const dispose = render(() => <NumberSquare {...defaultProps} />, container);
  const element = container.firstElementChild as HTMLDivElement;

  return {
    element,
    onGuess,
    onSelected,
    dispose: () => {
      dispose();
      container.remove();
    },
  };
}

describe('NumberSquare', () => {
  it('renders ARIA gridcell role and aria-label', () => {
    const { element, dispose } = mountSquare({
      coords: { x: 2, y: 3 },
      value: 7,
    });
    try {
      expect(element.getAttribute('role')).toBe('gridcell');
      expect(element.getAttribute('aria-rowindex')).toBe('4');
      expect(element.getAttribute('aria-colindex')).toBe('3');
      expect(element.getAttribute('aria-label')).toBe('Row 4, Column 3, value 7');
    } finally {
      dispose();
    }
  });

  it('updates aria-label when empty', () => {
    const { element, dispose } = mountSquare({
      coords: { x: 0, y: 0 },
      value: 0,
    });
    try {
      expect(element.getAttribute('aria-label')).toBe('Row 1, Column 1, empty');
    } finally {
      dispose();
    }
  });

  it('navigates with arrow keys without erasing cell value', () => {
    const { element, onGuess, onSelected, dispose } = mountSquare({
      coords: { x: 2, y: 2 },
    });
    try {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      expect(onSelected).toHaveBeenCalledWith({ x: 2, y: 1 });
      expect(onGuess).not.toHaveBeenCalled();

      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(onSelected).toHaveBeenCalledWith({ x: 2, y: 3 });

      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(onSelected).toHaveBeenCalledWith({ x: 1, y: 2 });

      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(onSelected).toHaveBeenCalledWith({ x: 3, y: 2 });
    } finally {
      dispose();
    }
  });

  it('enters valid digit 1-9', () => {
    const { element, onGuess, dispose } = mountSquare({
      value: 0,
      isFixed: false,
    });
    try {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: '7', bubbles: true }));
      expect(onGuess).toHaveBeenCalledWith(7);
    } finally {
      dispose();
    }
  });

  it('does not re-emit guess when typing same digit', () => {
    const { element, onGuess, dispose } = mountSquare({
      value: 7,
      isFixed: false,
    });
    try {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: '7', bubbles: true }));
      expect(onGuess).not.toHaveBeenCalled();
    } finally {
      dispose();
    }
  });

  it('clears cell on Backspace, Delete, 0, or Space', () => {
    for (const key of ['Backspace', 'Delete', '0', ' ']) {
      const { element, onGuess, dispose } = mountSquare({
        value: 7,
        isFixed: false,
      });
      try {
        element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        expect(onGuess).toHaveBeenCalledWith(0);
      } finally {
        dispose();
      }
    }
  });

  it('does NOT clear cell on other keys like Tab, Escape, F5, or letters', () => {
    for (const key of ['Tab', 'Escape', 'F5', 'Shift', 'a', 'x']) {
      const { element, onGuess, dispose } = mountSquare({
        value: 7,
        isFixed: false,
      });
      try {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        expect(onGuess).not.toHaveBeenCalled();
        if (key === 'Tab' || key === 'Escape' || key === 'F5') {
          // Native behavior not prevented
          expect(event.defaultPrevented).toBe(false);
        }
      } finally {
        dispose();
      }
    }
  });

  it('ignores input on fixed clues', () => {
    const { element, onGuess, dispose } = mountSquare({
      value: 7,
      isFixed: true,
    });
    try {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
      expect(onGuess).not.toHaveBeenCalled();
    } finally {
      dispose();
    }
  });
});
