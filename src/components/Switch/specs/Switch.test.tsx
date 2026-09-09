import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from '../index'

describe('Switch', () => {
  it('alterna ao clicar, no modo não-controlado', async () => {
    render(
      <Switch aria-label="Notificações">
        <Switch.Thumb />
      </Switch>
    )
    const sw = screen.getByRole('switch', { name: 'Notificações' })

    expect(sw).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(sw).toHaveAttribute('data-state', 'checked')
  })

  it('no modo controlado, só avisa via onCheckedChange', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch aria-label="Tema" checked={false} onCheckedChange={onCheckedChange}>
        <Switch.Thumb />
      </Switch>
    )
    await userEvent.click(screen.getByRole('switch'))

    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('permite cancelar a mudança com preventDefault', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        aria-label="2FA"
        onCheckedChange={onCheckedChange}
        onClick={(e) => e.preventDefault()}
      >
        <Switch.Thumb />
      </Switch>
    )
    await userEvent.click(screen.getByRole('switch'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('ativa pelo teclado', async () => {
    render(
      <Switch aria-label="Notificações">
        <Switch.Thumb />
      </Switch>
    )
    await userEvent.tab()
    await userEvent.keyboard(' ')
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('envia o valor no FormData quando tem name', () => {
    const { container } = render(
      <form>
        <Switch aria-label="Marketing" name="marketing" value="sim" defaultChecked>
          <Switch.Thumb />
        </Switch>
      </form>
    )
    const form = container.querySelector('form')!
    expect(new FormData(form).get('marketing')).toBe('sim')
  })

  it('não alterna quando disabled', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch aria-label="Plano" disabled onCheckedChange={onCheckedChange}>
        <Switch.Thumb />
      </Switch>
    )
    await userEvent.click(screen.getByRole('switch'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('lança erro se o Thumb for usado fora do Switch', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Switch.Thumb />)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Switch aria-label="Notificações" defaultChecked size="md">
        <Switch.Thumb />
      </Switch>
    )
    expect(container).toMatchSnapshot()
  })
})
