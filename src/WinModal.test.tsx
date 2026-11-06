import { describe, expect, it } from 'vitest';
import { render } from 'solid-js/web';
import { WinModal } from './WinModal';

describe('WinModal', () => {
  it('shows final time MM:SS', () => {
    HTMLDialogElement.prototype.showModal ??= function () {};
    HTMLDialogElement.prototype.close ??= function () {};
    const container = document.createElement('div');
    document.body.append(container);
    const dispose = render(() => <WinModal open={true} onClose={() => {}} elapsedSeconds={65} />, container);
    try {
      expect(container.textContent).toMatch(/01:05/);
    } finally {
      dispose();
      container.remove();
    }
  });
});
