interface HudProps {
  score: number
  rowsCleared: number
  chain: number
}

export function Hud({ score, rowsCleared, chain }: HudProps) {
  return (
    <dl className="hud">
      <div className="hud__stat">
        <dt>Puntaje</dt>
        <dd>{score}</dd>
      </div>
      <div className="hud__stat">
        <dt>Filas</dt>
        <dd>{rowsCleared}</dd>
      </div>
      <div className="hud__stat">
        <dt>Cadena</dt>
        <dd className={chain > 1 ? 'hud__chain--active' : undefined}>
          {chain > 0 ? `x${chain}` : '–'}
        </dd>
      </div>
    </dl>
  )
}
