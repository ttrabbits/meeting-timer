import { useTimer } from './hooks/useTimer';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { AgendaManager } from './components/AgendaManager';
import './App.css';

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
    goToItem,
    reorderItem,
    updateAgenda,
  } = useTimer(INITIAL_AGENDA);

  const currentItem = agenda[currentIndex];

  return (
    <div className="app-container">
      <main className="main-content">
        <TimerDisplay
          seconds={remainingSeconds}
          title={currentItem?.title || '準備完了'}
        />

        <TimerControls
          isRunning={isRunning}
          onToggle={toggle}
          onReset={reset}
          onNext={nextItem}
          hasMore={currentIndex < agenda.length - 1}
        />
      </main>

      <aside className="sidebar">
        <AgendaManager
          agenda={agenda}
          currentIndex={currentIndex}
          onUpdate={updateAgenda}
          onGoTo={goToItem}
          onReorder={reorderItem}
        />
      </aside>
    </div>
  );
}

export default App;
