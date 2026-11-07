import { describe, expect, it } from 'vitest'
import { boardFrom, bottomRows } from '../test/boardFrom'
import { findFullRows } from './board'
import { BOARD_HEIGHT, BOARD_WIDTH, POINTS_PER_ROW, TICK_DELAY_MS } from './config'
import { PIECE_SHAPES, type Piece } from './pieces'
import { createInitialState, gameReducer, tickDelay } from './reducer'
import type { Board, GameAction, GameState } from './types'

const VERTICAL_ROD3 = [[1], [1], [1]]
const FILLED_BOARD_ROW = '#'.repeat(BOARD_WIDTH)

function stateWith(board: Board, active: Piece): GameState {
  return { ...createInitialState(1), board, active }
}

function run(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce(gameReducer, state)
}

describe('createInitialState', () => {
  it('arranca en juego, con tablero vacío y una pieza activa', () => {
    const state = createInitialState(1)
    expect(state.phase).toBe('playing')
    expect(state.active).not.toBeNull()
    expect(state.score).toBe(0)
    expect(state.board.flat().every((cell) => cell === null)).toBe(true)
  })
})

describe('movimiento', () => {
  const piece: Piece = { kind: 'square', shape: PIECE_SHAPES.square, x: 0, y: 5 }

  it('mueve la pieza hacia los costados', () => {
    const state = run(stateWith(boardFrom([]), piece), { type: 'move', dx: 1 })
    expect(state.active?.x).toBe(1)
  })

  it('no atraviesa las paredes', () => {
    const state = stateWith(boardFrom([]), piece)
    expect(gameReducer(state, { type: 'move', dx: -1 })).toBe(state)
  })

  it('no atraviesa bloques', () => {
    const atFloor = { ...piece, y: BOARD_HEIGHT - 2 }
    const state = stateWith(boardFrom(['..#.......']), atFloor)
    expect(gameReducer(state, { type: 'move', dx: 1 })).toBe(state)
  })
})

describe('rotación', () => {
  const rod: Piece = { kind: 'rod4', shape: PIECE_SHAPES.rod4, x: 3, y: 5 }

  it('rota la pieza', () => {
    const state = run(stateWith(boardFrom([]), rod), { type: 'rotate' })
    expect(state.active?.shape).not.toEqual(rod.shape)
    expect(state.active?.x).toBe(rod.x)
  })

  it.each([
    ['izquierda', -2, 0],
    ['derecha', BOARD_WIDTH - 3, BOARD_WIDTH - 4],
  ])('se despega de la pared %s si no entra', (_, x, expectedX) => {
    const vertical = run(stateWith(boardFrom([]), rod), { type: 'rotate' }).active as Piece
    const state = run(stateWith(boardFrom([]), { ...vertical, x }), { type: 'rotate' })
    expect(state.active?.shape).not.toEqual(vertical.shape)
    expect(state.active?.x).toBe(expectedX)
  })

  it('no rota si no hay lugar', () => {
    const walls = Array.from({ length: BOARD_HEIGHT }, () => '####.#####')
    const vertical = run(stateWith(boardFrom([]), rod), { type: 'rotate' }).active as Piece
    const state = stateWith(boardFrom(walls), { ...vertical, x: 2 })
    expect(gameReducer(state, { type: 'rotate' })).toBe(state)
  })
})

describe('caída', () => {
  const piece: Piece = { kind: 'square', shape: PIECE_SHAPES.square, x: 0, y: 0 }

  it.each(['tick', 'softDrop'] as const)('%s baja la pieza una fila', (type) => {
    expect(run(stateWith(boardFrom([]), piece), { type }).active?.y).toBe(1)
  })

  it('fija la pieza al tocar el piso y saca otra', () => {
    const atFloor = { ...piece, y: BOARD_HEIGHT - 2 }
    const state = run(stateWith(boardFrom([]), atFloor), { type: 'tick' })
    expect(bottomRows(state.board, 2)).toEqual(['##........', '##........'])
    expect(state.active?.y).toBeLessThanOrEqual(0)
    expect(state.phase).toBe('playing')
  })

  it('la caída directa fija la pieza sobre lo que encuentre', () => {
    const state = run(stateWith(boardFrom(['#.........']), piece), { type: 'hardDrop' })
    expect(bottomRows(state.board, 3)).toEqual(['##........', '##........', '#.........'])
  })
})

describe('cascada', () => {
  const rodOverColumn0: Piece = { kind: 'rod3', shape: VERTICAL_ROD3, x: 0, y: 0 }

  it('sin filas llenas no hay cascada ni gravedad', () => {
    const floating = boardFrom(['.#........', '..........'])
    const state = run(stateWith(floating, rodOverColumn0), { type: 'hardDrop' })
    expect(state.phase).toBe('playing')
    expect(bottomRows(state.board, 2)[0]).toBe('##........')
  })

  it('mantiene la fila llena en el tablero hasta el siguiente tick', () => {
    const board = boardFrom(['.#########'])
    const state = run(stateWith(board, rodOverColumn0), { type: 'hardDrop' })
    expect(state.phase).toBe('cascading')
    expect(state.chain).toBe(1)
    expect(state.active).toBeNull()
    expect(findFullRows(state.board)).toEqual([BOARD_HEIGHT - 1])
    expect(state.score).toBe(0)
  })

  it('resuelve una fila, puntúa y vuelve a jugar', () => {
    const board = boardFrom(['.#########'])
    const state = run(stateWith(board, rodOverColumn0), { type: 'hardDrop' }, { type: 'tick' })
    expect(state.phase).toBe('playing')
    expect(state.chain).toBe(0)
    expect(state.active).not.toBeNull()
    expect(state.score).toBe(POINTS_PER_ROW)
    expect(state.rowsCleared).toBe(1)
    expect(bottomRows(state.board, 3)).toEqual(['..........', '#.........', '#.........'])
  })

  it('encadena filas que se completan por gravedad, con multiplicador', () => {
    // El bloque de la columna 9 cae al limpiar la fila del medio y completa la de abajo.
    const board = boardFrom(['.........#', '.#########', '#########.'])
    const dropped = run(stateWith(board, rodOverColumn0), { type: 'hardDrop' })
    expect(dropped.chain).toBe(1)

    const firstStep = run(dropped, { type: 'tick' })
    expect(firstStep.phase).toBe('cascading')
    expect(firstStep.chain).toBe(2)
    expect(firstStep.score).toBe(POINTS_PER_ROW)
    expect(bottomRows(firstStep.board, 1)).toEqual([FILLED_BOARD_ROW])

    const secondStep = run(firstStep, { type: 'tick' })
    expect(secondStep.phase).toBe('playing')
    expect(secondStep.chain).toBe(0)
    expect(secondStep.score).toBe(POINTS_PER_ROW + POINTS_PER_ROW * 2)
    expect(secondStep.rowsCleared).toBe(2)
    expect(bottomRows(secondStep.board, 3)).toEqual(['..........', '#.........', '#.........'])
  })

  it('puntúa varias filas limpiadas en un mismo paso', () => {
    const board = boardFrom(['.#########', '.#########', '#.........'])
    const piece: Piece = { kind: 'rod3', shape: [[1], [1]], x: 0, y: 0 }
    const state = run(stateWith(board, piece), { type: 'hardDrop' }, { type: 'tick' })
    expect(state.score).toBe(2 * POINTS_PER_ROW)
    expect(state.rowsCleared).toBe(2)
  })

  it.each<GameAction>([
    { type: 'move', dx: 1 },
    { type: 'rotate' },
    { type: 'softDrop' },
    { type: 'hardDrop' },
  ])('ignora $type durante la cascada', (action) => {
    const cascading = run(stateWith(boardFrom(['.#########']), rodOverColumn0), { type: 'hardDrop' })
    expect(gameReducer(cascading, action)).toBe(cascading)
  })
})

describe('fin de la partida', () => {
  const column = Array.from({ length: BOARD_HEIGHT }, () => '...####...')
  const dot: Piece = { kind: 'square', shape: [[1]], x: 0, y: 0 }
  const over = () => run(stateWith(boardFrom(column), dot), { type: 'hardDrop' })

  it('termina cuando la pieza siguiente no entra', () => {
    const state = over()
    expect(state.phase).toBe('gameOver')
    expect(state.active).toBeNull()
  })

  it.each<GameAction>([{ type: 'tick' }, { type: 'move', dx: 1 }, { type: 'hardDrop' }])(
    'ignora $type',
    (action) => {
      const state = over()
      expect(gameReducer(state, action)).toBe(state)
    },
  )

  it('restart arranca una partida nueva con la semilla recibida', () => {
    const state = run({ ...over(), score: 500 }, { type: 'restart', seed: 9 })
    expect(state).toEqual(createInitialState(9))
  })
})

describe('pausa', () => {
  const piece: Piece = { kind: 'square', shape: PIECE_SHAPES.square, x: 0, y: 0 }
  const paused = () => run(stateWith(boardFrom([]), piece), { type: 'togglePause' })

  it('congela el tick y los controles', () => {
    const state = paused()
    for (const action of [
      { type: 'tick' },
      { type: 'move', dx: 1 },
      { type: 'rotate' },
      { type: 'softDrop' },
      { type: 'hardDrop' },
    ] satisfies GameAction[]) {
      expect(gameReducer(state, action)).toBe(state)
    }
  })

  it('al seguir, la pieza responde otra vez', () => {
    const state = run(paused(), { type: 'togglePause' }, { type: 'tick' })
    expect(state.paused).toBe(false)
    expect(state.active?.y).toBe(1)
  })

  it('detiene el bucle mientras dura', () => {
    expect(tickDelay(stateWith(boardFrom([]), piece))).toBe(TICK_DELAY_MS.playing)
    expect(tickDelay(paused())).toBeNull()
  })

  it('una cascada pausada sigue en el mismo paso', () => {
    const rod: Piece = { kind: 'rod3', shape: VERTICAL_ROD3, x: 0, y: 0 }
    const cascading = run(stateWith(boardFrom(['.#########']), rod), { type: 'hardDrop' })
    const frozen = run(cascading, { type: 'togglePause' }, { type: 'tick' })
    expect(frozen.score).toBe(0)
    expect(frozen.phase).toBe('cascading')

    const resumed = run(frozen, { type: 'togglePause' }, { type: 'tick' })
    expect(resumed.score).toBe(POINTS_PER_ROW)
    expect(resumed.phase).toBe('playing')
  })

  it('no aplica después del fin de la partida', () => {
    const column = Array.from({ length: BOARD_HEIGHT }, () => '...####...')
    const dot: Piece = { kind: 'square', shape: [[1]], x: 0, y: 0 }
    const over = run(stateWith(boardFrom(column), dot), { type: 'hardDrop' })
    expect(gameReducer(over, { type: 'togglePause' })).toBe(over)
  })
})

describe('piezas fijadas', () => {
  const piece: Piece = { kind: 'square', shape: PIECE_SHAPES.square, x: 0, y: 0 }

  it('cuenta una por cada pieza que se fija, y no por moverla', () => {
    const state = stateWith(boardFrom([]), piece)
    expect(run(state, { type: 'tick' }, { type: 'move', dx: 1 }).piecesLocked).toBe(0)
    expect(run(state, { type: 'hardDrop' }).piecesLocked).toBe(1)
    expect(run(state, { type: 'hardDrop' }, { type: 'hardDrop' }).piecesLocked).toBe(2)
  })
})

describe('determinismo', () => {
  it('la misma semilla y las mismas acciones dan el mismo estado', () => {
    const actions: GameAction[] = [
      { type: 'move', dx: 1 },
      { type: 'hardDrop' },
      { type: 'rotate' },
      { type: 'tick' },
      { type: 'hardDrop' },
    ]
    expect(run(createInitialState(5), ...actions)).toEqual(run(createInitialState(5), ...actions))
  })
})
