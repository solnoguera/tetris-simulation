import { Board } from './components/Board'
import { Controls } from './components/Controls'
import { GameOverOverlay } from './components/GameOverOverlay'
import { Hud } from './components/Hud'
import { MusicButton } from './components/MusicButton'
import { PauseOverlay } from './components/PauseOverlay'
import { useBackgroundMusic } from './hooks/useBackgroundMusic'
import { useGame } from './hooks/useGame'

export default function App() {
  const { state, restart, togglePause } = useGame()
  const music = useBackgroundMusic()

  return (
    <main className="app">
      <header className="app__header">
        <h1>Derrumbe</h1>
        <p>Limpiá filas y dejá que los bloques caigan para encadenar combos.</p>
      </header>

      <div className="game">
        <div className="game__board">
          <Board board={state.board} active={state.active} phase={state.phase} />
          {state.phase === 'gameOver' && (
            <GameOverOverlay score={state.score} onRestart={restart} />
          )}
          {state.paused && <PauseOverlay onResume={togglePause} />}
        </div>
        <aside className="game__side">
          <Hud score={state.score} rowsCleared={state.rowsCleared} chain={state.chain} />
          <Controls />
          <MusicButton isPlaying={music.isPlaying} onToggle={music.toggle} />
        </aside>
      </div>
    </main>
  )
}
