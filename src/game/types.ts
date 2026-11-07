import type { Piece, PieceKind } from './pieces'

export type Cell = PieceKind | null

/** Se indexa como board[fila][columna]. La fila 0 es la de arriba. */
export type Board = readonly (readonly Cell[])[]

/**
 * playing:   hay una pieza activa bajo el control de quien juega.
 * cascading: se están resolviendo filas llenas; los controles no responden.
 * gameOver:  una pieza nueva no entró en el tablero.
 */
export type GamePhase = 'playing' | 'cascading' | 'gameOver'

export interface GameState {
  board: Board
  active: Piece | null
  /** Piezas pendientes de salir. */
  bag: readonly PieceKind[]
  /** Semilla del azar. Vive en el estado para que el reducer sea puro. */
  seed: number
  score: number
  rowsCleared: number
  /** Paso actual de la cascada: 0 fuera de ella, 1 o más durante. */
  chain: number
  /** Total de piezas fijadas. Permite detectar el evento desde afuera del reducer. */
  piecesLocked: number
  phase: GamePhase
  /** Va aparte de la fase para poder pausar una cascada y seguirla en el mismo paso. */
  paused: boolean
}

export type GameAction =
  | { type: 'tick' }
  | { type: 'move'; dx: -1 | 1 }
  | { type: 'rotate' }
  | { type: 'softDrop' }
  | { type: 'hardDrop' }
  | { type: 'togglePause' }
  | { type: 'restart'; seed: number }
