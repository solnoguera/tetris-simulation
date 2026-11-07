import { describe, expect, it } from 'vitest'
import { BOARD_WIDTH } from './config'
import { PIECE_KINDS, PIECE_SHAPES, createPiece, pieceCells, rotateShape } from './pieces'

describe('PIECE_SHAPES', () => {
  it.each(PIECE_KINDS)('%s es una matriz cuadrada de 3 o 4 celdas', (kind) => {
    const shape = PIECE_SHAPES[kind]
    expect(shape.every((row) => row.length === shape.length)).toBe(true)
    expect([3, 4]).toContain(shape.flat().filter(Boolean).length)
  })
})

describe('rotateShape', () => {
  it('gira en sentido horario', () => {
    const rotated = rotateShape([
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ])
    expect(rotated).toEqual([
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ])
  })

  it.each(PIECE_KINDS)('%s vuelve a su forma original tras cuatro rotaciones', (kind) => {
    const shape = PIECE_SHAPES[kind]
    const rotated = rotateShape(rotateShape(rotateShape(rotateShape(shape))))
    expect(rotated).toEqual(shape)
  })
})

describe('createPiece', () => {
  it.each(PIECE_KINDS)('%s aparece dentro del tablero, tocando el borde superior', (kind) => {
    const cells = pieceCells(createPiece(kind, BOARD_WIDTH))
    expect(Math.min(...cells.map((cell) => cell.row))).toBe(0)
    expect(cells.every(({ col }) => col >= 0 && col < BOARD_WIDTH)).toBe(true)
  })
})
