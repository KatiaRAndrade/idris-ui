import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useRovingFocus, resolveRovingTabIndex } from '../useRovingFocus'

function Grupo({
  onNavigate,
  ...options
}: Partial<Parameters<typeof useRovingFocus>[0]> = {}) {
  const onKeyDown = useRovingFocus({
    containerSelector: '[role="toolbar"]',
    orientation: 'horizontal',
    onNavigate,
    ...options,
  })

  return (
    <div role="toolbar">
      <button data-roving-item onKeyDown={onKeyDown}>um</button>
      <button data-roving-item onKeyDown={onKeyDown}>dois</button>
      <button data-roving-item onKeyDown={onKeyDown} disabled>três</button>
      <button data-roving-item onKeyDown={onKeyDown}>quatro</button>
    </div>
  )
}

describe('useRovingFocus', () => {
  it('move o foco pro próximo item', async () => {
    render(<Grupo />)
    screen.getByText('um').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('dois')).toHaveFocus()
  })

  it('pula itens desabilitados', async () => {
    render(<Grupo />)
    screen.getByText('dois').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('quatro')).toHaveFocus()
  })

  it('dá a volta no fim quando loop', async () => {
    render(<Grupo />)
    screen.getByText('quatro').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('um')).toHaveFocus()
  })

  it('para na ponta quando loop é false', async () => {
    render(<Grupo loop={false} />)
    screen.getByText('quatro').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('quatro')).toHaveFocus()
  })

  it('Home e End vão às pontas', async () => {
    render(<Grupo />)
    screen.getByText('dois').focus()

    await userEvent.keyboard('{End}')
    expect(screen.getByText('quatro')).toHaveFocus()

    await userEvent.keyboard('{Home}')
    expect(screen.getByText('um')).toHaveFocus()
  })

  it('ignora setas fora da orientação', async () => {
    render(<Grupo orientation="horizontal" />)
    screen.getByText('um').focus()

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByText('um')).toHaveFocus()
  })

  it('aceita as quatro setas quando orientation é both', async () => {
    render(<Grupo orientation="both" />)
    screen.getByText('um').focus()

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByText('dois')).toHaveFocus()
  })

  it('ativa o item ao navegar quando activateOnNavigate', async () => {
    const onClick = vi.fn()
    function ComClick() {
      const onKeyDown = useRovingFocus({
        containerSelector: '[role="toolbar"]',
        orientation: 'horizontal',
        activateOnNavigate: true,
      })
      return (
        <div role="toolbar">
          <button data-roving-item onKeyDown={onKeyDown}>um</button>
          <button data-roving-item onKeyDown={onKeyDown} onClick={onClick}>dois</button>
        </div>
      )
    }

    render(<ComClick />)
    screen.getByText('um').focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('chama onNavigate sem ativar quando activateOnNavigate é false', async () => {
    const onNavigate = vi.fn()
    render(<Grupo onNavigate={onNavigate} />)
    screen.getByText('um').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(onNavigate).toHaveBeenCalledOnce()
  })
})

describe('resolveRovingTabIndex', () => {
  it('dá 0 ao item ativo', () => {
    expect(resolveRovingTabIndex({ isActive: true, hasActive: true, isFirst: false })).toBe(0)
  })

  it('dá 0 ao primeiro quando nada está ativo', () => {
    expect(resolveRovingTabIndex({ isActive: false, hasActive: false, isFirst: true })).toBe(0)
  })

  it('dá -1 ao primeiro quando existe outro ativo', () => {
    expect(resolveRovingTabIndex({ isActive: false, hasActive: true, isFirst: true })).toBe(-1)
  })
})
