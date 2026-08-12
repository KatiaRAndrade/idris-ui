import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as Input from '../index'

describe('Input', () => {
  it('associa label e campo pelo mesmo id', () => {
    render(
      <Input.Root>
        <Input.Label>E-mail</Input.Label>
        <Input.Field />
      </Input.Root>
    )
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it('associa o Hint via aria-describedby', () => {
    render(
      <Input.Root>
        <Input.Label>E-mail</Input.Label>
        <Input.Field />
        <Input.Hint>Texto de ajuda</Input.Hint>
      </Input.Root>
    )
    const field = screen.getByLabelText('E-mail')
    const hint = screen.getByText('Texto de ajuda')
    expect(field).toHaveAttribute('aria-describedby', hint.id)
  })

  it('esconde o Hint e mostra o Error quando invalid', () => {
    render(
      <Input.Root invalid>
        <Input.Label>Senha</Input.Label>
        <Input.Field />
        <Input.Hint>Não deveria aparecer</Input.Hint>
        <Input.Error>Senha inválida</Input.Error>
      </Input.Root>
    )
    expect(screen.queryByText('Não deveria aparecer')).not.toBeInTheDocument()
    expect(screen.getByText('Senha inválida')).toHaveAttribute('role', 'alert')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('aria-invalid', 'true')
  })

  it('propaga disabled do Root pro Field', () => {
    render(
      <Input.Root disabled>
        <Input.Label>Cupom</Input.Label>
        <Input.Field />
      </Input.Root>
    )
    expect(screen.getByLabelText('Cupom')).toBeDisabled()
  })

  it('lança erro se uma parte for usada fora do Root', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Input.Field />)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Input.Root>
        <Input.Label>E-mail</Input.Label>
        <Input.Field placeholder="voce@exemplo.com" />
        <Input.Hint>Usamos isso só pra recuperação de conta.</Input.Hint>
      </Input.Root>
    )
    expect(container).toMatchSnapshot()
  })
})
