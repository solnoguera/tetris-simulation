import { describe, expect, it } from 'vitest'
import { boardFrom, bottomRows } from '../test/boardFrom'
import { applyGravity, collides, createBoard, findFullRows, lockPiece, removeRows } from './board'
import { BOARD_HEIGHT, BOARD_WIDTH } from './config'
import type { Piece } from './pieces'

const dot = (x: number, y: number): Piece => ({ kind: 'square', shape: [[1]], x, y })

describe('createBoard', () => {
  it('crea un tablero vacío del tamaño configurado', () => {
    const board = createBoard()
    expect(board).toHaveLength(BOARD_HEIGHT)
    expect(board.every((row) => row.length === BOARD_WIDTH)).toBe(true)
    expect(board.flat().every((cell) => cell === null)).toBe(true)
  })
})

describe('collides', () => {
  const board = createBoard()

  it('acepta una posición libre', () => {
    expect(collides(board, dot(0, 0))).toBe(false)
  })

  it.each([
    ['la pared izquierda', dot(-1, 5)],
    ['la pared derecha', dot(BOARD_WIDTH, 5)],
    ['el piso', dot(5, BOARD_HEIGHT)],
  ])('detecta choque contra %s', (_, piece) => {
    expect(collides(board, piece)).toBe(true)
  })

  it('detecta choque contra un bloque', () => {
    expect(collides(boardFrom(['#.........']), dot(0, BOARD_HEIGHT - 1))).toBe(true)
    expect(collides(boardFrom(['#.........']), dot(1, BOARD_HEIGHT - 1))).toBe(false)
  })

  it('permite celdas por encima del tablero', () => {
    expect(collides(board, dot(0, -1))).toBe(false)
  })

  it('ignora los huecos de la matriz', () => {
    const hollow: Piece = { kind: 'corner', shape: [[1, 0], [1, 1]], x: 0, y: BOARD_HEIGHT - 2 }
    expect(collides(boardFrom(['..........', '..#.......']), hollow)).toBe(false)
    expect(collides(boardFrom(['.#........', '..........']), hollow)).toBe(false)
  })
})

describe('lockPiece', () => {
  it('incorpora la pieza sin modificar el tablero original', () => {
    const board = createBoard()
    const locked = lockPiece(board, dot(2, 3))
    expect(locked[3][2]).toBe('square')
    expect(board[3][2]).toBeNull()
  })

  it('descarta las celdas por encima del tablero', () => {
    const tall: Piece = { kind: 'rod3', shape: [[1], [1]], x: 0, y: -1 }
    const locked = lockPiece(createBoard(), tall)
    expect(locked[0][0]).toBe('rod3')
    expect(locked).toHaveLength(BOARD_HEIGHT)
  })
})

describe('findFullRows', () => {
  it('devuelve solo los índices de las filas llenas', () => {
    const board = boardFrom(['##########', '#########.', '##########'])
    expect(findFullRows(board)).toEqual([BOARD_HEIGHT - 3, BOARD_HEIGHT - 1])
  })
})

describe('removeRows', () => {
  it('vacía las filas indicadas y deja el resto en su lugar', () => {
    const board = boardFrom(['#.........', '##########', '.#........'])
    const removed = removeRows(board, [BOARD_HEIGHT - 2])
    expect(bottomRows(removed, 3)).toEqual(['#.........', '..........', '.#........'])
  })
})

describe('applyGravity', () => {
  it('hace caer cada bloque suelto hasta apoyarse', () => {
    const board = boardFrom(['#.#.......', '..........', '.#........', '..#.......'])
    expect(bottomRows(applyGravity(board), 4)).toEqual([
      '..........',
      '..........',
      '..#.......',
      '###.......',
    ])
  })

  it('no modifica un tablero sin huecos', () => {
    const board = boardFrom(['#.........', '##........'])
    expect(applyGravity(board)).toEqual(board)
  })
})
