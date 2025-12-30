import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pause, Play, X, Clock } from 'lucide-react';

import type { AgendaItem } from '@/types/timer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type AgendaItemCardProps = {
  item: AgendaItem;
  index: number;
  isActive: boolean;
  isRunning: boolean;
  isEditing: boolean;
  onStart: (index: number) => void;
  onToggle: () => void;
  onRemove: (id: string) => void;
  onEditTitle: (id: string, value: string) => void;
  onEditTime: (
    id: string,
    totalSeconds: number,
    type: 'min' | 'sec',
    value: number,
  ) => void;
  onSetEditing: (editing: boolean) => void;
};

export const AgendaItemCard: React.FC<AgendaItemCardProps> = ({
  item,
  index,
  isActive,
  isRunning,
  isEditing,
  onStart,
  onToggle,
  onRemove,
  onEditTitle,
  onEditTime,
  onSetEditing,
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 150ms ease',
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isActive && isRunning) return;
    onRemove(item.id);
  };

  const parseNonNegative = (value: string) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  };

  const blockNonNumericKeys = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const blocked = ['e', 'E', '+', '-', '.'];
    if (blocked.includes(event.key)) {
      event.preventDefault();
    }
  };

  const inputsDisabled = isActive && isRunning;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      data-testid="agenda-item"
      data-agenda-id={item.id}
      className={`transition-all duration-300 relative overflow-hidden border ${
        isActive
          ? 'bg-blue-950/40 border-blue-400/70 shadow-[0_0_16px_rgba(59,130,246,0.25)]'
          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
      } ${isDragging ? 'ring-1 ring-blue-400/60 opacity-90' : ''}`}
    >
      <button
        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 flex items-center justify-center"
        disabled={isActive && isRunning}
        data-testid="agenda-item-remove"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleRemove}
        aria-label="削除"
      >
        <X className="h-4 w-4" />
      </button>
      <CardContent className="p-4 pr-12 flex gap-3 items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-white cursor-grab active:cursor-grabbing"
            aria-label="ドラッグで並び替え"
            data-dnd-handle
            data-testid="agenda-item-handle"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-full transition-all active:scale-95 ${
              isActive
                ? isRunning
                  ? 'bg-orange-500/15 text-orange-300 hover:bg-orange-500/20'
                  : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                : 'bg-black/40 text-zinc-400 hover:text-emerald-300 hover:bg-emerald-500/10'
            }`}
            data-testid="agenda-item-toggle"
            onClick={(e) => {
              e.stopPropagation();
              if (isActive) {
                onToggle();
              } else {
                onStart(index);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {isActive && isRunning ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </Button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 pr-4">
            <Input
              className={`h-9 px-3 border border-transparent bg-black/30 text-sm font-semibold focus-visible:ring-1 focus-visible:ring-blue-500/40 placeholder:text-zinc-500 truncate ${
                isActive ? 'text-white' : 'text-zinc-200'
              }`}
              data-testid="agenda-item-title"
              value={item.title}
              disabled={inputsDisabled}
              onChange={(e) => {
                if (inputsDisabled) return;
                onEditTitle(item.id, e.target.value);
              }}
              placeholder="議題名..."
              onPointerDown={(e) => e.stopPropagation()}
              onFocus={() => onSetEditing(true)}
              onBlur={() => onSetEditing(false)}
            />
          </div>

          <div className="flex items-center gap-2 mt-2 pr-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-black/30 rounded-lg border border-zinc-800/70">
              <Clock className="h-4 w-4 text-zinc-500" />
              <Input
                type="number"
                min="0"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`spinless-number w-14 h-8 px-2 bg-zinc-950/60 border-zinc-800 text-center focus-visible:ring-1 focus-visible:ring-blue-500/40 font-mono text-sm ${
                  isActive ? 'text-blue-200' : 'text-zinc-300'
                }`}
                data-testid="agenda-item-minutes"
                value={Math.floor(item.durationSeconds / 60)}
                disabled={inputsDisabled}
                onKeyDown={blockNonNumericKeys}
                onChange={(e) =>
                  onEditTime(
                    item.id,
                    item.durationSeconds,
                    'min',
                    parseNonNegative(e.target.value),
                  )
                }
                onPointerDown={(e) => e.stopPropagation()}
                onFocus={() => onSetEditing(true)}
                onBlur={() => onSetEditing(false)}
              />
              <span className="text-[11px] font-medium text-zinc-500">分</span>
              <Input
                type="number"
                min="0"
                max="59"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`spinless-number w-14 h-8 px-2 bg-zinc-950/60 border-zinc-800 text-center focus-visible:ring-1 focus-visible:ring-blue-500/40 font-mono text-sm ${
                  isActive ? 'text-blue-200' : 'text-zinc-300'
                }`}
                data-testid="agenda-item-seconds"
                value={item.durationSeconds % 60}
                disabled={inputsDisabled}
                onKeyDown={blockNonNumericKeys}
                onChange={(e) =>
                  onEditTime(
                    item.id,
                    item.durationSeconds,
                    'sec',
                    parseNonNegative(e.target.value),
                  )
                }
                onPointerDown={(e) => e.stopPropagation()}
                onFocus={() => onSetEditing(true)}
                onBlur={() => onSetEditing(false)}
              />
              <span className="text-[11px] font-medium text-zinc-500">秒</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
