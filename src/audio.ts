export function createAudio(file: string, options: { loop?: boolean; volume?: number } = {}) {
  const audio = new Audio(`${import.meta.env.BASE_URL}${file}`)
  audio.loop = options.loop ?? false
  audio.volume = options.volume ?? 1
  return audio
}

/** El navegador rechaza `play()` hasta que hay una interacción: ese caso no es un error. */
export function playAudio(audio: HTMLAudioElement): void {
  audio.play().catch(() => {})
}

/** Reproduce desde el principio, aunque el sonido anterior no haya terminado. */
export function replayAudio(audio: HTMLAudioElement): void {
  audio.currentTime = 0
  playAudio(audio)
}
