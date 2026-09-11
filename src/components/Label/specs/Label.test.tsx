import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Label } from '../index'
import { Checkbox } from '../../Checkbox'

describe('Label', () => {
  it('renderiza como <label>', () => {
    render(<Label>E-mail</Label>)
    expect(screen.getByText('E-mail').tagName).toBe('LABEL')
  })

  it('associa ao controle via htmlFor', () => {
    render(
      <>
        <Label htmlFor="campo">E-mail</Label>
        <input id="campo" />
      </>
    )
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it('anuncia "obrigatório" pro leitor de tela, não o asterisco', () => {
    render(<Label required>E-mail</Label>)

    expect(screen.getByText('(obrigatório)')).toBeInTheDocument()
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })

  it('não mostra o indicador quando não é obrigatório', () => {
    render(<Label>E-mail</Label>)
    expect(screen.queryByText('(obrigatório)')).not.toBeInTheDocument()
  })

  it('expõe data-disabled', () => {
    render(<Label disabled>Cupom</Label>)
    expect(screen.getByText('Cupom')).toHaveAttribute('data-disabled', 'true')
  })

  it('ativa o Checkbox ao clicar no rótulo', async () => {
    render(
      <>
        <Checkbox id="termos" aria-label="Termos">
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox>
        <Label htmlFor="termos">Li e aceito</Label>
      </>
    )

    await userEvent.click(screen.getByText('Li e aceito'))
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Label htmlFor="email" required>
        E-mail
      </Label>
    )
    expect(container).toMatchSnapshot()
  })
})
