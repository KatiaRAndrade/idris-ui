import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Card } from '../index'

describe('Card', () => {
  it('renderiza título e descrição', () => {
    render(
      <Card>
        <Card.Header>
          <Card.Title>Título</Card.Title>
          <Card.Description>Descrição</Card.Description>
        </Card.Header>
      </Card>
    )
    expect(screen.getByRole('heading', { name: 'Título' })).toBeInTheDocument()
    expect(screen.getByText('Descrição')).toBeInTheDocument()
  })

  it('Card.Title asChild troca o nível do heading', () => {
    render(
      <Card>
        <Card.Title asChild>
          <h2>Título como h2</h2>
        </Card.Title>
      </Card>
    )
    const heading = screen.getByRole('heading', { name: 'Título como h2' })
    expect(heading.tagName).toBe('H2')
  })

  it('Card asChild renderiza como o elemento filho (ex: link)', () => {
    render(
      <Card asChild>
        <a href="/post/1">Card clicável</a>
      </Card>
    )
    const link = screen.getByRole('link', { name: 'Card clicável' })
    expect(link).toBeInTheDocument()
  })

  it('lança erro se uma parte for usada fora do Card', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Card.Content>Solto</Card.Content>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Card variant="elevated">
        <Card.Header>
          <Card.Title>Título</Card.Title>
        </Card.Header>
        <Card.Content>Conteúdo</Card.Content>
      </Card>
    )
    expect(container).toMatchSnapshot()
  })
})
