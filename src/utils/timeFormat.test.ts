import { describe, expect, it } from 'vitest';

import { formatTime, formatWallTime } from './timeFormat';

describe('formatTime の動作', () => {
  it('分と秒をゼロ埋めする', () => {
    expect(formatTime(125)).toBe('02:05');
  });

  it('ゼロは 00:00 を返す', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('負の値はマイナス付きで返す', () => {
    expect(formatTime(-61)).toBe('-01:01');
  });
});

describe('formatWallTime の動作', () => {
  it('時と分を HH:mm 形式にする', () => {
    const date = new Date();
    date.setHours(9, 5, 0, 0);
    expect(formatWallTime(date)).toBe('09:05');
  });
});
