import { describe, expect, it } from 'vitest';

import type { TimerState } from '@/types/timer';
import {
  moveToNextItem,
  moveToPreviousItem,
  replaceAgenda,
  tickTimer,
} from './timerLogic';

const createState = (overrides: Partial<TimerState> = {}): TimerState => ({
  agenda: [
    { id: '1', title: 'A', durationSeconds: 60 },
    { id: '2', title: 'B', durationSeconds: 120 },
  ],
  currentIndex: 0,
  remainingSeconds: 60,
  isRunning: true,
  isSoundEnabled: true,
  overtimeReminderMinutes: null,
  hasOvertimeReminderPlayed: false,
  ...overrides,
});

describe('tickTimer の動作', () => {
  it('残り時間を1秒減らし、0到達でベルを要求する', () => {
    const { nextState, shouldPlayBell } = tickTimer(createState());
    expect(nextState.remainingSeconds).toBe(59);
    expect(shouldPlayBell).toBe(false);

    const { shouldPlayBell: atZero } = tickTimer(
      createState({ remainingSeconds: 1 }),
    );
    expect(atZero).toBe(true);
  });

  it('オーバータイム閾値を跨ぐとベルを要求し、フラグを立てる', () => {
    const { nextState, shouldPlayBell } = tickTimer(
      createState({
        remainingSeconds: -59,
        overtimeReminderMinutes: 1,
      }),
    );
    expect(shouldPlayBell).toBe(true);
    expect(nextState.hasOvertimeReminderPlayed).toBe(true);
  });
});

describe('アイテムの移動', () => {
  it('次のアイテムへ移動して残り時間を更新する', () => {
    const nextState = moveToNextItem(createState());
    expect(nextState.currentIndex).toBe(1);
    expect(nextState.remainingSeconds).toBe(120);
  });

  it('前のアイテムへ移動して残り時間を更新する', () => {
    const base = createState({ currentIndex: 1, remainingSeconds: 80 });
    const nextState = moveToPreviousItem(base);
    expect(nextState.currentIndex).toBe(0);
    expect(nextState.remainingSeconds).toBe(60);
  });
});

describe('Agenda 更新時の現在アイテム', () => {
  it('再生中より下の項目を削除すると終了予定用の残時間が減る（現在アイテムは維持）', () => {
    const base = createState({
      currentIndex: 1,
      remainingSeconds: 80,
      agenda: [
        { id: '1', title: 'A', durationSeconds: 60 },
        { id: '2', title: 'B', durationSeconds: 120 },
        { id: '3', title: 'C', durationSeconds: 180 },
      ],
    });
    const next = replaceAgenda(base, [
      { id: '1', title: 'A', durationSeconds: 60 },
      { id: '2', title: 'B', durationSeconds: 120 },
    ]);

    expect(next.currentIndex).toBe(1); // Bが再生中のまま
    expect(next.remainingSeconds).toBe(80);
    const totalRemaining =
      next.remainingSeconds +
      next.agenda
        .slice(next.currentIndex + 1)
        .reduce((acc, item) => acc + item.durationSeconds, 0);
    expect(totalRemaining).toBe(80); // C分が削除されて減っている
  });

  it('再生中より上の項目を削除しても現在アイテムと残時間は維持される', () => {
    const base = createState({
      currentIndex: 1,
      remainingSeconds: 50,
      agenda: [
        { id: '1', title: 'A', durationSeconds: 60 },
        { id: '2', title: 'B', durationSeconds: 120 },
        { id: '3', title: 'C', durationSeconds: 180 },
      ],
    });
    const next = replaceAgenda(base, [
      { id: '2', title: 'B', durationSeconds: 120 },
      { id: '3', title: 'C', durationSeconds: 180 },
    ]);

    expect(next.currentIndex).toBe(0); // Bが先頭にスライド
    expect(next.agenda[next.currentIndex].id).toBe('2');
    expect(next.remainingSeconds).toBe(50); // 再生中の残り秒数は変わらない
    const totalRemaining =
      next.remainingSeconds +
      next.agenda
        .slice(next.currentIndex + 1)
        .reduce((acc, item) => acc + item.durationSeconds, 0);
    expect(totalRemaining).toBe(50 + 180); // 下のアイテムだけが残る
  });
});
