import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Badge } from '../index'

describe('Badge', () => {
  it('renderiza o label', () => {
    render(
      <Badge variant="success">
        <Badge.Label>Ativo</Badge.Label>
      </Badge>
    )
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('aplica o data-variant correto', () => {
    render(
      <Badge variant="error">
        <Badge.Label>Erro</Badge.Label>
      </Badge>
    )
    expect(screen.getByText('Erro').closest('[data-variant]')).toHaveAttribute(
      'data-variant',
      'error'
    )
  })

  it('Badge.Icon dimensiona conforme o size', () => {
    render(
      <Badge size="sm">
        <Badge.Icon>
          <svg data-testid="icon" />
        </Badge.Icon>
      </Badge>
    )
    const icon = screen.getByTestId('icon')
    expect(icon).toHaveAttribute('width', '10')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('asChild renderiza como o elemento filho (ex: button)', () => {
    render(
      <Badge asChild>
        <button type="button">
          <Badge.Label>Remover</Badge.Label>
        </button>
      </Badge>
    )
    expect(screen.getByRole('button', { name: 'Remover' })).toBeInTheDocument()
  })

  it('lança erro se uma parte for usada fora do Badge', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Badge.Label>Solto</Badge.Label>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Badge variant="brand" size="md">
        <Badge.Label>Novo</Badge.Label>
      </Badge>
    )
    expect(container).toMatchSnapshot()
  })
})
