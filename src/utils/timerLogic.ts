import type { AgendaItem, TimerState } from '@/types/timer';

type TickResult = {
  nextState: TimerState;
  shouldPlayBell: boolean;
};

const getReminderSeconds = (minutes: number | null): number | null => {
  return minutes ? minutes * 60 : null;
};

export const tickTimer = (state: TimerState): TickResult => {
  const nextSeconds = state.remainingSeconds - 1;

  const reminderSeconds = getReminderSeconds(state.overtimeReminderMinutes);
  const crossedReminderThreshold =
    reminderSeconds !== null
      ? !state.hasOvertimeReminderPlayed &&
        state.remainingSeconds > -reminderSeconds &&
        nextSeconds <= -reminderSeconds
      : false;

  const shouldPlayBell = nextSeconds === 0 || crossedReminderThreshold;

  return {
    nextState: {
      ...state,
      remainingSeconds: nextSeconds,
      hasOvertimeReminderPlayed:
        state.hasOvertimeReminderPlayed || crossedReminderThreshold,
    },
    shouldPlayBell,
  };
};

export const syncCurrentDuration = (
  state: TimerState,
  durationSeconds?: number,
): TimerState => {
  if (durationSeconds === undefined) return state;
  return {
    ...state,
    remainingSeconds: durationSeconds,
    isRunning: false,
    hasOvertimeReminderPlayed: false,
  };
};

export const toggleRunning = (state: TimerState): TimerState => {
  return {
    ...state,
    isRunning: !state.isRunning,
  };
};

export const resetCurrentItem = (state: TimerState): TimerState => {
  const agenda = [...state.agenda];
  const currentItem = agenda[state.currentIndex];

  return {
    ...state,
    agenda,
    remainingSeconds: currentItem?.durationSeconds || 0,
    isRunning: false,
    hasOvertimeReminderPlayed: false,
  };
};

export const moveToNextItem = (state: TimerState): TimerState => {
  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.agenda.length) return state;

  const agenda = [...state.agenda];
  const nextItem = agenda[nextIndex];

  return {
    ...state,
    agenda,
    currentIndex: nextIndex,
    remainingSeconds: nextItem?.durationSeconds ?? 0,
    hasOvertimeReminderPlayed: false,
  };
};

export const moveToPreviousItem = (state: TimerState): TimerState => {
  const prevIndex = state.currentIndex - 1;
  if (prevIndex < 0) return state;

  const agenda = [...state.agenda];
  const prevItem = agenda[prevIndex];

  return {
    ...state,
    agenda,
    currentIndex: prevIndex,
    remainingSeconds: prevItem?.durationSeconds ?? 0,
    hasOvertimeReminderPlayed: false,
  };
};

export const jumpToIndex = (
  state: TimerState,
  index: number,
  options?: { isRunning?: boolean },
): TimerState => {
  if (index < 0 || index >= state.agenda.length) return state;

  const agenda = [...state.agenda];
  const target = agenda[index];

  return {
    ...state,
    agenda,
    currentIndex: index,
    remainingSeconds: target?.durationSeconds ?? 0,
    isRunning: Boolean(options?.isRunning),
    hasOvertimeReminderPlayed: false,
  };
};

export const reorderAgendaItems = (
  state: TimerState,
  fromIndex: number,
  toIndex: number,
): TimerState => {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= state.agenda.length ||
    toIndex >= state.agenda.length
  ) {
    return state;
  }

  const agenda = [...state.agenda];
  const [moved] = agenda.splice(fromIndex, 1);
  agenda.splice(toIndex, 0, moved);

  let currentIndex = state.currentIndex;
  if (state.currentIndex === fromIndex) {
    currentIndex = toIndex;
  } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
    currentIndex = state.currentIndex - 1;
  } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
    currentIndex = state.currentIndex + 1;
  }

  return {
    ...state,
    agenda,
    currentIndex,
  };
};

export const replaceAgenda = (
  state: TimerState,
  newAgenda: AgendaItem[],
): TimerState => {
  const currentId = state.agenda[state.currentIndex]?.id;
  const currentIndexInNew = currentId
    ? newAgenda.findIndex((item) => item.id === currentId)
    : -1;

  let currentIndex =
    currentIndexInNew >= 0
      ? currentIndexInNew
      : Math.min(state.currentIndex, Math.max(0, newAgenda.length - 1));

  const currentItem = newAgenda[currentIndex];
  const remainingSeconds =
    currentIndexInNew >= 0 && currentItem
      ? Math.min(state.remainingSeconds, currentItem.durationSeconds)
      : (currentItem?.durationSeconds ?? 0);
  const isRunning = currentItem ? state.isRunning : false;

  return {
    ...state,
    agenda: newAgenda,
    currentIndex,
    remainingSeconds,
    hasOvertimeReminderPlayed: false,
    isRunning,
  };
};
