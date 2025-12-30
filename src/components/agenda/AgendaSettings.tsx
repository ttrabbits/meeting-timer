import React from 'react';
import { AlarmClock, Volume2, VolumeX } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

type AgendaSettingsProps = {
  isSoundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  overtimeReminderMinutes: number | null;
  onOvertimeReminderChange: (minutes: number | null) => void;
};

export const AgendaSettings: React.FC<AgendaSettingsProps> = ({
  isSoundEnabled,
  onSoundToggle,
  overtimeReminderMinutes,
  onOvertimeReminderChange,
}) => {
  return (
    <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-zinc-950 border-zinc-800">
      <CardHeader className="pb-1 px-4 pt-4">
        <CardTitle className="text-sm text-white">サウンド設定</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-4 px-4 space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/30 px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div
              className={`p-1.5 rounded-lg ${isSoundEnabled ? 'bg-blue-500/15 text-blue-300' : 'bg-zinc-800 text-zinc-500'}`}
            >
              {isSoundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </div>
            <p className="text-[11px] font-semibold text-white">
              終了時に音を鳴らす
            </p>
          </div>
          <div className="flex items-center gap-2 self-center min-h-[36px]">
            <Switch
              checked={isSoundEnabled}
              onCheckedChange={onSoundToggle}
              data-testid="sound-toggle"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/30 px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-300">
              <AlarmClock className="h-4 w-4" />
            </div>
            <p className="text-[11px] font-semibold text-white">
              オーバー後に音を鳴らす
            </p>
          </div>
          <div className="flex items-center gap-2 self-center min-h-[36px]">
            <Input
              type="number"
              min="0"
              className="spinless-number w-16 h-9 bg-zinc-950/60 border-zinc-800 text-sm text-center"
              data-testid="overtime-input"
              value={overtimeReminderMinutes ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                const parsed = parseInt(value, 10);
                if (value === '' || Number.isNaN(parsed) || parsed <= 0) {
                  onOvertimeReminderChange(null);
                } else {
                  onOvertimeReminderChange(parsed);
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <span className="text-[11px] text-zinc-400 leading-none">分後</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
