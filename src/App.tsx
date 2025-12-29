import { useTimer } from './hooks/useTimer';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { AgendaManager } from './components/AgendaManager';
import { Button } from '@/components/ui/button';
import { BellRing } from 'lucide-react';

const DEFAULT_AGENDA = [
  { id: '1', title: 'Aさん', durationSeconds: 5 * 60 },
  { id: '2', title: 'Bさん', durationSeconds: 3 * 60 },
  { id: '3', title: 'Cさん', durationSeconds: 5 * 60 },
];

function App() {
  const {
    remainingSeconds,
    isRunning,
    currentIndex,
    agenda,
    isSoundEnabled,
    overtimeReminderMinutes,
    toggle,
    reset,
    nextItem,
    prevItem,
    goToItem,
    startItem,
    updateAgenda,
    reorderAgendaByIndex,
    setSoundEnabled,
    setOvertimeReminderMinutes,
    playBell,
  } = useTimer(DEFAULT_AGENDA);

  const hasPrev = currentIndex > 0;
  const hasMore = currentIndex < agenda.length - 1;

  return (
    <main className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Left: Timer Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50" />

        <div className="z-10 flex flex-col items-center">
          <TimerDisplay
            seconds={remainingSeconds}
            title={agenda[currentIndex]?.title}
          />

          <TimerControls
            isRunning={isRunning}
            onToggle={toggle}
            onReset={reset}
            onNext={nextItem}
            onPrevious={prevItem}
            hasMore={hasMore}
            hasPrev={hasPrev}
          />

          <div className="mt-6">
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 active:scale-95 transition-all shadow-lg"
              onClick={playBell}
              aria-label="音を鳴らす"
            >
              <BellRing className="h-7 w-7 fill-current" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Sidebar / Agenda Manager */}
      <div className="w-[420px] bg-zinc-950 border-l border-white/5 shadow-2xl z-20 overflow-hidden">
        <AgendaManager
          agenda={agenda}
          currentIndex={currentIndex}
          onUpdate={updateAgenda}
          onGoTo={goToItem}
          onStart={startItem}
          onToggle={toggle}
          onReorder={reorderAgendaByIndex}
          isRunning={isRunning}
          remainingSeconds={remainingSeconds}
          isSoundEnabled={isSoundEnabled}
          onSoundToggle={setSoundEnabled}
          overtimeReminderMinutes={overtimeReminderMinutes}
          onOvertimeReminderChange={setOvertimeReminderMinutes}
        />
      </div>
    </main>
  );
}

export default App;
