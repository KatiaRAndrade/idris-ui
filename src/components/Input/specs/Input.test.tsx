import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('Input.Textarea', () => {
  it('associa label e textarea pelo mesmo id', () => {
    render(
      <Input.Root>
        <Input.Label>Descrição</Input.Label>
        <Input.Textarea />
      </Input.Root>
    )
    expect(screen.getByLabelText('Descrição').tagName).toBe('TEXTAREA')
  })

  it('herda invalid do Root e registra o Error no describedby', () => {
    render(
      <Input.Root invalid>
        <Input.Label>Motivo</Input.Label>
        <Input.Textarea />
        <Input.Error>Muito curto</Input.Error>
      </Input.Root>
    )
    const field = screen.getByLabelText('Motivo')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAttribute('aria-describedby', screen.getByText('Muito curto').id)
  })

  it('propaga disabled do Root', () => {
    render(
      <Input.Root disabled>
        <Input.Label>Notas</Input.Label>
        <Input.Textarea />
      </Input.Root>
    )
    expect(screen.getByLabelText('Notas')).toBeDisabled()
  })

  it('usa rows=3 por padrão', () => {
    render(
      <Input.Root>
        <Input.Label>Notas</Input.Label>
        <Input.Textarea />
      </Input.Root>
    )
    expect(screen.getByLabelText('Notas')).toHaveAttribute('rows', '3')
  })

  it('ajusta a altura ao digitar quando autoResize', async () => {
    render(
      <Input.Root>
        <Input.Label>Comentário</Input.Label>
        <Input.Textarea autoResize />
      </Input.Root>
    )
    const field = screen.getByLabelText('Comentário') as HTMLTextAreaElement

    // jsdom não calcula layout, então scrollHeight é 0 — mockamos pra testar
    // que a altura É escrita, não qual valor exato ela recebe
    Object.defineProperty(field, 'scrollHeight', { configurable: true, value: 120 })
    await userEvent.type(field, 'texto')

    expect(field.style.height).toBe('120px')
  })

  it('lança erro se usada fora do Root', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Input.Textarea />)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Input.Root>
        <Input.Label>Descrição</Input.Label>
        <Input.Textarea rows={4} />
      </Input.Root>
    )
    expect(container).toMatchSnapshot()
  })
})
