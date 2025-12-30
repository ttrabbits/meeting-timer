import React from 'react';
import { Clock, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type AgendaAddFormProps = {
  title: string;
  minutes: number;
  seconds: number;
  onTitleChange: (value: string) => void;
  onMinutesChange: (value: number) => void;
  onSecondsChange: (value: number) => void;
  onSubmit: () => void;
};

export const AgendaAddForm: React.FC<AgendaAddFormProps> = ({
  title,
  minutes,
  seconds,
  onTitleChange,
  onMinutesChange,
  onSecondsChange,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900/70 to-zinc-950 border-zinc-800">
      <CardHeader className="pb-0 flex flex-row items-center justify-between space-y-0 px-3 pt-3">
        <CardTitle className="text-sm text-white">予定を追加</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 px-3 pb-3 space-y-2.5">
        <form
          onSubmit={handleSubmit}
          className="space-y-2.5"
          data-testid="agenda-add-form"
        >
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-black/30 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <FileText className="h-4 w-4" />
            </div>
            <Input
              placeholder="予定のタイトルを入力..."
              className="h-9 text-sm bg-zinc-950/60 border border-zinc-800 focus-visible:ring-1 focus-visible:ring-blue-500/50"
              data-testid="agenda-add-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 text-[11px] text-zinc-500">
              <div className="h-7 w-7 rounded-md bg-black/30 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Clock className="h-4 w-4" />
              </div>
              <Input
                type="number"
                min="0"
                className="spinless-number w-14 h-8 px-2 bg-zinc-950/60 border-zinc-800 text-center focus-visible:ring-1 focus-visible:ring-blue-500/40 font-mono text-sm text-zinc-200"
                data-testid="agenda-add-minutes"
                value={minutes}
                onChange={(e) =>
                  onMinutesChange(parseInt(e.target.value, 10) || 0)
                }
                onPointerDown={(e) => e.stopPropagation()}
              />
              <span className="px-1">分</span>
              <Input
                type="number"
                min="0"
                max="59"
                className="spinless-number w-14 h-8 px-2 bg-zinc-950/60 border-zinc-800 text-center focus-visible:ring-1 focus-visible:ring-blue-500/40 font-mono text-sm text-zinc-200"
                data-testid="agenda-add-seconds"
                value={seconds}
                onChange={(e) =>
                  onSecondsChange(parseInt(e.target.value, 10) || 0)
                }
                onPointerDown={(e) => e.stopPropagation()}
              />
              <span className="px-1">秒</span>
            </div>
            <Button
              type="submit"
              size="sm"
              className="flex-1 h-9 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-blue-500/20"
              data-testid="agenda-add-submit"
              disabled={!title}
            >
              追加
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
