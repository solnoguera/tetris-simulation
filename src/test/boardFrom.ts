import { BOARD_HEIGHT, BOARD_WIDTH } from '../game/config'
import type { Board, Cell } from '../game/types'

/**
 * Arma un tablero a partir de dibujos: '#' es bloque y '.' es vacío.
 * Las filas dadas quedan abajo de todo; el resto del tablero queda vacío.
 */
export function boardFrom(rows: readonly string[]): Board {
  const emptyRows = Array.from({ length: BOARD_HEIGHT - rows.length }, () => '.'.repeat(BOARD_WIDTH))
  return [...emptyRows, ...rows].map((row) =>
    [...row].map((char): Cell => (char === '#' ? 'square' : null)),
  )
}

/** Inversa de `boardFrom`: devuelve las últimas `count` filas como dibujo. */
export function bottomRows(board: Board, count: number): string[] {
  return board.slice(-count).map((row) => row.map((cell) => (cell ? '#' : '.')).join(''))
}
