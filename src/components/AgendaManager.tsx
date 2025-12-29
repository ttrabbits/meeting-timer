import React, { useState } from 'react';
import type { AgendaItem } from '@/types/timer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Circle, Plus, Clock, Play, Pause, X, Volume2, VolumeX, AlarmClock } from 'lucide-react';
import { DndContext, closestCenter, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';
import { formatWallTime } from '@/utils/timeFormat';

interface AgendaManagerProps {
    agenda: AgendaItem[];
    currentIndex: number;
    onUpdate: (newAgenda: AgendaItem[]) => void;
    onGoTo: (index: number) => void;
    onStart: (index: number) => void;
    onToggle: () => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
    isRunning?: boolean;
    remainingSeconds?: number;
    isSoundEnabled: boolean;
    onSoundToggle: (enabled: boolean) => void;
    overtimeReminderMinutes: number | null;
    onOvertimeReminderChange: (minutes: number | null) => void;
}

export const AgendaManager: React.FC<AgendaManagerProps> = ({
    agenda,
    currentIndex,
    onUpdate,
    onGoTo,
    onStart,
    onToggle,
    onReorder,
    isRunning = false,
    remainingSeconds = 0,
    isSoundEnabled,
    onSoundToggle,
    overtimeReminderMinutes,
    onOvertimeReminderChange,
}) => {
    const [newTitle, setNewTitle] = useState('');
    const [newMinutes, setNewMinutes] = useState(5);
    const [newSeconds, setNewSeconds] = useState(0);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 4 }
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const fromIndex = agenda.findIndex((item) => item.id === active.id);
        const toIndex = agenda.findIndex((item) => item.id === over.id);
        if (fromIndex === -1 || toIndex === -1) return;
        onReorder(fromIndex, toIndex);
    };

    const SortableAgendaCard: React.FC<{
        item: AgendaItem;
        index: number;
        isActive: boolean;
        timeRange: string | null;
    }> = ({ item, index, isActive, timeRange }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
        const style = {
            transform: CSS.Transform.toString(transform),
            transition: transition ?? 'transform 150ms ease',
        };

        return (
            <Card
                ref={setNodeRef}
                style={style}
                className={`transition-all duration-300 relative overflow-hidden border ${isActive
                    ? 'bg-blue-950/40 border-blue-400/70 shadow-[0_0_16px_rgba(59,130,246,0.25)]'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
                    } ${isDragging ? 'ring-1 ring-blue-400/60 opacity-90' : ''}`}
                {...attributes}
                {...listeners}
            >
                <button
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 flex items-center justify-center"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                    }}
                    aria-label="削除"
                >
                    <X className="h-4 w-4" />
                </button>
                <CardContent className="p-4 flex gap-3 items-center">
                    {/* Left Status Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-9 w-9 rounded-full transition-all active:scale-95 ${isActive
                                ? isRunning
                                    ? 'bg-orange-500/15 text-orange-300 hover:bg-orange-500/20'
                                    : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                                : 'bg-black/40 text-zinc-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                                }`}
                            onClick={() => isActive ? onToggle() : onStart(index)}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {isActive && isRunning ? (
                                <Pause className="h-4 w-4 fill-current" />
                            ) : (
                                <Play className="h-4 w-4 fill-current ml-0.5" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-full transition-colors ${isActive ? 'text-blue-200' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            onClick={() => onGoTo(index)}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {isActive ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Circle className="h-4.5 w-4.5" />}
                        </Button>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 pr-10">
                            <Input
                                className={`h-9 px-3 border border-transparent bg-black/30 text-sm font-semibold focus-visible:ring-1 focus-visible:ring-blue-500/40 placeholder:text-zinc-500 truncate ${isActive ? 'text-white' : 'text-zinc-200'
                                    }`}
                                value={item.title}
                                onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                placeholder="議題名..."
                                onPointerDown={(e) => e.stopPropagation()}
                            />
                            <div className={`flex items-center gap-1 text-[10px] font-semibold whitespace-nowrap min-w-[120px] justify-end ${timeRange ? (isActive ? 'text-blue-200' : 'text-zinc-400') : 'text-zinc-600'
                                }`}>
                                <Clock className="h-3 w-3" />
                                <span>{timeRange || '--:--'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 pr-10">
                            <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-black/30 rounded-lg border border-zinc-800/70">
                                <Clock className="h-4 w-4 text-zinc-500" />
                                <Input
                                    type="number"
                                    min="0"
                                    className={`spinless-number w-14 h-8 px-2 bg-zinc-950/60 border-zinc-800 text-center focus-visible:ring-1 focus-visible:ring-blue-500/40 font-mono text-sm ${isActive ? 'text-blue-200' : 'text-zinc-300'}`}
                                    value={Math.floor(item.durationSeconds / 60)}
                                    onChange={(e) => handleEditTime(item.id, item.durationSeconds, 'min', parseInt(e.target.value) || 0)}
                                    onPointerDown={(e) => e.stopPropagation()}
                                />
                                <span className="text-[11px] font-medium text-zinc-500">分</span>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    className={`spinless-number w-14 h-8 px-2 bg-zinc-950/60 border-zinc-800 text-center focus-visible:ring-1 focus-visible:ring-blue-500/40 font-mono text-sm ${isActive ? 'text-blue-200' : 'text-zinc-300'}`}
                                    value={item.durationSeconds % 60}
                                    onChange={(e) => handleEditTime(item.id, item.durationSeconds, 'sec', parseInt(e.target.value) || 0)}
                                    onPointerDown={(e) => e.stopPropagation()}
                                />
                                <span className="text-[11px] font-medium text-zinc-500">秒</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const getEstimatedTimeRange = (index: number) => {
        const item = agenda[index];
        if (!item) return null;

        // 過去のアイテム：実績があれば表示
        if (index < currentIndex) {
            if (item.startTime && item.endTime) {
                return `${formatWallTime(new Date(item.startTime))} - ${formatWallTime(new Date(item.endTime))}`;
            }
            return null;
        }

        // 現在のアイテム：開始実績があればそれを使い、なければ現在時刻から予測
        if (index === currentIndex) {
            // まだ開始していない（isRunning false かつ startTime なし）場合は次項と同じ予測に倒す
            if (!isRunning && !item.startTime) return null;

            const start = item.startTime ? new Date(item.startTime) : new Date();
            // 一時停止で経過した時間も考慮して、残り秒数ベースで終了予想を算出
            const end = item.startTime
                ? new Date(Date.now() + remainingSeconds * 1000)
                : new Date(start.getTime() + remainingSeconds * 1000);

            return `${formatWallTime(start)} - ${formatWallTime(end)}`;
        }

        // 未来のアイテム：予測
        if (!isRunning) return null;

        let secondsUntilStart = remainingSeconds;
        for (let i = currentIndex + 1; i < index; i++) {
            secondsUntilStart += agenda[i].durationSeconds;
        }

        const startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() + secondsUntilStart);

        const endTime = new Date(startTime.getTime());
        endTime.setSeconds(endTime.getSeconds() + agenda[index].durationSeconds);

        return `${formatWallTime(startTime)} - ${formatWallTime(endTime)}`;
    };

    const addItem = (e: React.FormEvent) => {
        e.preventDefault();
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
    };

    const removeItem = (id: string) => {
        const newAgenda = agenda.filter(item => item.id !== id);
        if (newAgenda.length === 0) {
            onUpdate([{
                id: crypto.randomUUID(),
                title: '新しい予定',
                durationSeconds: 5 * 60,
            }]);
        } else {
            onUpdate(newAgenda);
        }
    };

    const updateItem = (id: string, updates: Partial<AgendaItem>) => {
        onUpdate(agenda.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const handleEditTime = (id: string, totalSeconds: number, type: 'min' | 'sec', value: number) => {
        const currentMins = Math.floor(totalSeconds / 60);
        const currentSecs = totalSeconds % 60;

        let newTotal: number;
        if (type === 'min') {
            newTotal = value * 60 + currentSecs;
        } else {
            newTotal = currentMins * 60 + value;
        }

        updateItem(id, { durationSeconds: Math.max(0, newTotal) });
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900/80 via-zinc-900/60 to-zinc-900/80 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                            <Clock className="h-4.5 w-4.5 text-blue-200" />
                        </div>
                        <p className="text-sm font-semibold text-white leading-tight">予定リスト</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400/80 inline-block" />
                        <span>{agenda.length}</span>
                    </div>
                </div>
            </div>


            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-3 custom-scrollbar">
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                    modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
                >
                    <SortableContext items={agenda.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                        {agenda.map((item, index) => {
                            const isActive = index === currentIndex;
                            const timeRange = getEstimatedTimeRange(index);

                            return (
                                <SortableAgendaCard
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    isActive={isActive}
                                    timeRange={timeRange}
                                />
                            );
                        })}
                    </SortableContext>
                </DndContext>
            </div>
            {/* Bottom Fixed Area (Add Form + Settings) */}
            <div className="p-4 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 space-y-3 shadow-[0_-10px_20px_rgba(0,0,0,0.45)]">
                {/* Add New */}
                <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-zinc-950 border-zinc-800">
                    <CardHeader className="pb-0 flex flex-row items-center justify-between space-y-0 px-4 pt-4">
                        <CardTitle className="text-sm text-white">議題を追加</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 px-4 pb-4 space-y-3">
                        <form onSubmit={addItem} className="space-y-3">
                            <Input
                                placeholder="議題のタイトルを入力..."
                                className="h-10 text-sm bg-black/40 border-zinc-800 focus-visible:ring-blue-500/50"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onPointerDown={(e) => e.stopPropagation()}
                            />
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center gap-2 px-3 py-2 bg-black/40 rounded-lg border border-zinc-800">
                                    <Clock className="h-4 w-4 text-blue-300" />
                                    <Input
                                        type="number"
                                        min="0"
                                        className="spinless-number w-14 h-9 px-2 bg-zinc-950/60 border-zinc-800 text-center focus-visible:ring-1 focus-visible:ring-blue-500/40 font-mono text-sm text-zinc-200"
                                        value={newMinutes}
                                        onChange={(e) => setNewMinutes(parseInt(e.target.value) || 0)}
                                        onPointerDown={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-[11px] font-medium text-zinc-500">分</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="59"
                                        className="spinless-number w-14 h-9 px-2 bg-zinc-950/60 border-zinc-800 text-center focus-visible:ring-1 focus-visible:ring-blue-500/40 font-mono text-sm text-zinc-200"
                                        value={newSeconds}
                                    onChange={(e) => setNewSeconds(parseInt(e.target.value) || 0)}
                                        onPointerDown={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-[11px] font-medium text-zinc-500">秒</span>
                                </div>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="flex-1 h-10 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-blue-500/20"
                                    disabled={!newTitle}
                                >
                                    追加
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Settings */}
                <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-zinc-950 border-zinc-800">
                    <CardHeader className="pb-1 px-4 pt-4">
                        <CardTitle className="text-sm text-white">サウンド設定</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 pb-4 px-4 space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/30 px-3 py-2.5">
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${isSoundEnabled ? 'bg-blue-500/15 text-blue-300' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                </div>
                                <p className="text-[11px] font-semibold text-white">終了時に音を鳴らす</p>
                            </div>
                            <div className="flex items-center gap-2 self-center min-h-[36px]">
                                <Switch
                                    checked={isSoundEnabled}
                                    onCheckedChange={onSoundToggle}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/30 px-3 py-2.5">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-300">
                                    <AlarmClock className="h-4 w-4" />
                                </div>
                                <p className="text-[11px] font-semibold text-white">オーバー後に音を鳴らす</p>
                            </div>
                            <div className="flex items-center gap-2 self-center min-h-[36px]">
                                <Input
                                    type="number"
                                    min="0"
                                    className="spinless-number w-16 h-9 bg-zinc-950/60 border-zinc-800 text-sm text-center"
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
            </div>
        </div>
    );
};
