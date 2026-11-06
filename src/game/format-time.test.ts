import { describe, expect, it } from 'vitest';
import { formatTime } from './format-time';

describe('formatTime', () => {
  it('formats 0 as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });
  it('formats 65 as 01:05', () => {
    expect(formatTime(65)).toBe('01:05');
  });
  it('pads single digits', () => {
    expect(formatTime(61)).toBe('01:01');
  });
  it('rolls hours into minutes', () => {
    expect(formatTime(4500)).toBe('75:00');
  });
});
