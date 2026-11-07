/** Matriz cuadrada: 1 es celda ocupada. Al ser cuadrada, la pieza gira sobre su centro. */
export type Shape = readonly (readonly number[])[]

/** Para agregar una pieza: sumá una entrada acá y su color en index.css. */
export const PIECE_SHAPES = {
  rod3: [
    [0, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  corner: [
    [1, 0],
    [1, 1],
  ],
  square: [
    [1, 1],
    [1, 1],
  ],
  rod4: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  tee: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  zig: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  zag: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  hook: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  crook: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
} satisfies Record<string, Shape>

export type PieceKind = keyof typeof PIECE_SHAPES

export const PIECE_KINDS = Object.keys(PIECE_SHAPES) as PieceKind[]

/** Pieza en el tablero. `x` e `y` son la esquina superior izquierda de su matriz. */
export interface Piece {
  kind: PieceKind
  shape: Shape
  x: number
  y: number
}

/** Crea la pieza centrada, con su primera fila ocupada en el borde superior. */
export function createPiece(kind: PieceKind, boardWidth: number): Piece {
  const shape = PIECE_SHAPES[kind]
  const firstFilledRow = shape.findIndex((row) => row.includes(1))
  return {
    kind,
    shape,
    x: Math.floor((boardWidth - shape.length) / 2),
    y: 0 - firstFilledRow,
  }
}

/** Gira la matriz 90 grados en sentido horario. */
export function rotateShape(shape: Shape): Shape {
  return shape.map((_, col) => shape.map((row) => row[col]).reverse())
}

/** Devuelve las celdas que ocupa la pieza, en coordenadas del tablero. */
export function pieceCells(piece: Piece): { row: number; col: number }[] {
  return piece.shape.flatMap((cells, rowOffset) =>
    cells.flatMap((filled, colOffset) =>
      filled ? [{ row: piece.y + rowOffset, col: piece.x + colOffset }] : [],
    ),
  )
}
