import { useState, useEffect, useCallback, useRef } from 'react';
import {
  jumpToIndex,
  moveToNextItem,
  moveToPreviousItem,
  reorderAgendaItems,
  replaceAgenda,
  resetCurrentItem,
  syncCurrentDuration,
  tickTimer,
  toggleRunning,
} from '@/utils/timerLogic';
import type { AgendaItem, TimerState } from '@/types/timer';

export const useTimer = (initialAgenda: AgendaItem[]) => {
  const [state, setState] = useState<TimerState>({
    agenda: initialAgenda,
    currentIndex: 0,
    remainingSeconds: initialAgenda[0]?.durationSeconds || 0,
    isRunning: false,
    isSoundEnabled: true,
    overtimeReminderMinutes: null,
    hasOvertimeReminderPlayed: false,
  });

  // 現在のアイテムの時間を監視して自動リセットするための参照
  const lastDurationRef = useRef<number | null>(null);

  // ベル音を鳴らす関数 (Web Audio API)
  const playBell = useCallback(() => {
    if (!state.isSoundEnabled) return;
    try {
      const { webkitAudioContext } = window as Window & {
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioContextClass = window.AudioContext ?? webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();

      // ベルのような金属音を作る
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      // 高めの倍音を含む周波数 (1000Hz程度)
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);

      // 減衰
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 1.5,
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
      console.error('Failed to play bell sound:', e);
    }
  }, [state.isSoundEnabled]);

  useEffect(() => {
    let interval: number | undefined;

    if (state.isRunning) {
      interval = window.setInterval(() => {
        setState((prev) => {
          const { nextState, shouldPlayBell } = tickTimer(prev);
          if (shouldPlayBell) {
            playBell();
          }
          return nextState;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isRunning, playBell]);

  // 現在の予定の時間が変更されたら自動停止・リセット
  useEffect(() => {
    const currentItem = state.agenda[state.currentIndex];
    if (!currentItem) return;

    if (
      lastDurationRef.current !== null &&
      lastDurationRef.current !== currentItem.durationSeconds
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- agenda変更に合わせて即座に状態を同期する必要があるため
      setState((prev) =>
        syncCurrentDuration(prev, currentItem.durationSeconds),
      );
    }
    lastDurationRef.current = currentItem.durationSeconds;
  }, [state.agenda, state.currentIndex]);

  const toggle = useCallback(() => {
    setState((prev) => toggleRunning(prev));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => resetCurrentItem(prev));
  }, []);

  const nextItem = useCallback(() => {
    setState((prev) => {
      const nextState = moveToNextItem(prev);
      lastDurationRef.current =
        nextState.agenda[nextState.currentIndex]?.durationSeconds ?? null;
      return nextState;
    });
  }, []);

  const prevItem = useCallback(() => {
    setState((prev) => {
      const nextState = moveToPreviousItem(prev);
      lastDurationRef.current =
        nextState.agenda[nextState.currentIndex]?.durationSeconds ?? null;
      return nextState;
    });
  }, []);

  const goToItem = useCallback((index: number) => {
    setState((prev) => {
      const nextState = jumpToIndex(prev, index, { isRunning: false });
      lastDurationRef.current =
        nextState.agenda[nextState.currentIndex]?.durationSeconds ?? null;
      return nextState;
    });
  }, []);

  const startItem = useCallback((index: number) => {
    setState((prev) => {
      const nextState = jumpToIndex(prev, index, { isRunning: true });
      lastDurationRef.current =
        nextState.agenda[nextState.currentIndex]?.durationSeconds ?? null;
      return nextState;
    });
  }, []);

  const reorderAgendaByIndex = useCallback(
    (fromIndex: number, toIndex: number) => {
      setState((prev) => reorderAgendaItems(prev, fromIndex, toIndex));
    },
    [],
  );

  const updateAgenda = useCallback((newAgenda: AgendaItem[]) => {
    setState((prev) => {
      const nextState = replaceAgenda(prev, newAgenda);
      lastDurationRef.current =
        nextState.agenda[nextState.currentIndex]?.durationSeconds ?? null;
      return nextState;
    });
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, isSoundEnabled: enabled }));
  }, []);

  const setOvertimeReminderMinutes = useCallback((minutes: number | null) => {
    setState((prev) => ({
      ...prev,
      overtimeReminderMinutes: minutes && minutes > 0 ? minutes : null,
      hasOvertimeReminderPlayed: false,
    }));
  }, []);

  return {
    ...state,
    toggle,
    reset,
    nextItem,
    prevItem,
    goToItem,
    startItem,
    updateAgenda,
    reorderAgendaByIndex,
    setSoundEnabled,
    setOvertimeReminderMinutes,
    playBell,
  };
};
