import type { MouseEvent } from 'react'

interface MusicButtonProps {
  isPlaying: boolean
  onToggle: () => void
}

/** Evita tomar el foco al hacer clic: si no, el espacio volvería a activar el botón. */
function keepFocus(event: MouseEvent) {
  event.preventDefault()
}

export function MusicButton({ isPlaying, onToggle }: MusicButtonProps) {
  return (
    <button type="button" className="music-button" onMouseDown={keepFocus} onClick={onToggle}>
      {isPlaying ? 'Pausar música' : 'Reproducir música'}
    </button>
  )
}
