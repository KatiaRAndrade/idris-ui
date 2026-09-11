import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from '../index'

describe('Skeleton', () => {
  it('é sempre escondido do leitor de tela', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('ignora aria-hidden false vindo de fora', () => {
    const { container } = render(<Skeleton aria-hidden={false} />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('usa a forma text por padrão', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('data-shape', 'text')
  })

  it('aplica a forma circle', () => {
    const { container } = render(<Skeleton shape="circle" />)
    expect(container.firstChild).toHaveAttribute('data-shape', 'circle')
    expect(container.firstChild).toHaveClass('rounded-full')
  })

  it('aceita className extra sem perder as classes base', () => {
    const { container } = render(<Skeleton className="w-3/5" />)
    expect(container.firstChild).toHaveClass('w-3/5')
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(<Skeleton shape="rect" className="h-32" />)
    expect(container).toMatchSnapshot()
  })
})
