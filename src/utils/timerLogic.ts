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

export const toggleRunning = (state: TimerState, now: number): TimerState => {
  const isStarting = !state.isRunning;
  const agenda = [...state.agenda];
  const currentItem = agenda[state.currentIndex];

  if (isStarting && currentItem && !currentItem.startTime) {
    agenda[state.currentIndex] = {
      ...currentItem,
      startTime: now,
    };
  }

  return {
    ...state,
    isRunning: isStarting,
    agenda,
  };
};

export const resetCurrentItem = (state: TimerState): TimerState => {
  const agenda = [...state.agenda];
  const currentItem = agenda[state.currentIndex];
  if (currentItem) {
    agenda[state.currentIndex] = {
      ...currentItem,
      startTime: undefined,
      endTime: undefined,
    };
  }

  return {
    ...state,
    agenda,
    remainingSeconds: currentItem?.durationSeconds || 0,
    isRunning: false,
    hasOvertimeReminderPlayed: false,
  };
};

const recordTransitionTimes = (
  agenda: AgendaItem[],
  fromIndex: number,
  toIndex: number,
  now: number,
  shouldStartNext: boolean,
): AgendaItem[] => {
  const updatedAgenda = [...agenda];

  if (updatedAgenda[fromIndex]) {
    updatedAgenda[fromIndex] = {
      ...updatedAgenda[fromIndex],
      endTime: now,
    };
  }

  const target = updatedAgenda[toIndex];
  if (shouldStartNext && target && !target.startTime) {
    updatedAgenda[toIndex] = {
      ...target,
      startTime: now,
    };
  }

  return updatedAgenda;
};

export const moveToNextItem = (state: TimerState, now: number): TimerState => {
  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.agenda.length) return state;

  const agenda = recordTransitionTimes(
    state.agenda,
    state.currentIndex,
    nextIndex,
    now,
    state.isRunning,
  );
  const nextItem = agenda[nextIndex];

  return {
    ...state,
    agenda,
    currentIndex: nextIndex,
    remainingSeconds: nextItem?.durationSeconds ?? 0,
    hasOvertimeReminderPlayed: false,
  };
};

export const moveToPreviousItem = (
  state: TimerState,
  now: number,
): TimerState => {
  const prevIndex = state.currentIndex - 1;
  if (prevIndex < 0) return state;

  const agenda = recordTransitionTimes(
    state.agenda,
    state.currentIndex,
    prevIndex,
    now,
    state.isRunning,
  );
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
  now: number,
  options?: { isRunning?: boolean },
): TimerState => {
  if (index < 0 || index >= state.agenda.length) return state;

  const agenda = recordTransitionTimes(
    state.agenda,
    state.currentIndex,
    index,
    now,
    Boolean(options?.isRunning),
  );
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
  let currentIndex = state.currentIndex;
  if (currentIndex >= newAgenda.length) {
    currentIndex = Math.max(0, newAgenda.length - 1);
  }

  return {
    ...state,
    agenda: newAgenda,
    currentIndex,
  };
};
