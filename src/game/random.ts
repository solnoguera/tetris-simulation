import { PIECE_KINDS, type PieceKind } from './pieces'

/** Generador mulberry32: devuelve un valor en [0, 1) y la semilla siguiente. */
export function nextRandom(seed: number): { value: number; seed: number } {
  const nextSeed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(nextSeed ^ (nextSeed >>> 15), 1 | nextSeed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: nextSeed }
}

/** Mezcla Fisher-Yates a partir de una semilla. */
function shuffle<T>(items: readonly T[], seed: number): { items: T[]; seed: number } {
  const shuffled = [...items]
  let currentSeed = seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    const { value, seed: nextSeed } = nextRandom(currentSeed)
    currentSeed = nextSeed
    const j = Math.floor(value * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return { items: shuffled, seed: currentSeed }
}

/** Saca la próxima pieza. Cuando la bolsa se vacía, la rellena con todas las piezas mezcladas. */
export function drawPiece(
  bag: readonly PieceKind[],
  seed: number,
): { kind: PieceKind; bag: PieceKind[]; seed: number } {
  if (bag.length > 0) {
    const [kind, ...rest] = bag
    return { kind, bag: rest, seed }
  }
  const { items, seed: nextSeed } = shuffle(PIECE_KINDS, seed)
  const [kind, ...rest] = items
  return { kind, bag: rest, seed: nextSeed }
}
