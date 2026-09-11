import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from '../index'

describe('Spinner', () => {
  it('é decoração por padrão', () => {
    const { container } = render(<Spinner />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('vira região viva quando recebe label', () => {
    render(<Spinner label="Carregando pedidos" />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Carregando pedidos')).toBeInTheDocument()
  })

  it('aplica o data-size', () => {
    const { container } = render(<Spinner size="xl" />)
    expect(container.querySelector('[data-size="xl"]')).toBeInTheDocument()
  })

  it('encaminha a ref pro wrapper quando há label', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<Spinner label="Carregando" ref={ref} />)

    expect(ref.current).toHaveAttribute('role', 'status')
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(<Spinner size="md" />)
    expect(container).toMatchSnapshot()
  })
})
