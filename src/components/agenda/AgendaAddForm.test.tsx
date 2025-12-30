import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { AgendaAddForm } from './AgendaAddForm';

const setup = (overrides: Partial<React.ComponentProps<typeof AgendaAddForm>> = {}) => {
  const props: React.ComponentProps<typeof AgendaAddForm> = {
    title: '',
    minutes: 5,
    seconds: 0,
    onTitleChange: vi.fn(),
    onMinutesChange: vi.fn(),
    onSecondsChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  render(<AgendaAddForm {...props} />);
  return props;
};

describe('AgendaAddForm', () => {
  it('タイトルが空のときは追加ボタンが無効', () => {
    setup();
    expect(screen.getByTestId('agenda-add-submit')).toBeDisabled();
  });

  it('タイトルがある場合は送信で onSubmit が呼ばれる', async () => {
    const user = userEvent.setup();
    const props = setup({ title: 'Topic' });

    const submit = screen.getByTestId('agenda-add-submit');
    expect(submit).not.toBeDisabled();

    await user.click(submit);
    expect(props.onSubmit).toHaveBeenCalled();
  });

  it('Enter キーで送信できる', async () => {
    const user = userEvent.setup();
    const props = setup({ title: 'Topic' });

    await user.click(screen.getByTestId('agenda-add-title'));
    await user.keyboard('{Enter}');

    expect(props.onSubmit).toHaveBeenCalled();
  });
});
