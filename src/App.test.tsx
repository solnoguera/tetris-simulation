import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { TICK_DELAY_MS } from './game/config'

const press = (code: string) => fireEvent.keyDown(window, { code })

/** Índices de las celdas ocupadas, para comparar posiciones. */
function occupiedCells(container: HTMLElement): number[] {
  const cells = [...container.querySelectorAll('.cell')]
  return cells.flatMap((cell, index) => (cell.hasAttribute('data-kind') ? [index] : []))
}

function lockSoundPlays(): number {
  const audios = vi.mocked(HTMLMediaElement.prototype.play).mock.contexts as HTMLMediaElement[]
  return audios.filter((audio) => audio.src.endsWith('fallen-piece.mp3')).length
}

function dropUntilGameOver() {
  for (let i = 0; i < 40 && !screen.queryByRole('alert'); i++) press('Space')
}

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra el título, el tablero y el puntaje inicial', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Derrumbe' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Tablero de juego' })).toBeInTheDocument()
    expect(screen.getByText('Puntaje').nextSibling).toHaveTextContent('0')
  })

  it('la pieza responde al teclado', () => {
    const { container } = render(<App />)
    const start = occupiedCells(container)
    press('ArrowLeft')
    expect(occupiedCells(container)).toEqual(start.map((index) => index - 1))
  })

  it('la pieza cae sola con el paso del tiempo', () => {
    const { container } = render(<App />)
    const start = occupiedCells(container)
    act(() => {
      vi.advanceTimersByTime(TICK_DELAY_MS.playing!)
    })
    expect(occupiedCells(container)).toEqual(start.map((index) => index + 10))
  })

  it('mantener apretado el espacio no suelta varias piezas', () => {
    const { container } = render(<App />)
    press('Space')
    const afterDrop = occupiedCells(container)
    fireEvent.keyDown(window, { code: 'Space', repeat: true })
    expect(occupiedCells(container)).toEqual(afterDrop)
  })

  it('muestra el fin de la partida y reinicia con el botón', () => {
    render(<App />)
    dropUntilGameOver()
    expect(screen.getByRole('alert')).toHaveTextContent('Se vino abajo')

    fireEvent.click(screen.getByRole('button', { name: 'Jugar de nuevo' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('P pausa y reanuda la caída', () => {
    const { container } = render(<App />)
    press('KeyP')
    expect(screen.getByRole('status')).toHaveTextContent('Pausa')

    const start = occupiedCells(container)
    act(() => {
      vi.advanceTimersByTime(TICK_DELAY_MS.playing! * 3)
    })
    press('ArrowLeft')
    expect(occupiedCells(container)).toEqual(start)

    press('KeyP')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(TICK_DELAY_MS.playing!)
    })
    expect(occupiedCells(container)).toEqual(start.map((index) => index + 10))
  })

  it('el botón Seguir reanuda la partida', () => {
    render(<App />)
    press('KeyP')
    fireEvent.click(screen.getByRole('button', { name: 'Seguir' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('suena al fijar una pieza, y no al moverla', () => {
    render(<App />)
    press('ArrowLeft')
    expect(lockSoundPlays()).toBe(0)

    press('Space')
    expect(lockSoundPlays()).toBe(1)
    press('Space')
    expect(lockSoundPlays()).toBe(2)
  })

  it('el botón pausa y reanuda la música', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Pausar música' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pausar música' }))
    expect(screen.getByRole('button', { name: 'Reproducir música' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reproducir música' }))
    expect(screen.getByRole('button', { name: 'Pausar música' })).toBeInTheDocument()
  })

  it('si el navegador bloquea el audio, la música arranca con la primera tecla', () => {
    const play = vi.mocked(HTMLMediaElement.prototype.play)
    const realPlay = play.getMockImplementation()!
    play.mockRejectedValue(new DOMException('bloqueado', 'NotAllowedError'))
    render(<App />)
    expect(screen.getByRole('button', { name: 'Reproducir música' })).toBeInTheDocument()

    play.mockImplementation(realPlay)
    press('ArrowLeft')
    expect(screen.getByRole('button', { name: 'Pausar música' })).toBeInTheDocument()
  })

  it('la música pausada con el botón no vuelve con la primera tecla', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Pausar música' }))
    press('ArrowLeft')
    expect(screen.getByRole('button', { name: 'Reproducir música' })).toBeInTheDocument()
  })

  it('Enter reinicia solo cuando terminó la partida', () => {
    const { container } = render(<App />)
    press('Space')
    const beforeEnter = occupiedCells(container)
    press('Enter')
    expect(occupiedCells(container)).toEqual(beforeEnter)

    dropUntilGameOver()
    press('Enter')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
