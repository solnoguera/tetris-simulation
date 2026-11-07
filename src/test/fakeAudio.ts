import { vi } from 'vitest'

/** jsdom no reproduce audio: este reemplazo imita `play`, `pause` y `paused`. */
export function installFakeAudio(): void {
  const playing = new WeakSet<HTMLMediaElement>()

  vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    return !playing.has(this)
  })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(async function (
    this: HTMLMediaElement,
  ) {
    playing.add(this)
    this.dispatchEvent(new Event('play'))
  })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    playing.delete(this)
    this.dispatchEvent(new Event('pause'))
  })
}
