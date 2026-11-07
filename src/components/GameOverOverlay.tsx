interface GameOverOverlayProps {
  score: number
  onRestart: () => void
}

export function GameOverOverlay({ score, onRestart }: GameOverOverlayProps) {
  return (
    <div className="overlay" role="alert">
      <h2>Se vino abajo</h2>
      <p>{score} puntos</p>
      <button type="button" onClick={onRestart}>
        Jugar de nuevo
      </button>
      <small>o apretá Enter</small>
    </div>
  )
}
