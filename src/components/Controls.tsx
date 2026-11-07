const CONTROLS = [
  { keys: '← →', label: 'Mover' },
  { keys: '↑', label: 'Rotar' },
  { keys: '↓', label: 'Bajar' },
  { keys: 'Espacio', label: 'Soltar' },
  { keys: 'P', label: 'Pausa' },
]

export function Controls() {
  return (
    <ul className="controls">
      {CONTROLS.map(({ keys, label }) => (
        <li key={label}>
          <kbd>{keys}</kbd>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  )
}
