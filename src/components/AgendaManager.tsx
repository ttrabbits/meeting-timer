import React, { useState } from 'react';
import type { AgendaItem } from '../types/timer';

interface AgendaManagerProps {
    agenda: AgendaItem[];
    currentIndex: number;
    onUpdate: (newAgenda: AgendaItem[]) => void;
    onGoTo: (index: number) => void;
    onReorder: (index: number, direction: 'up' | 'down') => void;
}

export const AgendaManager: React.FC<AgendaManagerProps> = ({
    agenda,
    currentIndex,
    onUpdate,
    onGoTo,
    onReorder,
}) => {
    const [newTitle, setNewTitle] = useState('');
    const [newMinutes, setNewMinutes] = useState(5);
    const [newSeconds, setNewSeconds] = useState(0);

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
        onUpdate(agenda.filter(item => item.id !== id));
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
        <div className="agenda-manager">
            <h3>予定リスト</h3>

            <div className="agenda-list-container">
                <div className="agenda-card-list">
                    {agenda.map((item, index) => (
                        <div key={item.id} className={`agenda-card ${index === currentIndex ? 'active' : ''}`}>
                            <div className="card-actions-left">
                                <button
                                    onClick={() => onGoTo(index)}
                                    className={`btn-focus ${index === currentIndex ? 'active' : ''}`}
                                    title="フォーカス"
                                >
                                    ●
                                </button>
                                <div className="card-reorder">
                                    <button onClick={() => onReorder(index, 'up')} disabled={index === 0}>↑</button>
                                    <button onClick={() => onReorder(index, 'down')} disabled={index === agenda.length - 1}>↓</button>
                                </div>
                            </div>

                            <div className="card-content">
                                <div className="content-row name-row">
                                    <input
                                        type="text"
                                        className="card-input-title"
                                        value={item.title}
                                        onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                        placeholder="議題名"
                                    />
                                </div>
                                <div className="content-row time-row">
                                    <div className="time-input-group">
                                        <input
                                            type="number"
                                            className="card-input-time"
                                            value={Math.floor(item.durationSeconds / 60)}
                                            onChange={(e) => handleEditTime(item.id, item.durationSeconds, 'min', parseInt(e.target.value) || 0)}
                                        />
                                        <span className="card-unit">分</span>
                                        <input
                                            type="number"
                                            className="card-input-time"
                                            max="59"
                                            value={item.durationSeconds % 60}
                                            onChange={(e) => handleEditTime(item.id, item.durationSeconds, 'sec', parseInt(e.target.value) || 0)}
                                        />
                                        <span className="card-unit">秒</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions-right">
                                <button onClick={() => removeItem(item.id)} className="btn-card-remove">×</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="add-item-card-section">
                <form onSubmit={addItem} className="add-card-form">
                    <input
                        type="text"
                        placeholder="新規課題を追加..."
                        className="add-card-input-title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <div className="add-card-bottom-row">
                        <div className="time-input-group">
                            <input
                                type="number"
                                min="0"
                                value={newMinutes}
                                onChange={(e) => setNewMinutes(parseInt(e.target.value) || 0)}
                            />
                            <span className="card-unit">分</span>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={newSeconds}
                                onChange={(e) => setNewSeconds(parseInt(e.target.value) || 0)}
                            />
                            <span className="card-unit">秒</span>
                        </div>
                        <button type="submit" className="btn-add-card">追加</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
