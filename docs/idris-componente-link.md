# Idris — Componente: Link

> Segue as specs já fechadas: [`ds-architecture.md`](./ds-architecture.md) e o formato dos demais `idris-componente-*.md`. Fase 1 do [`idris-roadmap-componentes.md`](./idris-roadmap-componentes.md).

---

## 1. Root implícito, sem `parts/`

Elemento único (`<a>`), sem partes, sem contexto — componente-folha como Separator, Label, Spinner e Skeleton.

## 2. Por que existe, se um `<a className="...">` já resolve

Um link de design system precisa de três coisas que ninguém escreve certo na segunda vez que copia e cola:

1. **Foco visível** — o mesmo anel de `focus-visible:ring-brand-400` que Button já usa, e que se perde fácil quando alguém sobrescreve `className` na mão.
2. **Estado de visitado** — `:visited` existe no CSS nativo, mas é a exceção mais fácil de esquecer porque não aparece em nenhum teste manual rápido (o link já foi visitado *pelo navegador*, não por quem está revisando o componente).
3. **`external` correto** — abrir em nova aba exige `target="_blank"` **e** `rel="noopener noreferrer"` juntos. Esquecer o `rel` é uma vulnerabilidade conhecida (`window.opener` do destino ganhando acesso à aba de origem); esquecer o ícone é um link que manda a pessoa pra fora do site sem avisar.

## 3. Cor: duas variantes de texto, não uma prop de cor

`brand-400` no estado normal, `accent-400` no `:visited`. Duas famílias de cor diferentes (teal vs. rosa/mauve) em vez de uma escala clara→escuro, porque a diferença precisa ser óbvia num piscar de olhos — é a mesma lógica do semáforo de variantes do Badge, não uma escolha estética.

Sem prop `color`: um link que muda de cor por prop deixa de comunicar "isso é um link" de forma consistente pela aplicação inteira. Quem precisa de um link com a aparência de outra coisa usa `Button.Styles` (link estilizado como botão) ou compõe manualmente — não é o problema que este componente resolve.

## 4. `external`: o que a prop acrescenta

```tsx
<Link external href="https://exemplo.com">Ver documentação</Link>
```

Com `external`:
- `target="_blank"` e `rel="noopener noreferrer"` são aplicados automaticamente
- Um ícone de seta diagonal aparece depois do texto — `aria-hidden`, é decoração
- Um texto `(abre em nova aba)` fica em `VisuallyHidden` logo depois — é o que o leitor de tela realmente anuncia, mesmo padrão do indicador de obrigatório do `Label`

**`target`/`rel` explícitos no uso vencem os automáticos** — a prop nunca sobrescreve o que quem usa passou de propósito.

## 5. Sem prop de sublinhado

O sublinhado aparece só no `:hover`/`:focus-visible`, sempre — não é configurável por variant. Um link sem sublinhado nenhum depende só da cor pra ser reconhecido como link, o que falha pra quem tem daltonismo a cores próximas de `brand-400`. Um link sempre sublinhado no meio de um parágrafo de texto vira ruído visual. `hover`/`focus` é o meio-termo que os dois design systems de referência (Radix Themes, GOV.UK) convergem.

## 6. Tokens usados

`brand-400` (padrão), `accent-400` (`:visited`), `radius-sm` (o anel de foco precisa de raio pra não ficar quadrado num texto), `duration-fast`. Nenhum token novo.

---

## 7. Estrutura de pastas

```
src/components/Link/
├── Link.tsx
├── Link.styles.ts
├── Link.stories.tsx
├── index.ts
└── specs/
    ├── Link.test.tsx
    └── __snapshots__/
```

---

## 8. Código

**`Link.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const link = tv({
  base: [
    'inline-flex items-center gap-1 font-sans text-brand-400',
    'underline-offset-4 hover:underline',
    'transition-colors duration-fast rounded-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
    // :visited é pseudo-classe do navegador — não dá pra simular via data-*
    'visited:text-accent-400',
  ],
})
```

**`Link.tsx`**:

```tsx
import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { link } from './Link.styles'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Marca o link como saída do site: aplica target="_blank" + rel="noopener
   * noreferrer" (a menos que target/rel já tenham sido passados explicitamente)
   * e acrescenta um ícone + aviso pro leitor de tela.
   */
  external?: boolean
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, external = false, target, rel, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        target={target ?? (external ? '_blank' : undefined)}
        rel={rel ?? (external ? 'noopener noreferrer' : undefined)}
        data-external={external || undefined}
        className={link({ className })}
        {...props}
      >
        {children}
        {external && (
          <>
            <svg
              aria-hidden
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <VisuallyHidden>(abre em nova aba)</VisuallyHidden>
          </>
        )}
      </a>
    )
  }
)

Link.displayName = 'Link'
```

**`index.ts`**:

```ts
export { Link } from './Link'
export type { LinkProps } from './Link'
```

---

## 9. Uso

```jsx
// Link comum, dentro de um parágrafo
<Text>
  Leia mais em <Link href="/docs">nossa documentação</Link>.
</Text>

// Saída do site — ganha ícone, rel e aviso automáticos
<Link external href="https://github.com/exemplo/idris-ui">
  Ver no GitHub
</Link>

// target/rel explícitos vencem os automáticos do external
<Link external href="/preview" target="_self" rel="bookmark">
  Abrir na mesma aba
</Link>
```

---

## 10. Acessibilidade

- Foco visível via `focus-visible:ring-2 ring-brand-400` — o mesmo anel do Button, nunca removido
- `:visited` muda de cor sozinho, é comportamento nativo do navegador — não depende de estado do React
- `external`: ícone decorativo (`aria-hidden`) + `(abre em nova aba)` em `VisuallyHidden`, porque a seta sozinha não é lida por leitor de tela
- `rel="noopener noreferrer"` automático em link externo é mitigação de segurança, não só acessibilidade — a ausência de `noopener` permite que a página de destino manipule `window.opener` da aba de origem

---

## 11. Teste (`specs/Link.test.tsx`)

```tsx
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
```

---

## 12. Checklist

- [ ] `Link` criado, 6 testes passando
- [ ] Export em `src/index.ts`
