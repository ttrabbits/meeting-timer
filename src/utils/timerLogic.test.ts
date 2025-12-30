import { describe, expect, it } from 'vitest';

import type { TimerState } from '@/types/timer';
import { moveToNextItem, moveToPreviousItem, tickTimer } from './timerLogic';

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
