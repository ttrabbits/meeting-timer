import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';

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
        <div className="flex items-center gap-8 mt-4">
            <Button
                variant="secondary"
                size="icon"
                className="h-16 w-16 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95 transition-all"
                onClick={onReset}
            >
                <RotateCcw className="h-6 w-6" />
            </Button>

            <Button
                size="icon"
                className={`h-20 w-20 rounded-full active:scale-95 transition-all shadow-lg ${isRunning
                        ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'
                        : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                    }`}
                onClick={onToggle}
            >
                {isRunning ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current ml-1" />}
            </Button>

            <div className="w-16 h-16 flex items-center justify-center">
                {hasMore && (
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-16 w-16 rounded-full bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 active:scale-95 transition-all"
                        onClick={onNext}
                    >
                        <ChevronRight className="h-8 w-8" />
                    </Button>
                )}
            </div>
        </div>
    );
};
