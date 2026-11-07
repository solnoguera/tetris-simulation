import { useEffect, useRef, useState } from 'react'
import { createAudio, replayAudio } from '../audio'
import type { GameState } from '../game/types'

/**
 * Hace sonar los efectos cuando cambia el estado. El reducer es puro y no puede
 * reproducir audio, así que los eventos se detectan comparando contadores.
 */
export function useSoundEffects({ piecesLocked }: GameState): void {
  const [lockSound] = useState(() => createAudio('fallen-piece.mp3'))
  const previousPiecesLocked = useRef(piecesLocked)

  useEffect(() => {
    if (piecesLocked > previousPiecesLocked.current) replayAudio(lockSound)
    previousPiecesLocked.current = piecesLocked
  }, [piecesLocked, lockSound])
}
