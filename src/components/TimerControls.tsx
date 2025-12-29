import React from 'react';

interface TimerControlsProps {
    isRunning: boolean;
    onToggle: () => void;
    onReset: () => void;
    onNext: () => void;
    hasMore: boolean;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
    isRunning,
    onToggle,
    onReset,
    onNext,
    hasMore,
}) => {
    return (
        <div className="timer-controls">
            <button className="btn-circle btn-reset" onClick={onReset}>
                リセット
            </button>

            <button
                className={`btn-circle ${isRunning ? 'btn-stop' : 'btn-start'}`}
                onClick={onToggle}
            >
                {isRunning ? '停止' : '開始'}
            </button>

            {hasMore && (
                <button className="btn-circle btn-next" onClick={onNext}>
                    次へ
                </button>
            )}
        </div>
    );
};
