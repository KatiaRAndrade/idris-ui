import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import * as RadioGroup from '../index'

function Setup(props: RadioGroup.RadioGroupRootProps = {}) {
  return (
    <RadioGroup.Root aria-label="Plano" {...props}>
      <RadioGroup.Item value="mensal" aria-label="Mensal">
        <RadioGroup.Indicator />
      </RadioGroup.Item>
      <RadioGroup.Item value="anual" aria-label="Anual">
        <RadioGroup.Indicator />
      </RadioGroup.Item>
      <RadioGroup.Item value="vitalicio" aria-label="Vitalício" disabled>
        <RadioGroup.Indicator />
      </RadioGroup.Item>
    </RadioGroup.Root>
  )
}

describe('RadioGroup', () => {
  it('seleciona ao clicar e desmarca o anterior', async () => {
    render(<Setup defaultValue="mensal" />)

    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: 'Anual' }))

    expect(screen.getByRole('radio', { name: 'Anual' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveAttribute('aria-checked', 'false')
  })

  it('só o item selecionado é alcançável por Tab (roving tabindex)', () => {
    render(<Setup defaultValue="anual" />)

    expect(screen.getByRole('radio', { name: 'Anual' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveAttribute('tabindex', '-1')
  })

  it('sem seleção, o primeiro item habilitado recebe o foco do Tab', () => {
    render(<Setup />)
    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveAttribute('tabindex', '0')
  })

  it('navega e seleciona com as setas', async () => {
    render(<Setup defaultValue="mensal" />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')

    const anual = screen.getByRole('radio', { name: 'Anual' })
    expect(anual).toHaveFocus()
    expect(anual).toHaveAttribute('aria-checked', 'true')
  })

  it('pula itens desabilitados e dá a volta no fim da lista', async () => {
    render(<Setup defaultValue="anual" />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}') // "vitalicio" está disabled → volta pro início

    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveFocus()
  })

  it('no modo controlado, só avisa via onValueChange', async () => {
    const onValueChange = vi.fn()
    render(<Setup value="mensal" onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Anual' }))

    expect(onValueChange).toHaveBeenCalledWith('anual')
    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveAttribute('aria-checked', 'true')
  })

  it('esconde o Indicator nos itens não selecionados', () => {
    const { container } = render(<Setup defaultValue="mensal" />)
    // só um indicador renderizado no grupo inteiro
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
  })

  it('propaga disabled do Root pros itens', async () => {
    const onValueChange = vi.fn()
    render(<Setup disabled onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Mensal' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('envia o valor no FormData quando tem name', () => {
    const { container } = render(
      <form>
        <Setup name="plano" defaultValue="anual" />
      </form>
    )
    const form = container.querySelector('form')!
    expect(new FormData(form).get('plano')).toBe('anual')
  })

  it('lança erro se uma parte for usada fora do Root', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<RadioGroup.Item value="x" />)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(<Setup defaultValue="mensal" />)
    expect(container).toMatchSnapshot()
  })
})
