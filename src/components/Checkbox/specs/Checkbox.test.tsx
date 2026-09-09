import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from '../index'

describe('Checkbox', () => {
  it('alterna ao clicar, no modo não-controlado', async () => {
    render(
      <Checkbox aria-label="Aceitar">
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    const box = screen.getByRole('checkbox', { name: 'Aceitar' })

    expect(box).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(box)
    expect(box).toHaveAttribute('aria-checked', 'true')
  })

  it('não muda sozinho no modo controlado', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Checkbox aria-label="Aceitar" checked={false} onCheckedChange={onCheckedChange}>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    const box = screen.getByRole('checkbox')

    await userEvent.click(box)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(box).toHaveAttribute('aria-checked', 'false')
  })

  it('expõe o estado indeterminado como aria-checked="mixed"', () => {
    render(
      <Checkbox aria-label="Todos" checked="indeterminate">
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed')
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'indeterminate')
  })

  it('indeterminado vira marcado ao clicar', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Checkbox aria-label="Todos" defaultChecked="indeterminate" onCheckedChange={onCheckedChange}>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('esconde o Indicator quando desmarcado', () => {
    render(
      <Checkbox aria-label="Aceitar">
        <Checkbox.Indicator>marcado</Checkbox.Indicator>
      </Checkbox>
    )
    expect(screen.queryByText('marcado')).not.toBeInTheDocument()
  })

  it('ativa com a tecla Space', async () => {
    render(
      <Checkbox aria-label="Aceitar">
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    await userEvent.tab()
    await userEvent.keyboard(' ')
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')
  })

  it('envia o valor no FormData quando tem name', () => {
    const { container } = render(
      <form>
        <Checkbox aria-label="Newsletter" name="newsletter" value="sim" defaultChecked>
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox>
      </form>
    )
    const form = container.querySelector('form')!
    expect(new FormData(form).get('newsletter')).toBe('sim')
  })

  it('não dispara quando disabled', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Checkbox aria-label="Aceitar" disabled onCheckedChange={onCheckedChange}>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('lança erro se o Indicator for usado fora do Checkbox', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Checkbox.Indicator>Solto</Checkbox.Indicator>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Checkbox aria-label="Aceitar" defaultChecked size="md">
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    expect(container).toMatchSnapshot()
  })
})
