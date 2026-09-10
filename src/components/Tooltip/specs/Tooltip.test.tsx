import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tooltip } from '../index'

function renderTooltip(props: React.ComponentProps<typeof Tooltip> = {}) {
  return render(
    <Tooltip delay={0} {...props}>
      <Tooltip.Trigger>
        <button type="button">Ajuda</button>
      </Tooltip.Trigger>
      <Tooltip.Content>Texto de ajuda</Tooltip.Content>
    </Tooltip>
  )
}

describe('Tooltip', () => {
  it('não renderiza o conteúdo quando fechado', () => {
    renderTooltip()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('mostra o conteúdo ao passar o mouse', async () => {
    const user = userEvent.setup()
    renderTooltip()
    await user.hover(screen.getByRole('button', { name: 'Ajuda' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Texto de ajuda')
  })

  it('esconde o conteúdo ao remover o mouse', async () => {
    const user = userEvent.setup()
    renderTooltip()
    const trigger = screen.getByRole('button', { name: 'Ajuda' })
    await user.hover(trigger)
    await screen.findByRole('tooltip')
    await user.unhover(trigger)
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
  })

  it('mostra ao focar e conecta aria-describedby ao trigger', async () => {
    const user = userEvent.setup()
    renderTooltip()
    await user.tab()
    const tooltip = await screen.findByRole('tooltip')
    expect(screen.getByRole('button', { name: 'Ajuda' })).toHaveAttribute(
      'aria-describedby',
      tooltip.id
    )
  })

  it('respeita defaultOpen', () => {
    renderTooltip({ defaultOpen: true })
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('aplica o data-side no conteúdo', () => {
    renderTooltip({ defaultOpen: true, side: 'right' })
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-side', 'right')
  })

  it('Tooltip.Arrow não renderiza quando fechado', () => {
    render(
      <Tooltip delay={0} side="left">
        <Tooltip.Trigger>
          <button type="button">Ajuda</button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          Texto
          <Tooltip.Arrow data-testid="arrow" />
        </Tooltip.Content>
      </Tooltip>
    )
    expect(screen.queryByTestId('arrow')).not.toBeInTheDocument()
  })

  it('Tooltip.Arrow renderiza com o mesmo data-side do Content quando aberto', () => {
    render(
      <Tooltip delay={0} side="left" defaultOpen>
        <Tooltip.Trigger>
          <button type="button">Ajuda</button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          Texto
          <Tooltip.Arrow data-testid="arrow" />
        </Tooltip.Content>
      </Tooltip>
    )
    expect(screen.getByTestId('arrow')).toHaveAttribute('data-side', 'left')
  })

  it('lança erro se uma parte for usada fora do Tooltip', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Tooltip.Content>Solto</Tooltip.Content>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = renderTooltip({ defaultOpen: true, side: 'bottom' })
    expect(container).toMatchSnapshot()
  })
})
