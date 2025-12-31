import { describe, expect, it } from 'vitest';

import type { AgendaItem } from '@/types/timer';
import { buildQueryFromState, parseQueryState } from './queryState';

const sampleAgenda: AgendaItem[] = [
  { id: '1', title: 'A', durationSeconds: 60 },
  { id: '2', title: 'B', durationSeconds: 120 },
];

describe('queryState のパース/生成', () => {
  it('クエリから予定とサウンド設定を復元できる', () => {
    const query = buildQueryFromState({
      agenda: sampleAgenda,
      isSoundEnabled: false,
      overtimeReminderMinutes: 5,
    });

    const parsed = parseQueryState(`?${query}`);
    expect(parsed.agenda).toEqual(sampleAgenda);
    expect(parsed.isSoundEnabled).toBe(false);
    expect(parsed.overtimeReminderMinutes).toBe(5);
  });

  it('壊れたクエリは無視しデフォルトにフォールバックさせる', () => {
    const parsed = parseQueryState(
      '?agenda=%%%invalid&sound=maybe&overtime=-1',
    );
    expect(parsed.agenda).toBeUndefined();
    expect(parsed.isSoundEnabled).toBeUndefined();
    expect(parsed.overtimeReminderMinutes).toBeNull();
  });

  it('予定配列は型ガードで不正要素を除外する', () => {
    const mixed = buildQueryFromState({
      agenda: [
        { id: '1', title: 'A', durationSeconds: 60 },
        // @ts-expect-error 故意に不正な要素
        { id: 2, title: 'B', durationSeconds: '120' },
      ],
      isSoundEnabled: true,
      overtimeReminderMinutes: null,
    });
    const parsed = parseQueryState(`?${mixed}`);
    expect(parsed.agenda).toEqual([
      { id: '1', title: 'A', durationSeconds: 60 },
    ]);
  });
});
