import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DismissableLayer } from '../DismissableLayer'

describe('DismissableLayer', () => {
  it('chama onDismiss no Escape', async () => {
    const onDismiss = vi.fn()
    render(<DismissableLayer onDismiss={onDismiss}>conteúdo</DismissableLayer>)

    await userEvent.keyboard('{Escape}')
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('chama onDismiss no clique fora, não no clique dentro', async () => {
    const onDismiss = vi.fn()
    render(
      <>
        <button>fora</button>
        <DismissableLayer onDismiss={onDismiss}>
          <button>dentro</button>
        </DismissableLayer>
      </>
    )

    await userEvent.click(screen.getByText('dentro'))
    expect(onDismiss).not.toHaveBeenCalled()

    await userEvent.click(screen.getByText('fora'))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('só a camada do topo reage ao Escape', async () => {
    const onDismissBase = vi.fn()
    const onDismissTopo = vi.fn()
    render(
      <DismissableLayer onDismiss={onDismissBase}>
        <DismissableLayer onDismiss={onDismissTopo}>topo</DismissableLayer>
      </DismissableLayer>
    )

    await userEvent.keyboard('{Escape}')
    expect(onDismissTopo).toHaveBeenCalledOnce()
    expect(onDismissBase).not.toHaveBeenCalled()
  })

  it('não fecha no clique fora quando disableOutsidePointerDown', async () => {
    const onDismiss = vi.fn()
    render(
      <>
        <button>fora</button>
        <DismissableLayer onDismiss={onDismiss} disableOutsidePointerDown>
          conteúdo
        </DismissableLayer>
      </>
    )

    await userEvent.click(screen.getByText('fora'))
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('permite cancelar via preventDefault', async () => {
    const onDismiss = vi.fn()
    render(
      <DismissableLayer onDismiss={onDismiss} onEscapeKeyDown={(e) => e.preventDefault()}>
        conteúdo
      </DismissableLayer>
    )

    await userEvent.keyboard('{Escape}')
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
