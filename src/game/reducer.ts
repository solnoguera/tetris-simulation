import { applyGravity, collides, createBoard, findFullRows, lockPiece, removeRows } from './board'
import { BOARD_WIDTH, ROTATION_KICKS, TICK_DELAY_MS } from './config'
import { createPiece, rotateShape, type Piece } from './pieces'
import { drawPiece } from './random'
import { scoreForClear } from './scoring'
import type { GameAction, GameState } from './types'

export function createInitialState(seed: number): GameState {
  return spawnPiece({
    board: createBoard(),
    active: null,
    bag: [],
    seed,
    score: 0,
    rowsCleared: 0,
    chain: 0,
    piecesLocked: 0,
    phase: 'playing',
    paused: false,
  })
}

/** Tiempo hasta el próximo tick. `null` detiene el bucle. */
export function tickDelay(state: GameState): number | null {
  return state.paused ? null : TICK_DELAY_MS[state.phase]
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'restart') return createInitialState(action.seed)
  if (action.type === 'togglePause') return togglePause(state)
  if (state.paused) return state
  if (action.type === 'tick') return tick(state)

  // El resto de las acciones son controles: solo aplican con una pieza activa.
  const { active } = state
  if (state.phase !== 'playing' || !active) return state

  switch (action.type) {
    case 'move':
      return tryPlace(state, { ...active, x: active.x + action.dx }) ?? state
    case 'rotate':
      return rotate(state, active)
    case 'softDrop':
      return stepDown(state, active)
    case 'hardDrop':
      return hardDrop(state, active)
  }
}

function togglePause(state: GameState): GameState {
  return state.phase === 'gameOver' ? state : { ...state, paused: !state.paused }
}

function tick(state: GameState): GameState {
  if (state.phase === 'cascading') return resolveCascadeStep(state)
  if (state.phase === 'playing' && state.active) return stepDown(state, state.active)
  return state
}

/** Devuelve el estado con la pieza en su nueva posición, o null si esa posición choca. */
function tryPlace(state: GameState, piece: Piece): GameState | null {
  return collides(state.board, piece) ? null : { ...state, active: piece }
}

function rotate(state: GameState, active: Piece): GameState {
  const shape = rotateShape(active.shape)
  for (const dx of ROTATION_KICKS) {
    const placed = tryPlace(state, { ...active, shape, x: active.x + dx })
    if (placed) return placed
  }
  return state
}

function stepDown(state: GameState, active: Piece): GameState {
  return tryPlace(state, { ...active, y: active.y + 1 }) ?? lockActive(state, active)
}

function hardDrop(state: GameState, active: Piece): GameState {
  let piece = active
  while (!collides(state.board, { ...piece, y: piece.y + 1 })) {
    piece = { ...piece, y: piece.y + 1 }
  }
  return lockActive(state, piece)
}

/** Fija la pieza y decide si arranca una cascada o sale la pieza siguiente. */
function lockActive(state: GameState, piece: Piece): GameState {
  const board = lockPiece(state.board, piece)
  const next = { ...state, board, active: null, piecesLocked: state.piecesLocked + 1 }
  return findFullRows(board).length > 0
    ? { ...next, phase: 'cascading', chain: 1 }
    : spawnPiece(next)
}

/**
 * Un paso de cascada: quita las filas llenas, puntúa y deja caer los bloques.
 * Si eso completa filas nuevas, la cadena crece y el próximo tick las resuelve.
 */
function resolveCascadeStep(state: GameState): GameState {
  const rows = findFullRows(state.board)
  const board = applyGravity(removeRows(state.board, rows))
  const next = {
    ...state,
    board,
    score: state.score + scoreForClear(rows.length, state.chain),
    rowsCleared: state.rowsCleared + rows.length,
  }
  return findFullRows(board).length > 0
    ? { ...next, chain: state.chain + 1 }
    : spawnPiece({ ...next, chain: 0 })
}

/** Saca la pieza siguiente. Si no entra en el tablero, termina la partida. */
function spawnPiece(state: GameState): GameState {
  const { kind, bag, seed } = drawPiece(state.bag, state.seed)
  const piece = createPiece(kind, BOARD_WIDTH)
  const next = { ...state, bag, seed }
  return collides(state.board, piece)
    ? { ...next, active: null, phase: 'gameOver' }
    : { ...next, active: piece, phase: 'playing' }
}
