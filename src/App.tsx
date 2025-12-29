import { useTimer } from './hooks/useTimer';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { AgendaManager } from './components/AgendaManager';

const INITIAL_AGENDA = [
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
    toggle,
    reset,
    nextItem,
    prevItem,
    goToItem,
    startItem,
    reorderItem,
    updateAgenda,
  } = useTimer(INITIAL_AGENDA);

  const currentItem = agenda[currentIndex];

  return (
    <div className="dark flex h-screen w-full bg-black text-white selection:bg-blue-500/30">
      {/* Main Timer Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-12">
        <div className="w-full max-w-2xl flex flex-col items-center gap-8">
          <TimerDisplay
            seconds={remainingSeconds}
            title={currentItem?.title || '準備完了'}
          />

          <TimerControls
            isRunning={isRunning}
            onToggle={toggle}
            onReset={reset}
            onNext={nextItem}
            onPrevious={prevItem}
            hasMore={currentIndex < agenda.length - 1}
            hasPrev={currentIndex > 0}
          />
        </div>
      </main>

      {/* Sidebar for Agenda */}
      <aside className="w-[400px] border-l border-zinc-800 bg-zinc-950/50 flex flex-col overflow-hidden">
        <AgendaManager
          agenda={agenda}
          currentIndex={currentIndex}
          onUpdate={updateAgenda}
          onGoTo={goToItem}
          onStart={startItem}
          onToggle={toggle}
          onReorder={reorderItem}
          isRunning={isRunning}
          remainingSeconds={remainingSeconds}
        />
      </aside>
    </div>
  );
}

export default App;
