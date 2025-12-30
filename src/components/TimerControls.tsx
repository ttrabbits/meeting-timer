import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasMore: boolean;
  hasPrev: boolean;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  onToggle,
  onReset,
  onNext,
  onPrevious,
  hasMore,
  hasPrev,
}) => {
  return (
    <div className="flex items-center gap-6 mt-4">
      <Button
        variant="secondary"
        size="icon"
        className="h-16 w-16 rounded-full bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 active:scale-95 transition-all disabled:bg-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed"
        onClick={onPrevious}
        disabled={!hasPrev}
      >
        <SkipBack className="h-7 w-7 fill-current" />
      </Button>

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
        className={`h-16 w-16 rounded-full active:scale-95 transition-all shadow-lg ${
          isRunning
            ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'
            : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
        }`}
        onClick={onToggle}
      >
        {isRunning ? (
          <Pause className="h-7 w-7 fill-current" />
        ) : (
          <Play className="h-7 w-7 fill-current ml-0.5" />
        )}
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="h-16 w-16 rounded-full bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 active:scale-95 transition-all disabled:bg-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed"
        onClick={onNext}
        disabled={!hasMore}
      >
        <SkipForward className="h-7 w-7 fill-current" />
      </Button>
    </div>
  );
};
