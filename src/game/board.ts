import { BOARD_HEIGHT, BOARD_WIDTH } from './config'
import { pieceCells, type Piece } from './pieces'
import type { Board, Cell } from './types'

function emptyRow(width: number): Cell[] {
  return Array<Cell>(width).fill(null)
}

export function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => emptyRow(BOARD_WIDTH))
}

/** Las celdas por encima del tablero están permitidas: la pieza puede rotar al aparecer. */
export function collides(board: Board, piece: Piece): boolean {
  return pieceCells(piece).some(({ row, col }) => {
    const outOfBounds = col < 0 || col >= board[0].length || row >= board.length
    return outOfBounds || (row >= 0 && board[row][col] !== null)
  })
}

/** Devuelve un tablero nuevo con la pieza incorporada. */
export function lockPiece(board: Board, piece: Piece): Board {
  const next = board.map((row) => [...row])
  for (const { row, col } of pieceCells(piece)) {
    if (row >= 0) next[row][col] = piece.kind
  }
  return next
}

export function findFullRows(board: Board): number[] {
  return board.flatMap((row, index) => (row.every((cell) => cell !== null) ? [index] : []))
}

/** Vacía las filas indicadas, sin mover el resto: de eso se encarga `applyGravity`. */
export function removeRows(board: Board, rows: readonly number[]): Board {
  return board.map((row, index) => (rows.includes(index) ? emptyRow(row.length) : row))
}

/** Compacta cada columna hacia abajo, de modo que no queden huecos debajo de ningún bloque. */
export function applyGravity(board: Board): Board {
  const height = board.length
  const columns = board[0].map((_, col) => {
    const blocks = board.map((row) => row[col]).filter((cell) => cell !== null)
    return [...Array<Cell>(height - blocks.length).fill(null), ...blocks]
  })
  return board.map((row, rowIndex) => row.map((_, col) => columns[col][rowIndex]))
}
