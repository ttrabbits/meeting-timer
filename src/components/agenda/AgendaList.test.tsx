import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { AgendaList } from './AgendaList';

let capturedOnDragEnd: ((event: any) => void) | null = null;

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: any) => {
    capturedOnDragEnd = onDragEnd;
    return <div data-testid="dnd-context">{children}</div>;
  },
  closestCenter: vi.fn(),
  useSensor: vi.fn((sensor) => sensor),
  useSensors: vi.fn((...args) => args),
  PointerSensor: class {},
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => (
    <div data-testid="sortable">{children}</div>
  ),
  verticalListSortingStrategy: vi.fn(),
  useSortable: () => ({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const baseAgenda = [
  { id: 'a', title: 'A', durationSeconds: 60 },
  { id: 'b', title: 'B', durationSeconds: 60 },
  { id: 'c', title: 'C', durationSeconds: 60 },
];

const renderList = (
  props: Partial<React.ComponentProps<typeof AgendaList>> = {},
) => {
  const defaultProps: React.ComponentProps<typeof AgendaList> = {
    agenda: baseAgenda,
    currentIndex: 0,
    isRunning: false,
    isEditing: false,
    onSetEditing: vi.fn(),
    onReorder: vi.fn(),
    onStart: vi.fn(),
    onToggle: vi.fn(),
    onRemove: vi.fn(),
    onEditTitle: vi.fn(),
    onEditTime: vi.fn(),
  };
  const merged = { ...defaultProps, ...props };
  render(<AgendaList {...merged} />);
  return merged;
};

describe('AgendaList のドラッグ＆ドロップ', () => {
  beforeEach(() => {
    capturedOnDragEnd = null;
  });

  it('別のアイテムにドロップしたとき onReorder が呼ばれる', () => {
    const { onReorder } = renderList();
    capturedOnDragEnd?.({
      active: { id: 'b' },
      over: { id: 'c' },
    });
    expect(onReorder).toHaveBeenCalledWith(1, 2);
  });

  it('over がない、または同一アイテムなら呼ばれない', () => {
    const { onReorder } = renderList();
    capturedOnDragEnd?.({
      active: { id: 'a' },
      over: null,
    });
    capturedOnDragEnd?.({
      active: { id: 'a' },
      over: { id: 'a' },
    });
    expect(onReorder).not.toHaveBeenCalled();
  });
});
