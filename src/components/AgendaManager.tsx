import React, { useState } from 'react';
import type { AgendaItem } from '@/types/timer';
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Trash2, ChevronUp, ChevronDown, CheckCircle2, Circle, Plus, Clock, Play, Pause } from 'lucide-react';
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
}) => {
    const [newTitle, setNewTitle] = useState('');
    const [newMinutes, setNewMinutes] = useState(5);
    const [newSeconds, setNewSeconds] = useState(0);

    const getEstimatedTimeRange = (index: number) => {
        if (!isRunning) return null;
        if (index < currentIndex) return null;

        let secondsUntilStart = 0;
        if (index > currentIndex) {
            secondsUntilStart = remainingSeconds;
            for (let i = currentIndex + 1; i < index; i++) {
                secondsUntilStart += agenda[i].durationSeconds;
            }
        }

        const startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() + secondsUntilStart);

        const endTime = new Date(startTime.getTime());
        if (index === currentIndex) {
            endTime.setSeconds(endTime.getSeconds() + remainingSeconds);
        } else {
            endTime.setSeconds(endTime.getSeconds() + agenda[index].durationSeconds);
        }

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
        <div className="flex flex-col h-full p-6 gap-6">
            <h3 className="text-2xl font-bold tracking-tight">予定リスト</h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {agenda.map((item, index) => {
                    const isActive = index === currentIndex;
                    const timeRange = getEstimatedTimeRange(index);

                    return (
                        <Card
                            key={item.id}
                            className={`transition-colors duration-200 relative overflow-hidden border-2 ${isActive
                                ? 'bg-zinc-800 border-blue-500 shadow-sm'
                                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                                }`}
                        >
                            <CardContent className="p-4 flex gap-4 items-start">
                                {/* Left Controls */}
                                <div className="flex flex-col gap-3 pt-1 items-center">
                                    {/* Play/Sync Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 rounded-full transition-all active:scale-95 ${isActive
                                            ? isRunning
                                                ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'
                                                : 'bg-emerald-500 text-white hover:bg-emerald-400'
                                            : 'bg-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                            }`}
                                        onClick={() => isActive ? onToggle() : onStart(index)}
                                    >
                                        {isActive && isRunning ? (
                                            <Pause className="h-4 w-4 fill-current" />
                                        ) : (
                                            <Play className="h-4 w-4 fill-current ml-0.5" />
                                        )}
                                    </Button>

                                    {/* Select Only Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 rounded-full transition-colors ${isActive ? 'text-blue-500' : 'text-zinc-600 hover:text-zinc-400'
                                            }`}
                                        onClick={() => onGoTo(index)}
                                    >
                                        {isActive ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                    </Button>

                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 text-zinc-600 hover:text-zinc-400 disabled:opacity-0"
                                            onClick={() => onReorder(index, 'up')}
                                            disabled={index === 0}
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 text-zinc-600 hover:text-zinc-400 disabled:opacity-0"
                                            onClick={() => onReorder(index, 'down')}
                                            disabled={index === agenda.length - 1}
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Form Content */}
                                <div className="flex-1 space-y-4">
                                    <Input
                                        className={`h-auto p-0 border-none bg-transparent text-lg font-bold focus-visible:ring-0 placeholder:text-zinc-600 ${isActive ? 'text-white' : 'text-zinc-300'
                                            }`}
                                        value={item.title}
                                        onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                        placeholder="議題名を入力..."
                                    />

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 bg-black/40 rounded-md px-2.5 py-1.5 border border-zinc-800">
                                            <Input
                                                type="number"
                                                className={`w-10 h-6 p-0 border-none bg-transparent text-center focus-visible:ring-0 font-mono text-sm ${isActive ? 'text-blue-400' : 'text-zinc-400'
                                                    }`}
                                                value={Math.floor(item.durationSeconds / 60)}
                                                onChange={(e) => handleEditTime(item.id, item.durationSeconds, 'min', parseInt(e.target.value) || 0)}
                                            />
                                            <span className="text-[11px] font-medium text-zinc-500">分</span>
                                            <Input
                                                type="number"
                                                className={`w-10 h-6 p-0 border-none bg-transparent text-center focus-visible:ring-0 font-mono text-sm ${isActive ? 'text-blue-400' : 'text-zinc-400'
                                                    }`}
                                                max="59"
                                                value={item.durationSeconds % 60}
                                                onChange={(e) => handleEditTime(item.id, item.durationSeconds, 'sec', parseInt(e.target.value) || 0)}
                                            />
                                            <span className="text-[11px] font-medium text-zinc-500">秒</span>
                                        </div>

                                        {timeRange && (
                                            <div className={`flex items-center gap-1.5 text-[11px] font-semibold tracking-tight ${isActive ? 'text-blue-500' : 'text-zinc-500'
                                                }`}>
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{timeRange}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Remove */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Add New */}
            <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="p-4 space-y-4">
                    <Label className="text-xs font-bold text-blue-500/70 uppercase tracking-wider ml-1">新規予定の追加</Label>
                    <div className="space-y-3">
                        <Input
                            placeholder="議題のタイトルを入力..."
                            className="bg-black/50 border-zinc-800 focus-visible:ring-blue-500/50"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-1.5 border border-zinc-800">
                                <input
                                    type="number"
                                    className="w-8 bg-transparent text-center outline-none"
                                    value={newMinutes}
                                    onChange={(e) => setNewMinutes(parseInt(e.target.value) || 0)}
                                />
                                <span className="text-[10px] font-bold text-zinc-600">分</span>
                                <input
                                    type="number"
                                    className="w-8 bg-transparent text-center outline-none"
                                    max="59"
                                    value={newSeconds}
                                    onChange={(e) => setNewSeconds(parseInt(e.target.value) || 0)}
                                />
                                <span className="text-[10px] font-bold text-zinc-600">秒</span>
                            </div>
                            <Button
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20"
                                onClick={addItem}
                                disabled={!newTitle}
                            >
                                <Plus className="h-4 w-4 mr-2" /> 追加
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
