import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Separator } from '../index'

describe('Separator', () => {
  it('é anunciado como separator por padrão', () => {
    render(<Separator />)
    const el = screen.getByRole('separator')
    expect(el).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('sai da árvore de acessibilidade quando decorative', () => {
    const { container } = render(<Separator decorative />)
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('aplica a orientação vertical', () => {
    render(<Separator orientation="vertical" />)
    const el = screen.getByRole('separator')
    expect(el).toHaveAttribute('data-orientation', 'vertical')
    expect(el).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('aceita className extra sem perder as classes base', () => {
    render(<Separator className="my-6" />)
    expect(screen.getByRole('separator')).toHaveClass('my-6')
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(<Separator />)
    expect(container).toMatchSnapshot()
  })
})
