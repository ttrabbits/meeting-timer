import React from 'react';
import { formatTime } from '../utils/timeFormat';

interface TimerDisplayProps {
    seconds: number;
    title: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, title }) => {
    const isNegative = seconds < 0;

    return (
        <div className="timer-container" style={{ textAlign: 'center' }}>
            <p className="timer-title">{title}</p>
            <div
                className={`timer-display ${isNegative ? 'negative' : ''}`}
            >
                {formatTime(seconds)}
            </div>
        </div>
    );
};
