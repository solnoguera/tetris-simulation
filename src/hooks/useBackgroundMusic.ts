import { useCallback, useEffect, useRef, useState } from 'react'
import { createAudio, playAudio } from '../audio'

/**
 * Música de fondo en loop. Intenta sonar al cargar y, si el navegador lo bloquea,
 * arranca con la primera tecla, salvo que antes se haya usado el botón de música.
 */
export function useBackgroundMusic(): { isPlaying: boolean; toggle: () => void } {
  const [music] = useState(() => createAudio('bg-music.mp3', { loop: true, volume: 0.4 }))
  const [isPlaying, setIsPlaying] = useState(false)
  const userDecided = useRef(false)

  useEffect(() => {
    const syncState = () => setIsPlaying(!music.paused)
    const startOnFirstKey = () => {
      if (!userDecided.current) playAudio(music)
    }

    music.addEventListener('play', syncState)
    music.addEventListener('pause', syncState)
    window.addEventListener('keydown', startOnFirstKey, { once: true })
    if (!userDecided.current) playAudio(music)

    return () => {
      music.removeEventListener('play', syncState)
      music.removeEventListener('pause', syncState)
      window.removeEventListener('keydown', startOnFirstKey)
      music.pause()
    }
  }, [music])

  const toggle = useCallback(() => {
    userDecided.current = true
    if (music.paused) playAudio(music)
    else music.pause()
  }, [music])

  return { isPlaying, toggle }
}
