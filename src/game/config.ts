import type { GamePhase } from './types'

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 18

export const POINTS_PER_ROW = 100

/** Tiempo entre ticks según la fase. `null` detiene el bucle. */
export const TICK_DELAY_MS: Record<GamePhase, number | null> = {
  playing: 700,
  cascading: 320,
  gameOver: null,
}

/** Desplazamientos laterales que se prueban, en orden, al rotar junto a un obstáculo. */
export const ROTATION_KICKS = [0, -1, 1, -2, 2]
