import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { usePresence } from '../usePresence'

function Caixa({ open, duration }: { open: boolean; duration: string }) {
  const { isPresent, ref } = usePresence(open)
  if (!isPresent) return null
  return (
    <div
      ref={ref}
      data-testid="caixa"
      data-state={open ? 'open' : 'closed'}
      style={{ transitionDuration: duration }}
    >
      conteúdo
    </div>
  )
}

describe('usePresence', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('monta quando present vira true', () => {
    const { rerender } = render(<Caixa open={false} duration="0s" />)
    expect(screen.queryByTestId('caixa')).not.toBeInTheDocument()

    rerender(<Caixa open duration="0s" />)
    expect(screen.getByTestId('caixa')).toBeInTheDocument()
  })

  it('desmonta na hora quando não há transição', () => {
    const { rerender } = render(<Caixa open duration="0s" />)
    rerender(<Caixa open={false} duration="0s" />)

    expect(screen.queryByTestId('caixa')).not.toBeInTheDocument()
  })

  it('mantém montado com data-state=closed durante a saída', () => {
    const { rerender } = render(<Caixa open duration="0.25s" />)
    rerender(<Caixa open={false} duration="0.25s" />)

    const caixa = screen.getByTestId('caixa')
    expect(caixa).toBeInTheDocument()
    expect(caixa).toHaveAttribute('data-state', 'closed')
  })

  it('desmonta ao receber transitionend do próprio nó', () => {
    const { rerender } = render(<Caixa open duration="0.25s" />)
    rerender(<Caixa open={false} duration="0.25s" />)

    const caixa = screen.getByTestId('caixa')
    act(() => {
      caixa.dispatchEvent(new Event('transitionend', { bubbles: true }))
    })

    expect(screen.queryByTestId('caixa')).not.toBeInTheDocument()
  })

  it('desmonta pelo timeout se o evento nunca chegar', () => {
    const { rerender } = render(<Caixa open duration="0.25s" />)
    rerender(<Caixa open={false} duration="0.25s" />)

    expect(screen.getByTestId('caixa')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(300))
    expect(screen.queryByTestId('caixa')).not.toBeInTheDocument()
  })

  it('cancela a saída se reabrir no meio', () => {
    const { rerender } = render(<Caixa open duration="0.25s" />)
    rerender(<Caixa open={false} duration="0.25s" />)
    rerender(<Caixa open duration="0.25s" />)

    act(() => vi.advanceTimersByTime(300))
    expect(screen.getByTestId('caixa')).toBeInTheDocument()
    expect(screen.getByTestId('caixa')).toHaveAttribute('data-state', 'open')
  })

  it('ignora transitionend vindo de um filho', () => {
    function ComFilho({ open }: { open: boolean }) {
      const { isPresent, ref } = usePresence(open)
      if (!isPresent) return null
      return (
        <div ref={ref} data-testid="pai" style={{ transitionDuration: '0.25s' }}>
          <span data-testid="filho" />
        </div>
      )
    }

    const { rerender } = render(<ComFilho open />)
    rerender(<ComFilho open={false} />)

    act(() => {
      screen.getByTestId('filho').dispatchEvent(new Event('transitionend', { bubbles: true }))
    })

    expect(screen.getByTestId('pai')).toBeInTheDocument()
  })
})
