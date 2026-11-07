interface PauseOverlayProps {
  onResume: () => void
}

export function PauseOverlay({ onResume }: PauseOverlayProps) {
  return (
    <div className="overlay" role="status">
      <h2>Pausa</h2>
      <button type="button" onClick={onResume}>
        Seguir
      </button>
      <small>o apretá P</small>
    </div>
  )
}
