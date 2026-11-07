import { describe, expect, it } from 'vitest'
import { PIECE_KINDS, type PieceKind } from './pieces'
import { drawPiece, nextRandom } from './random'

function drawMany(count: number, seed: number): PieceKind[] {
  const drawn: PieceKind[] = []
  let bag: readonly PieceKind[] = []
  let currentSeed = seed
  for (let i = 0; i < count; i++) {
    const result = drawPiece(bag, currentSeed)
    drawn.push(result.kind)
    bag = result.bag
    currentSeed = result.seed
  }
  return drawn
}

describe('nextRandom', () => {
  it('devuelve valores en [0, 1) y avanza la semilla', () => {
    let seed = 1
    for (let i = 0; i < 1000; i++) {
      const result = nextRandom(seed)
      expect(result.value).toBeGreaterThanOrEqual(0)
      expect(result.value).toBeLessThan(1)
      expect(result.seed).not.toBe(seed)
      seed = result.seed
    }
  })
})

describe('drawPiece', () => {
  it('con la misma semilla da la misma secuencia', () => {
    expect(drawMany(50, 42)).toEqual(drawMany(50, 42))
  })

  it('con otra semilla da otra secuencia', () => {
    expect(drawMany(50, 42)).not.toEqual(drawMany(50, 43))
  })

  it('entrega cada pieza una vez por bolsa', () => {
    const size = PIECE_KINDS.length
    const drawn = drawMany(size * 3, 7)
    for (let start = 0; start < drawn.length; start += size) {
      const bag = drawn.slice(start, start + size)
      expect([...bag].sort()).toEqual([...PIECE_KINDS].sort())
    }
  })
})
