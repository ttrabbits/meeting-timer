import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { AgendaItemCard } from './AgendaItemCard';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const baseItem = {
  id: '1',
  title: 'A',
  durationSeconds: 90,
};

const renderCard = (
  props: Partial<React.ComponentProps<typeof AgendaItemCard>> = {},
) => {
  const defaultProps: React.ComponentProps<typeof AgendaItemCard> = {
    item: baseItem,
    index: 0,
    isActive: false,
    isRunning: false,
    isEditing: false,
    onStart: vi.fn(),
    onToggle: vi.fn(),
    onRemove: vi.fn(),
    onEditTitle: vi.fn(),
    onEditTime: vi.fn(),
    onSetEditing: vi.fn(),
  };
  const merged = { ...defaultProps, ...props };
  const view = render(<AgendaItemCard {...merged} />);
  return { ...merged, view };
};

describe('AgendaItemCard', () => {
  it('再生ボタンを押すと開始コールバックが呼ばれる', async () => {
    const user = userEvent.setup();
    const { onStart } = renderCard({ isActive: false, isRunning: false });

    await user.click(screen.getByTestId('agenda-item-toggle'));

    expect(onStart).toHaveBeenCalledWith(0);
  });

  it('再生中に一時停止ボタンを押すと停止コールバックが呼ばれる', async () => {
    const user = userEvent.setup();
    const { onToggle } = renderCard({ isActive: true, isRunning: true });

    await user.click(screen.getByTestId('agenda-item-toggle'));

    expect(onToggle).toHaveBeenCalled();
  });

  it('分・秒の入力で負号や非数キーは入力できない', async () => {
    const user = userEvent.setup();
    const onEditTime = vi.fn();
    renderCard({ onEditTime });

    const minutes = screen.getByTestId('agenda-item-minutes');
    await user.type(minutes, '-');
    expect(onEditTime).not.toHaveBeenCalled();

    await user.type(minutes, '5');
    expect(onEditTime).toHaveBeenLastCalledWith('1', 90, 'min', 15);

    const seconds = screen.getByTestId('agenda-item-seconds');
    await user.type(seconds, 'e');
    expect(onEditTime).toHaveBeenLastCalledWith('1', 90, 'min', 15);

    await user.type(seconds, '9');
    expect(onEditTime).toHaveBeenLastCalledWith('1', 90, 'sec', 309);
  });

  it('アクティブかつ再生中は入力を変更できずコールバックも走らない', async () => {
    const user = userEvent.setup();
    const onEditTime = vi.fn();
    const onEditTitle = vi.fn();
    renderCard({ isActive: true, isRunning: true, onEditTime, onEditTitle });

    const title = screen.getByTestId('agenda-item-title');
    expect(title).toBeDisabled();
    await user.type(title, 'X');
    expect(onEditTitle).not.toHaveBeenCalled();

    const minutes = screen.getByTestId('agenda-item-minutes');
    expect(minutes).toBeDisabled();
    await user.type(minutes, '9');
    expect(onEditTime).not.toHaveBeenCalled();
  });

  it('アクティブでも停止中なら入力変更がタイマー側に反映される', async () => {
    const onEditTime = vi.fn();
    renderCard({ isActive: true, isRunning: false, onEditTime });

    const minutes = screen.getByTestId('agenda-item-minutes');
    fireEvent.change(minutes, { target: { value: '8' } });

    expect(onEditTime).toHaveBeenLastCalledWith('1', 90, 'min', 8);

    const seconds = screen.getByTestId('agenda-item-seconds');
    fireEvent.change(seconds, { target: { value: '5' } });
    expect(onEditTime).toHaveBeenLastCalledWith('1', 90, 'sec', 5);
  });

  it('✗ボタンで削除コールバックが呼ばれる', () => {
    const onRemove = vi.fn();
    renderCard({ onRemove });

    fireEvent.click(screen.getByTestId('agenda-item-remove'));

    expect(onRemove).toHaveBeenCalledWith('1');
  });

  it('再生中の要素は削除できない', () => {
    const onRemove = vi.fn();
    renderCard({ onRemove, isActive: true, isRunning: true });

    fireEvent.click(screen.getByTestId('agenda-item-remove'));

    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.getByTestId('agenda-item-remove')).toBeDisabled();
  });

  it('タイトル入力の変更が反映され、フォーカスも維持される', async () => {
    const user = userEvent.setup();
    const onEditTitle = vi.fn();
    renderCard({ onEditTitle });

    const titleInput = screen.getByTestId('agenda-item-title');
    titleInput.focus();
    await user.type(titleInput, 'Hello');

    expect(onEditTitle).toHaveBeenCalled();
    expect(document.activeElement).toBe(titleInput);
  });
});
