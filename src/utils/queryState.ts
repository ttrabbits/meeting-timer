import type { AgendaItem } from '@/types/timer';

type QueryState = {
  agenda?: AgendaItem[];
  isSoundEnabled?: boolean;
  overtimeReminderMinutes?: number | null;
};

const AGENDA_PARAM = 'agenda';
const SOUND_PARAM = 'sound';
const OVERTIME_PARAM = 'overtime';

const encodeBase64 = (value: string): string => {
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(value)));
  }
  return Buffer.from(value, 'utf-8').toString('base64');
};

const decodeBase64 = (value: string): string => {
  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(value)));
  }
  return Buffer.from(value, 'base64').toString('utf-8');
};

const isValidAgendaItem = (item: unknown): item is AgendaItem => {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as AgendaItem;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.durationSeconds === 'number' &&
    Number.isFinite(candidate.durationSeconds) &&
    candidate.durationSeconds >= 0
  );
};

export const parseQueryState = (search: string): QueryState => {
  const params = new URLSearchParams(search);
  const agendaParam = params.get(AGENDA_PARAM);
  const soundParam = params.get(SOUND_PARAM);
  const overtimeParam = params.get(OVERTIME_PARAM);

  let agenda: AgendaItem[] | undefined;
  if (agendaParam) {
    try {
      const parsed = JSON.parse(decodeBase64(agendaParam));
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(isValidAgendaItem);
        if (valid.length > 0) {
          agenda = valid;
        }
      }
    } catch {
      // 無視してデフォルトを使う
    }
  }

  let isSoundEnabled: boolean | undefined;
  if (soundParam !== null) {
    if (soundParam === '1') {
      isSoundEnabled = true;
    } else if (soundParam === '0') {
      isSoundEnabled = false;
    }
  }

  let overtimeReminderMinutes: number | null | undefined;
  if (overtimeParam !== null) {
    const parsed = parseInt(overtimeParam, 10);
    overtimeReminderMinutes =
      Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  return { agenda, isSoundEnabled, overtimeReminderMinutes };
};

export const buildQueryFromState = (state: {
  agenda: AgendaItem[];
  isSoundEnabled: boolean;
  overtimeReminderMinutes: number | null;
}): string => {
  const params = new URLSearchParams();
  const payload = state.agenda.map((item) => ({
    id: item.id,
    title: item.title,
    durationSeconds: item.durationSeconds,
  }));
  params.set(AGENDA_PARAM, encodeBase64(JSON.stringify(payload)));
  params.set(SOUND_PARAM, state.isSoundEnabled ? '1' : '0');
  if (state.overtimeReminderMinutes && state.overtimeReminderMinutes > 0) {
    params.set(OVERTIME_PARAM, String(state.overtimeReminderMinutes));
  }
  return params.toString();
};
