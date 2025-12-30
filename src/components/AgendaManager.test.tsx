import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import type { AgendaItem } from '@/types/timer';
import { AgendaManager } from './AgendaManager';

const mockUUID = vi.fn();
const originalCrypto = global.crypto;

beforeAll(() => {
  vi.spyOn(global, 'crypto', 'get').mockReturnValue({
    ...originalCrypto,
    randomUUID: mockUUID,
  } as Crypto);
});

afterEach(() => {
  mockUUID.mockReset();
});

afterAll(() => {
  vi.spyOn(global, 'crypto', 'get').mockReturnValue(originalCrypto);
});

describe('AgendaManager の追加処理', () => {
  const initialAgenda: AgendaItem[] = [
    { id: '1', title: 'A', durationSeconds: 300 },
  ];

  const renderManager = (overrides: Partial<React.ComponentProps<typeof AgendaManager>> = {}) => {
    const props: React.ComponentProps<typeof AgendaManager> = {
      agenda: initialAgenda,
      currentIndex: 0,
      onUpdate: vi.fn(),
      onStart: vi.fn(),
      onToggle: vi.fn(),
      onReorder: vi.fn(),
      isRunning: false,
      isSoundEnabled: true,
      onSoundToggle: vi.fn(),
      overtimeReminderMinutes: null,
      onOvertimeReminderChange: vi.fn(),
      ...overrides,
    };
    render(<AgendaManager {...props} />);
    return props;
  };

  it('フォームから追加すると末尾に新しい議題が追加される', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    mockUUID.mockReturnValue('new-id');

    renderManager({ onUpdate });

    await user.type(screen.getByTestId('agenda-add-title'), 'New Topic');
    fireEvent.change(screen.getByTestId('agenda-add-minutes'), { target: { value: '6' } });
    fireEvent.change(screen.getByTestId('agenda-add-seconds'), { target: { value: '30' } });

    await user.click(screen.getByTestId('agenda-add-submit'));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updated = onUpdate.mock.calls[0][0] as AgendaItem[];
    expect(updated).toHaveLength(2);
    expect(updated[1]).toEqual({
      id: 'new-id',
      title: 'New Topic',
      durationSeconds: 390,
    });
  });
});
