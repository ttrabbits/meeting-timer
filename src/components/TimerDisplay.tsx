import React from 'react';
import { formatTime } from '../utils/timeFormat';

interface TimerDisplayProps {
    seconds: number;
    title: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, title }) => {
    const isNegative = seconds < 0;

    return (
        <div className="flex flex-col items-center gap-2">
            <p className="text-xl font-medium text-zinc-400">
                {title}
            </p>
            <div
                className={`text-[12rem] font-extralight tracking-tighter leading-none tabular-nums select-none transition-colors duration-500 ${isNegative ? 'text-red-500' : 'text-white'
                    }`}
            >
                {formatTime(seconds)}
            </div>
        </div>
    );
};
