import React from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { AgendaItem } from '@/types/timer';
import { AgendaItemCard } from './AgendaItemCard';

class InputSafePointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent }: { nativeEvent: PointerEvent }) => {
        const target = nativeEvent.target as HTMLElement | null;
        if (target?.closest('[data-dnd-handle]')) {
          return true;
        }
        if (target && target.closest('input, textarea, select, button')) {
          return false;
        }
        return true;
      },
    },
  ];
}

type AgendaListProps = {
  agenda: AgendaItem[];
  currentIndex: number;
  isRunning: boolean;
  isEditing: boolean;
  onSetEditing: (editing: boolean) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
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
};

export const AgendaList: React.FC<AgendaListProps> = ({
  agenda,
  currentIndex,
  isRunning,
  isEditing,
  onSetEditing,
  onReorder,
  onStart,
  onToggle,
  onRemove,
  onEditTitle,
  onEditTime,
}) => {
  const sensors = useSensors(
    useSensor(InputSafePointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = agenda.findIndex((item) => item.id === active.id);
    const toIndex = agenda.findIndex((item) => item.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    onReorder(fromIndex, toIndex);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={agenda.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {agenda.map((item, index) => (
          <AgendaItemCard
            key={item.id}
            item={item}
            index={index}
            isActive={index === currentIndex}
            isRunning={isRunning}
            isEditing={isEditing}
            onStart={onStart}
            onToggle={onToggle}
            onRemove={onRemove}
            onEditTitle={onEditTitle}
            onEditTime={onEditTime}
            onSetEditing={onSetEditing}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
};
