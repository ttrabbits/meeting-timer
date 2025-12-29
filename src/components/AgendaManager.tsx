import React, { useState } from 'react';
import type { AgendaItem } from '@/types/timer';
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Trash2, ChevronUp, ChevronDown, CheckCircle2, Circle, Plus, Clock, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { formatWallTime } from '@/utils/timeFormat';

interface AgendaManagerProps {
    agenda: AgendaItem[];
    currentIndex: number;
    onUpdate: (newAgenda: AgendaItem[]) => void;
    onGoTo: (index: number) => void;
    onStart: (index: number) => void;
    onToggle: () => void;
    onReorder: (index: number, direction: 'up' | 'down') => void;
    isRunning?: boolean;
    remainingSeconds?: number;
    isSoundEnabled: boolean;
    onSoundToggle: (enabled: boolean) => void;
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
}) => {
    const [newTitle, setNewTitle] = useState('');
    const [newMinutes, setNewMinutes] = useState(5);
    const [newSeconds, setNewSeconds] = useState(0);

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
            const start = item.startTime ? new Date(item.startTime) : new Date();
            const end = new Date(start.getTime() + (item.startTime ? item.durationSeconds * 1000 : remainingSeconds * 1000));

            // まだ開始していない（isRunning false かつ startTime なし）場合は次項と同じ予測に倒す
            if (!isRunning && !item.startTime) return null;

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
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-2xl font-bold tracking-tight">予定リスト</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {agenda.map((item, index) => {
                    const isActive = index === currentIndex;
                    const timeRange = getEstimatedTimeRange(index);

                    return (
                        <Card
                            key={item.id}
                            className={`transition-all duration-300 relative overflow-hidden border-2 ${isActive
                                ? 'bg-zinc-700 border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.1)]'
                                : 'bg-zinc-800/70 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                                }`}
                        >
                            <CardContent className="p-3 flex gap-3 items-center">
                                {/* Left Status Controls */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 rounded-full transition-all active:scale-95 ${isActive
                                            ? isRunning
                                                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                                                : 'bg-emerald-500 text-white hover:bg-emerald-400'
                                            : 'bg-zinc-900/50 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                            }`}
                                        onClick={() => isActive ? onToggle() : onStart(index)}
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
                                        className={`h-7 w-7 rounded-full transition-colors ${isActive ? 'text-blue-300' : 'text-zinc-500 hover:text-zinc-400'
                                            }`}
                                        onClick={() => onGoTo(index)}
                                    >
                                        {isActive ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Circle className="h-4.5 w-4.5" />}
                                    </Button>
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            className={`h-7 p-0 border-none bg-transparent text-sm font-bold focus-visible:ring-0 placeholder:text-zinc-500 truncate ${isActive ? 'text-white' : 'text-zinc-200'
                                                }`}
                                            value={item.title}
                                            onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                            placeholder="議題名..."
                                        />
                                        {timeRange && (
                                            <div className={`flex items-center gap-1 text-[10px] font-semibold whitespace-nowrap ${isActive ? 'text-blue-300' : 'text-zinc-400'
                                                }`}>
                                                <Clock className="h-3 w-3" />
                                                <span>{timeRange}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/30 rounded-md border border-zinc-800/50">
                                            <Input
                                                type="number"
                                                className={`w-9 h-6 p-0 border-none bg-transparent text-center focus-visible:ring-0 font-mono text-sm ${isActive ? 'text-blue-400' : 'text-zinc-500'}`}
                                                value={Math.floor(item.durationSeconds / 60)}
                                                onChange={(e) => handleEditTime(item.id, item.durationSeconds, 'min', parseInt(e.target.value) || 0)}
                                            />
                                            <span className="text-[11px] font-medium text-zinc-600">分</span>
                                            <Input
                                                type="number"
                                                className={`w-9 h-6 p-0 border-none bg-transparent text-center focus-visible:ring-0 font-mono text-sm ${isActive ? 'text-blue-400' : 'text-zinc-500'}`}
                                                max="59"
                                                value={item.durationSeconds % 60}
                                                onChange={(e) => handleEditTime(item.id, item.durationSeconds, 'sec', parseInt(e.target.value) || 0)}
                                            />
                                            <span className="text-[11px] font-medium text-zinc-600">秒</span>
                                        </div>

                                        <div className="flex gap-0.5 ml-auto">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-zinc-700 hover:text-zinc-400 disabled:opacity-0"
                                                onClick={() => onReorder(index, 'up')}
                                                disabled={index === 0}
                                            >
                                                <ChevronUp className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-zinc-700 hover:text-zinc-400 disabled:opacity-0"
                                                onClick={() => onReorder(index, 'down')}
                                                disabled={index === agenda.length - 1}
                                            >
                                                <ChevronDown className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Bottom Fixed Area (Add Form + Settings) */}
            <div className="p-4 bg-zinc-950/80 backdrop-blur-md border-t border-white/5 space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                {/* Add New - Fixed at bottom */}
                <Card className="bg-blue-500/5 border-blue-500/20 border-dashed">
                    <CardContent className="p-3">
                        <form onSubmit={addItem} className="space-y-3">
                            <Label className="text-[9px] font-bold text-blue-500/70 uppercase tracking-widest ml-1">議題を追加</Label>
                            <div className="space-y-2">
                                <Input
                                    placeholder="議題のタイトルを入力して追加..."
                                    className="h-8 text-sm bg-black/50 border-zinc-800 focus-visible:ring-blue-500/50"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-1.5 border border-zinc-800">
                                        <input
                                            type="number"
                                            className="w-10 bg-transparent text-center outline-none text-sm font-mono"
                                            value={newMinutes}
                                            onChange={(e) => setNewMinutes(parseInt(e.target.value) || 0)}
                                        />
                                        <span className="text-[11px] font-bold text-zinc-600">分</span>
                                        <input
                                            type="number"
                                            className="w-10 bg-transparent text-center outline-none text-sm font-mono"
                                            max="59"
                                            value={newSeconds}
                                            onChange={(e) => setNewSeconds(parseInt(e.target.value) || 0)}
                                        />
                                        <span className="text-[11px] font-bold text-zinc-600">秒</span>
                                    </div>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="flex-1 h-7 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded shadow-lg shadow-blue-500/20"
                                        disabled={!newTitle}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> 追加
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isSoundEnabled ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
                            {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        </div>
                        <div>
                            <p className="text-[11px] font-bold">終了時の音</p>
                            <p className="text-[9px] text-zinc-500">
                                {isSoundEnabled ? 'チャイムあり' : '消音'}
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={isSoundEnabled}
                        onCheckedChange={onSoundToggle}
                    />
                </div>
            </div>
        </div>
    );
};
