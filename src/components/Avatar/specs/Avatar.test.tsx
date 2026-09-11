import { render, screen, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { Avatar } from '../index'

/** O jsdom não carrega imagens de verdade — controlamos o Image global. */
function mockImage(resultado: 'load' | 'error', atraso = 0) {
  class FakeImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_valor: string) {
      setTimeout(() => {
        if (resultado === 'load') this.onload?.()
        else this.onerror?.()
      }, atraso)
    }
  }
  vi.stubGlobal('Image', FakeImage)
}

describe('Avatar', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('mostra o fallback imediatamente quando não há src', () => {
    render(
      <Avatar>
        <Avatar.Fallback>KA</Avatar.Fallback>
      </Avatar>
    )
    expect(screen.getByText('KA')).toBeInTheDocument()
  })

  it('mostra a imagem quando o carregamento dá certo', async () => {
    mockImage('load')
    render(
      <Avatar>
        <Avatar.Image src="/foto.jpg" alt="Ka" />
        <Avatar.Fallback>KA</Avatar.Fallback>
      </Avatar>
    )

    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(screen.getByRole('img', { name: 'Ka' })).toBeInTheDocument()
  })

  it('mostra o fallback imediatamente quando a imagem falha', async () => {
    mockImage('error')
    render(
      <Avatar>
        <Avatar.Image src="/quebrada.jpg" alt="Ka" />
        <Avatar.Fallback>KA</Avatar.Fallback>
      </Avatar>
    )

    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(screen.getByText('KA')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('segura o fallback durante o delay enquanto carrega', async () => {
    mockImage('load', 1000) // imagem lenta
    render(
      <Avatar>
        <Avatar.Image src="/lenta.jpg" alt="Ka" />
        <Avatar.Fallback delayMs={600}>KA</Avatar.Fallback>
      </Avatar>
    )

    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    expect(screen.queryByText('KA')).not.toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getByText('KA')).toBeInTheDocument()
  })

  it('mostra o fallback na hora com delayMs zero', () => {
    mockImage('load', 1000)
    render(
      <Avatar>
        <Avatar.Image src="/lenta.jpg" alt="Ka" />
        <Avatar.Fallback delayMs={0}>KA</Avatar.Fallback>
      </Avatar>
    )
    expect(screen.getByText('KA')).toBeInTheDocument()
  })

  it('expõe o data-state', async () => {
    mockImage('load')
    const { container } = render(
      <Avatar>
        <Avatar.Image src="/foto.jpg" alt="Ka" />
        <Avatar.Fallback>KA</Avatar.Fallback>
      </Avatar>
    )

    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(container.firstChild).toHaveAttribute('data-state', 'loaded')
  })

  it('lança erro se uma parte for usada fora do Avatar', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Avatar.Fallback>KA</Avatar.Fallback>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Avatar size="lg">
        <Avatar.Fallback>KA</Avatar.Fallback>
      </Avatar>
    )
    expect(container).toMatchSnapshot()
  })
})
