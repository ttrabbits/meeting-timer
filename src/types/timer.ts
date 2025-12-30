export interface AgendaItem {
  id: string;
  title: string;
  durationSeconds: number;
}

export interface TimerState {
  remainingSeconds: number;
  isRunning: boolean;
  currentIndex: number;
  agenda: AgendaItem[];
  isSoundEnabled: boolean;
  overtimeReminderMinutes: number | null;
  hasOvertimeReminderPlayed: boolean;
}
