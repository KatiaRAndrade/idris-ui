import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../index'

describe('Button', () => {
  it('renderiza label', () => {
    render(
      <Button>
        <Button.Label>Salvar</Button.Label>
      </Button>
    )
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('renderiza ícone + label dentro de Content', () => {
    render(
      <Button>
        <Button.Content>
          <Button.Icon>
            <svg data-testid="icon" />
          </Button.Icon>
          <Button.Label>Adicionar</Button.Label>
        </Button.Content>
      </Button>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Adicionar')).toBeInTheDocument()
  })

  it('Button.Icon dimensiona conforme o size', () => {
    render(
      <Button size="lg">
        <Button.Icon>
          <svg data-testid="icon" />
        </Button.Icon>
      </Button>
    )
    expect(screen.getByTestId('icon')).toHaveAttribute('width', '18')
  })

  it('lança erro se Button.Label for usado fora de <Button>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Button.Label>Solto</Button.Label>)).toThrow()
    spy.mockRestore()
  })

  it('dispara onClick', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick}>
        <Button.Label>Clique</Button.Label>
      </Button>
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('fica desabilitado quando loading', () => {
    render(
      <Button loading>
        <Button.Label>Enviar</Button.Label>
      </Button>
    )
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button')).toHaveAttribute('data-loading', 'true')
  })

  it('não dispara onClick quando disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        <Button.Label>Enviar</Button.Label>
      </Button>
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Button variant="primary">
        <Button.Label>Salvar</Button.Label>
      </Button>
    )
    expect(container).toMatchSnapshot()
  })
})
