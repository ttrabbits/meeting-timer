import { useState, useEffect, useCallback, useRef } from 'react';
import type { AgendaItem, TimerState } from '@/types/timer';

export const useTimer = (initialAgenda: AgendaItem[]) => {
    const [state, setState] = useState<TimerState>({
        agenda: initialAgenda,
        currentIndex: 0,
        remainingSeconds: initialAgenda[0]?.durationSeconds || 0,
        isRunning: false,
        isSoundEnabled: true,
    });

    // 現在のアイテムの時間を監視して自動リセットするための参照
    const lastDurationRef = useRef<number | null>(null);

    // ベル音を鳴らす関数 (Web Audio API)
    const playBell = useCallback(() => {
        if (!state.isSoundEnabled) return;
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContextClass();

            // ベルのような金属音を作る
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            // 高めの倍音を含む周波数 (1000Hz程度)
            oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);

            // 減衰
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

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
                    const nextSeconds = prev.remainingSeconds - 1;

                    // 0になった瞬間にベルを鳴らす
                    if (nextSeconds === 0) {
                        playBell();
                    }

                    return {
                        ...prev,
                        remainingSeconds: nextSeconds,
                    };
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
        setState((prev) => {
            const isStarting = !prev.isRunning;
            const newAgenda = [...prev.agenda];
            const currentItem = newAgenda[prev.currentIndex];

            // 最初に再生を開始した時間を保持（すでにあれば上書きしない）
            if (isStarting && currentItem && !currentItem.startTime) {
                newAgenda[prev.currentIndex] = {
                    ...currentItem,
                    startTime: Date.now()
                };
            }

            return {
                ...prev,
                isRunning: isStarting,
                agenda: newAgenda
            };
        });
    }, []);

    const reset = useCallback(() => {
        setState((prev) => {
            const currentItem = prev.agenda[prev.currentIndex];
            const newAgenda = [...prev.agenda];
            if (currentItem) {
                // リセット時は実績時間もクリア
                newAgenda[prev.currentIndex] = {
                    ...currentItem,
                    startTime: undefined,
                    endTime: undefined
                };
            }
            return {
                ...prev,
                agenda: newAgenda,
                remainingSeconds: currentItem?.durationSeconds || 0,
                isRunning: false,
            };
        });
    }, []);

    const nextItem = useCallback(() => {
        setState((prev) => {
            const nextIndex = prev.currentIndex + 1;
            if (nextIndex < prev.agenda.length) {
                const now = Date.now();
                const newAgenda = [...prev.agenda];

                // 前のアイテムの終了時間を記録
                if (newAgenda[prev.currentIndex]) {
                    newAgenda[prev.currentIndex] = {
                        ...newAgenda[prev.currentIndex],
                        endTime: now
                    };
                }

                // 次のアイテムの開始時間を記録（再生中なら）
                if (prev.isRunning && newAgenda[nextIndex] && !newAgenda[nextIndex].startTime) {
                    newAgenda[nextIndex] = {
                        ...newAgenda[nextIndex],
                        startTime: now
                    };
                }

                lastDurationRef.current = newAgenda[nextIndex].durationSeconds;
                return {
                    ...prev,
                    currentIndex: nextIndex,
                    remainingSeconds: newAgenda[nextIndex].durationSeconds,
                    isRunning: prev.isRunning,
                    agenda: newAgenda,
                };
            }
            return prev;
        });
    }, []);

    const prevItem = useCallback(() => {
        setState((prev) => {
            const prevIndex = prev.currentIndex - 1;
            if (prevIndex >= 0) {
                const now = Date.now();
                const newAgenda = [...prev.agenda];

                // 現在（移動前）のアイテムの終了時間を記録
                if (newAgenda[prev.currentIndex]) {
                    newAgenda[prev.currentIndex] = {
                        ...newAgenda[prev.currentIndex],
                        endTime: now
                    };
                }

                // 前のアイテムの開始時間を記録（再生中なら）
                if (prev.isRunning && newAgenda[prevIndex] && !newAgenda[prevIndex].startTime) {
                    newAgenda[prevIndex] = {
                        ...newAgenda[prevIndex],
                        startTime: now
                    };
                }

                lastDurationRef.current = newAgenda[prevIndex].durationSeconds;
                return {
                    ...prev,
                    currentIndex: prevIndex,
                    remainingSeconds: newAgenda[prevIndex].durationSeconds,
                    isRunning: prev.isRunning,
                    agenda: newAgenda,
                };
            }
            return prev;
        });
    }, []);

    const goToItem = useCallback((index: number) => {
        setState((prev) => {
            if (index >= 0 && index < prev.agenda.length) {
                const now = Date.now();
                const newAgenda = [...prev.agenda];

                // 現在のアイテムの終了時間を記録
                if (newAgenda[prev.currentIndex]) {
                    newAgenda[prev.currentIndex] = {
                        ...newAgenda[prev.currentIndex],
                        endTime: now
                    };
                }

                lastDurationRef.current = newAgenda[index].durationSeconds;
                return {
                    ...prev,
                    currentIndex: index,
                    remainingSeconds: newAgenda[index].durationSeconds,
                    isRunning: false,
                    agenda: newAgenda,
                };
            }
            return prev;
        });
    }, []);

    const startItem = useCallback((index: number) => {
        setState((prev) => {
            if (index >= 0 && index < prev.agenda.length) {
                const now = Date.now();
                const newAgenda = [...prev.agenda];

                // 現在のアイテムの終了時間を記録
                if (newAgenda[prev.currentIndex]) {
                    newAgenda[prev.currentIndex] = {
                        ...newAgenda[prev.currentIndex],
                        endTime: now
                    };
                }

                // 新しいアイテムの開始時間を記録（すでにあれば上書きしない）
                if (newAgenda[index] && !newAgenda[index].startTime) {
                    newAgenda[index] = {
                        ...newAgenda[index],
                        startTime: now
                    };
                }

                lastDurationRef.current = newAgenda[index].durationSeconds;
                return {
                    ...prev,
                    currentIndex: index,
                    remainingSeconds: newAgenda[index].durationSeconds,
                    isRunning: true,
                    agenda: newAgenda,
                };
            }
            return prev;
        });
    }, []);

    const reorderAgenda = useCallback((index: number, direction: 'up' | 'down') => {
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

    const setSoundEnabled = useCallback((enabled: boolean) => {
        setState((prev) => ({ ...prev, isSoundEnabled: enabled }));
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
        reorderAgenda,
        setSoundEnabled,
    };
};
