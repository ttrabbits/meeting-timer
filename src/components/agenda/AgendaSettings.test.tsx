import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { AgendaSettings } from './AgendaSettings';

const setup = (
  overrides: Partial<React.ComponentProps<typeof AgendaSettings>> = {},
) => {
  const props: React.ComponentProps<typeof AgendaSettings> = {
    isSoundEnabled: true,
    onSoundToggle: vi.fn(),
    overtimeReminderMinutes: null,
    onOvertimeReminderChange: vi.fn(),
    ...overrides,
  };
  render(<AgendaSettings {...props} />);
  return props;
};

describe('AgendaSettings', () => {
  it('サウンドトグルで onSoundToggle が呼ばれる', async () => {
    const user = userEvent.setup();
    const props = setup({ isSoundEnabled: true });

    await user.click(screen.getByTestId('sound-toggle'));
    expect(props.onSoundToggle).toHaveBeenCalledWith(false);
  });

  it('オーバータイム入力の値に応じて onOvertimeReminderChange が呼ばれる', () => {
    const props = setup({ overtimeReminderMinutes: null });

    fireEvent.change(screen.getByTestId('overtime-input'), {
      target: { value: '3' },
    });
    expect(props.onOvertimeReminderChange).toHaveBeenLastCalledWith(3);

    fireEvent.change(screen.getByTestId('overtime-input'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByTestId('overtime-input'), {
      target: { value: '-1' },
    });
    expect(props.onOvertimeReminderChange).toHaveBeenLastCalledWith(null);
  });
});
