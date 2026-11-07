import { useCallback, useReducer } from 'react'
import { createInitialState, gameReducer, tickDelay } from '../game/reducer'
import type { GameState } from '../game/types'
import { useInterval } from './useInterval'
import { useKeyboard, type KeyBinding } from './useKeyboard'
import { useSoundEffects } from './useSoundEffects'

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32)
}

/** Conecta la lógica del juego con React: estado, bucle de tiempo y teclado. */
export function useGame(): { state: GameState; restart: () => void; togglePause: () => void } {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(randomSeed()),
  )

  const restart = useCallback(() => dispatch({ type: 'restart', seed: randomSeed() }), [])
  const togglePause = useCallback(() => dispatch({ type: 'togglePause' }), [])

  useInterval(() => dispatch({ type: 'tick' }), tickDelay(state))
  useSoundEffects(state)

  const bindings: Record<string, KeyBinding> = {
    ArrowLeft: { run: () => dispatch({ type: 'move', dx: -1 }), repeat: true },
    ArrowRight: { run: () => dispatch({ type: 'move', dx: 1 }), repeat: true },
    ArrowDown: { run: () => dispatch({ type: 'softDrop' }), repeat: true },
    ArrowUp: { run: () => dispatch({ type: 'rotate' }) },
    Space: { run: () => dispatch({ type: 'hardDrop' }) },
    KeyP: { run: togglePause },
  }
  if (state.phase === 'gameOver') bindings.Enter = { run: restart }
  useKeyboard(bindings)

  return { state, restart, togglePause }
}
