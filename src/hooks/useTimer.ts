import { useState, useEffect, useCallback } from 'react';
import type { AgendaItem, TimerState } from '../types/timer';

export const useTimer = (initialAgenda: AgendaItem[]) => {
    const [state, setState] = useState<TimerState>({
        remainingSeconds: initialAgenda.length > 0 ? initialAgenda[0].durationSeconds : 0,
        isRunning: false,
        currentIndex: 0,
        agenda: initialAgenda,
    });

    useEffect(() => {
        let interval: number | undefined;

        if (state.isRunning) {
            interval = window.setInterval(() => {
                setState((prev) => ({
                    ...prev,
                    remainingSeconds: prev.remainingSeconds - 1,
                }));
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [state.isRunning]);

    const toggle = useCallback(() => {
        setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
    }, []);

    const reset = useCallback(() => {
        setState((prev) => ({
            ...prev,
            remainingSeconds: prev.agenda[prev.currentIndex]?.durationSeconds || 0,
            isRunning: false,
        }));
    }, []);

    const nextItem = useCallback(() => {
        setState((prev) => {
            const nextIndex = prev.currentIndex + 1;
            if (nextIndex < prev.agenda.length) {
                return {
                    ...prev,
                    currentIndex: nextIndex,
                    remainingSeconds: prev.agenda[nextIndex].durationSeconds,
                    isRunning: false,
                };
            }
            return prev;
        });
    }, []);

    const updateAgenda = useCallback((newAgenda: AgendaItem[]) => {
        setState((prev) => ({
            ...prev,
            agenda: newAgenda,
            // 最初のアイテムをセットし直す場合はここを調整
        }));
    }, []);

    return {
        ...state,
        toggle,
        reset,
        nextItem,
        updateAgenda,
    };
};
