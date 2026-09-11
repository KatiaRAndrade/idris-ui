import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from '../index'

describe('Alert', () => {
  it('não cria região viva por padrão', () => {
    render(
      <Alert variant="warning">
        <Alert.Title>Aviso</Alert.Title>
      </Alert>
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('Aviso')).toBeInTheDocument()
  })

  it('usa role="alert" quando live é assertive', () => {
    render(
      <Alert variant="error" live="assertive">
        <Alert.Title>Erro</Alert.Title>
      </Alert>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('usa role="status" quando live é polite', () => {
    render(
      <Alert variant="success" live="polite">
        <Alert.Title>Salvo</Alert.Title>
      </Alert>
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('aplica o data-variant', () => {
    const { container } = render(
      <Alert variant="error">
        <Alert.Title>Erro</Alert.Title>
      </Alert>
    )
    expect(container.firstChild).toHaveAttribute('data-variant', 'error')
  })

  it('renderiza o ícone passado como aria-hidden e dimensionado', () => {
    const { container } = render(
      <Alert variant="success">
        <Alert.Icon>
          <svg data-testid="custom" />
        </Alert.Icon>
        <Alert.Title>Salvo</Alert.Title>
      </Alert>
    )
    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '16')
  })

  it('chama onClose ao clicar em Alert.Close', async () => {
    const onClose = vi.fn()
    render(
      <Alert variant="info" onClose={onClose}>
        <Alert.Title>Novidade</Alert.Title>
        <Alert.Close>×</Alert.Close>
      </Alert>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('Description aceita conteúdo rico sem quebrar o HTML', () => {
    const { container } = render(
      <Alert variant="error">
        <Alert.Description>
          <ul>
            <li>Erro um</li>
          </ul>
        </Alert.Description>
      </Alert>
    )
    // Um <p> teria expulsado a <ul> pra fora na hora do parse
    expect(container.querySelector('ul li')).toBeInTheDocument()
  })

  it('lança erro se uma parte for usada fora do Alert', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Alert.Title>Solto</Alert.Title>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Alert variant="warning">
        <div className="flex flex-col gap-1">
          <Alert.Title>Atenção</Alert.Title>
          <Alert.Description>Detalhes do aviso.</Alert.Description>
        </div>
      </Alert>
    )
    expect(container).toMatchSnapshot()
  })
})
