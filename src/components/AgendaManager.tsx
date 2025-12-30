import React, { useCallback, useState } from 'react';
import type { AgendaItem } from '@/types/timer';
import { Clock } from 'lucide-react';

import { AgendaAddForm } from '@/components/agenda/AgendaAddForm';
import { AgendaList } from '@/components/agenda/AgendaList';
import { AgendaSettings } from '@/components/agenda/AgendaSettings';

type AgendaManagerProps = {
  agenda: AgendaItem[];
  currentIndex: number;
  onUpdate: (newAgenda: AgendaItem[]) => void;
  onStart: (index: number) => void;
  onToggle: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  isRunning?: boolean;
  isSoundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  overtimeReminderMinutes: number | null;
  onOvertimeReminderChange: (minutes: number | null) => void;
};

export const AgendaManager: React.FC<AgendaManagerProps> = ({
  agenda,
  currentIndex,
  onUpdate,
  onStart,
  onToggle,
  onReorder,
  isRunning = false,
  isSoundEnabled,
  onSoundToggle,
  overtimeReminderMinutes,
  onOvertimeReminderChange,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newMinutes, setNewMinutes] = useState(5);
  const [newSeconds, setNewSeconds] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const addItem = useCallback(() => {
    if (!newTitle) return;
    const item: AgendaItem = {
      id: crypto.randomUUID(),
      title: newTitle,
      durationSeconds: newMinutes * 60 + newSeconds,
    };
    onUpdate([...agenda, item]);
    setNewTitle('');
    setNewMinutes(5);
    setNewSeconds(0);
  }, [agenda, newMinutes, newSeconds, newTitle, onUpdate]);

  const removeItem = useCallback(
    (id: string) => {
      const newAgenda = agenda.filter((item) => item.id !== id);
      if (newAgenda.length === 0) {
        onUpdate([
          {
            id: crypto.randomUUID(),
            title: '新しい予定',
            durationSeconds: 5 * 60,
          },
        ]);
      } else {
        onUpdate(newAgenda);
      }
    },
    [agenda, onUpdate],
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<AgendaItem>) => {
      onUpdate(
        agenda.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      );
    },
    [agenda, onUpdate],
  );

  const handleEditTime = useCallback(
    (id: string, totalSeconds: number, type: 'min' | 'sec', value: number) => {
      const currentMins = Math.floor(totalSeconds / 60);
      const currentSecs = totalSeconds % 60;

      const newTotal =
        type === 'min' ? value * 60 + currentSecs : currentMins * 60 + value;

      updateItem(id, { durationSeconds: Math.max(0, newTotal) });
    },
    [updateItem],
  );

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900/80 via-zinc-900/60 to-zinc-900/80 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Clock className="h-4.5 w-4.5 text-blue-200" />
            </div>
            <p className="text-sm font-semibold text-white leading-tight">
              予定リスト
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400/80 inline-block" />
            <span>{agenda.length}</span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-3 custom-scrollbar"
        data-testid="agenda-list"
      >
        <AgendaList
          agenda={agenda}
          currentIndex={currentIndex}
          isRunning={isRunning}
          isEditing={isEditing}
          onSetEditing={setIsEditing}
          onReorder={onReorder}
          onStart={onStart}
          onToggle={onToggle}
          onRemove={removeItem}
          onEditTitle={(id, value) => updateItem(id, { title: value })}
          onEditTime={handleEditTime}
        />
      </div>

      <div className="p-4 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 space-y-3 shadow-[0_-10px_20px_rgba(0,0,0,0.45)]">
        <AgendaAddForm
          title={newTitle}
          minutes={newMinutes}
          seconds={newSeconds}
          onTitleChange={setNewTitle}
          onMinutesChange={setNewMinutes}
          onSecondsChange={setNewSeconds}
          onSubmit={addItem}
        />

        <AgendaSettings
          isSoundEnabled={isSoundEnabled}
          onSoundToggle={onSoundToggle}
          overtimeReminderMinutes={overtimeReminderMinutes}
          onOvertimeReminderChange={onOvertimeReminderChange}
        />
      </div>
    </div>
  );
};
