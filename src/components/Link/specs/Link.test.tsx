import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Link } from '../index'

describe('Link', () => {
  it('renderiza como <a> com href', () => {
    render(<Link href="/docs">Documentação</Link>)
    expect(screen.getByRole('link', { name: 'Documentação' })).toHaveAttribute('href', '/docs')
  })

  it('não aplica target/rel quando external é false', () => {
    render(<Link href="/docs">Documentação</Link>)
    const el = screen.getByRole('link')
    expect(el).not.toHaveAttribute('target')
    expect(el).not.toHaveAttribute('rel')
  })

  it('aplica target="_blank" e rel="noopener noreferrer" quando external', () => {
    render(
      <Link external href="https://exemplo.com">
        Exemplo
      </Link>
    )
    const el = screen.getByRole('link')
    expect(el).toHaveAttribute('target', '_blank')
    expect(el).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('anuncia "abre em nova aba" pro leitor de tela quando external', () => {
    render(
      <Link external href="https://exemplo.com">
        Exemplo
      </Link>
    )
    expect(screen.getByText('(abre em nova aba)')).toBeInTheDocument()
  })

  it('respeita target/rel explícitos mesmo com external', () => {
    render(
      <Link external href="/preview" target="_self" rel="bookmark">
        Abrir aqui
      </Link>
    )
    const el = screen.getByRole('link')
    expect(el).toHaveAttribute('target', '_self')
    expect(el).toHaveAttribute('rel', 'bookmark')
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Link external href="https://exemplo.com">
        Exemplo
      </Link>
    )
    expect(container).toMatchSnapshot()
  })
})
