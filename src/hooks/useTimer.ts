import { useState, useEffect, useCallback, useRef } from 'react';
import type { AgendaItem, TimerState } from '../types/timer';

export const useTimer = (initialAgenda: AgendaItem[]) => {
    const [state, setState] = useState<TimerState>({
        remainingSeconds: initialAgenda.length > 0 ? initialAgenda[0].durationSeconds : 0,
        isRunning: false,
        currentIndex: 0,
        agenda: initialAgenda,
    });

    // 現在のアイテムの時間を監視して自動リセットするための参照
    const lastDurationRef = useRef<number | null>(null);

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

    // 現在の予定の時間が変更されたら自動停止・リセット
    useEffect(() => {
        const currentItem = state.agenda[state.currentIndex];
        if (!currentItem) return;

        if (lastDurationRef.current !== null && lastDurationRef.current !== currentItem.durationSeconds) {
            setState((prev) => ({
                ...prev,
                remainingSeconds: currentItem.durationSeconds,
                isRunning: false,
            }));
        }
        lastDurationRef.current = currentItem.durationSeconds;
    }, [state.agenda, state.currentIndex]);

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

    const goToItem = useCallback((index: number) => {
        setState((prev) => {
            if (index >= 0 && index < prev.agenda.length) {
                return {
                    ...prev,
                    currentIndex: index,
                    remainingSeconds: prev.agenda[index].durationSeconds,
                    isRunning: false,
                };
            }
            return prev;
        });
    }, []);

    const reorderItem = useCallback((index: number, direction: 'up' | 'down') => {
        setState((prev) => {
            const newAgenda = [...prev.agenda];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;

            if (targetIndex < 0 || targetIndex >= newAgenda.length) return prev;

            // 要素の入れ替え
            [newAgenda[index], newAgenda[targetIndex]] = [newAgenda[targetIndex], newAgenda[index]];

            // 現在フォーカスしている項目が移動した場合、currentIndex を追従させる
            let nextCurrentIndex = prev.currentIndex;
            if (prev.currentIndex === index) {
                nextCurrentIndex = targetIndex;
            } else if (prev.currentIndex === targetIndex) {
                nextCurrentIndex = index;
            }

            return {
                ...prev,
                agenda: newAgenda,
                currentIndex: nextCurrentIndex,
            };
        });
    }, []);

    const updateAgenda = useCallback((newAgenda: AgendaItem[]) => {
        setState((prev) => {
            // 現在のインデックスが削除されたアイテムを指している可能性への対応
            let nextIndex = prev.currentIndex;
            if (nextIndex >= newAgenda.length) {
                nextIndex = Math.max(0, newAgenda.length - 1);
            }

            return {
                ...prev,
                agenda: newAgenda,
                currentIndex: nextIndex,
            };
        });
    }, []);

    return {
        ...state,
        toggle,
        reset,
        nextItem,
        goToItem,
        reorderItem,
        updateAgenda,
    };
};
