import { POINTS_PER_ROW } from './config'

/** Puntos de un paso de cascada: cuanto más larga la cadena, mayor el multiplicador. */
export function scoreForClear(rows: number, chain: number): number {
  return rows * POINTS_PER_ROW * chain
}
