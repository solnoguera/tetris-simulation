import { useEffect, useRef } from 'react'

export interface KeyBinding {
  run: () => void
  /** Si es true, la acción se repite mientras la tecla sigue apretada. */
  repeat?: boolean
}

/** Asocia teclas a acciones. Las claves son valores de `KeyboardEvent.code`. */
export function useKeyboard(bindings: Record<string, KeyBinding>): void {
  const latestBindings = useRef(bindings)

  useEffect(() => {
    latestBindings.current = bindings
  })

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const binding = latestBindings.current[event.code]
      if (!binding) return
      event.preventDefault() // Evita que las flechas y el espacio muevan la página.
      if (event.repeat && !binding.repeat) return
      binding.run()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
