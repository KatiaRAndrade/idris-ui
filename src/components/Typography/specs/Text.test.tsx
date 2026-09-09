import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Text } from '../index'

describe('Text', () => {
  it('renderiza como <p> por padrão', () => {
    const { container } = render(<Text>Conteúdo</Text>)
    expect(container.querySelector('p')).toBeInTheDocument()
  })

  it('renderiza como outra tag via `as`', () => {
    render(
      <Text as="label" htmlFor="email">
        E-mail
      </Text>
    )
    expect(screen.getByText('E-mail').tagName).toBe('LABEL')
  })

  it('aplica truncate quando solicitado', () => {
    const { container } = render(<Text truncate>Texto longo</Text>)
    expect(container.firstChild).toHaveClass('truncate')
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Text size="caption" color="secondary">
        Legenda
      </Text>
    )
    expect(container).toMatchSnapshot()
  })
})
