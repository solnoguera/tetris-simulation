import { useEffect, useRef } from 'react'

/** Ejecuta `callback` cada `delayMs`. Con `null` el intervalo queda detenido. */
export function useInterval(callback: () => void, delayMs: number | null): void {
  const latestCallback = useRef(callback)

  useEffect(() => {
    latestCallback.current = callback
  })

  useEffect(() => {
    if (delayMs === null) return
    const id = setInterval(() => latestCallback.current(), delayMs)
    return () => clearInterval(id)
  }, [delayMs])
}
