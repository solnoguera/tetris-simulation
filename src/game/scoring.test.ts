import { describe, expect, it } from 'vitest'
import { POINTS_PER_ROW } from './config'
import { scoreForClear } from './scoring'

describe('scoreForClear', () => {
  it('suma por cada fila', () => {
    expect(scoreForClear(3, 1)).toBe(3 * POINTS_PER_ROW)
  })

  it('multiplica por el paso de la cadena', () => {
    expect(scoreForClear(2, 4)).toBe(2 * POINTS_PER_ROW * 4)
  })
})
