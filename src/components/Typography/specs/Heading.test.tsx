import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Heading } from '../index'

describe('Heading', () => {
  it('usa a tag padrão conforme o size', () => {
    render(<Heading size="h3">Título</Heading>)
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('permite sobrescrever a tag via `as`, mantendo o size visual', () => {
    render(
      <Heading size="h3" as="h2">
        Título
      </Heading>
    )
    const el = screen.getByRole('heading', { level: 2 })
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('data-size', 'h3')
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(<Heading size="display">Idris</Heading>)
    expect(container).toMatchSnapshot()
  })
})
