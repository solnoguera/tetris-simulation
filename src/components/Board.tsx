import type { CSSProperties } from 'react'
import { findFullRows, lockPiece } from '../game/board'
import type { Piece } from '../game/pieces'
import type { Board as BoardData, GamePhase } from '../game/types'

interface BoardProps {
  board: BoardData
  active: Piece | null
  phase: GamePhase
}

export function Board({ board, active, phase }: BoardProps) {
  const visibleBoard = active ? lockPiece(board, active) : board
  const collapsingRows = phase === 'cascading' ? findFullRows(board) : []

  return (
    <div
      className="board"
      role="img"
      aria-label="Tablero de juego"
      style={{ '--columns': board[0].length, '--rows': board.length } as CSSProperties}
    >
      {visibleBoard.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={collapsingRows.includes(rowIndex) ? 'cell cell--collapsing' : 'cell'}
            data-kind={cell ?? undefined}
          />
        )),
      )}
    </div>
  )
}
