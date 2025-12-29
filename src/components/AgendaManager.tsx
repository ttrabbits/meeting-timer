import React, { useState } from 'react';
import type { AgendaItem } from '../types/timer';

interface AgendaManagerProps {
    agenda: AgendaItem[];
    currentIndex: number;
    onUpdate: (newAgenda: AgendaItem[]) => void;
}

export const AgendaManager: React.FC<AgendaManagerProps> = ({
    agenda,
    currentIndex,
    onUpdate,
}) => {
    const [newTitle, setNewTitle] = useState('');
    const [newMinutes, setNewMinutes] = useState(5);

    const addItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle) return;
        const item: AgendaItem = {
            id: crypto.randomUUID(),
            title: newTitle,
            durationSeconds: newMinutes * 60,
        };
        onUpdate([...agenda, item]);
        setNewTitle('');
    };

    const removeItem = (id: string) => {
        onUpdate(agenda.filter(item => item.id !== id));
    };

    const updateItem = (id: string, updates: Partial<AgendaItem>) => {
        onUpdate(agenda.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    return (
        <div className="agenda-manager">
            <h3>予定リスト</h3>

            <div className="agenda-list-container">
                <ul className="agenda-list">
                    {agenda.map((item, index) => (
                        <li key={item.id} className={index === currentIndex ? 'active' : ''}>
                            <div className="item-edit-form">
                                <input
                                    type="text"
                                    className="edit-input-title"
                                    value={item.title}
                                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                    placeholder="議題名"
                                />
                                <input
                                    type="number"
                                    className="edit-input-minutes"
                                    value={Math.floor(item.durationSeconds / 60)}
                                    onChange={(e) => updateItem(item.id, { durationSeconds: (parseInt(e.target.value) || 0) * 60 })}
                                />
                                <span className="unit">分</span>
                                <button onClick={() => removeItem(item.id)} className="btn-remove" title="削除">×</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="add-item-section">
                <p className="section-label" style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                    marginLeft: '0.5rem',
                    fontWeight: '600'
                }}>新規予定を追加</p>
                <form onSubmit={addItem} className="agenda-form">
                    <div className="form-inputs">
                        <input
                            type="text"
                            placeholder="名前・タイトル"
                            className="add-input-title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <div className="add-duration-wrapper">
                            <input
                                type="number"
                                min="1"
                                value={newMinutes}
                                onChange={(e) => setNewMinutes(parseInt(e.target.value) || 0)}
                            />
                            <span className="unit">分</span>
                        </div>
                    </div>
                    <button type="submit" className="btn-add">リストに追加</button>
                </form>
            </div>
        </div>
    );
};
