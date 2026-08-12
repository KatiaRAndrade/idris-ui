# Idris — Componente: Card

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md) (separação de arquivo, `Slot` caseiro, `data-*`), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) (padrão de partes + regra do `parts/`) e o mesmo formato usado em `idris-componente-input.md`.

---

## 1. Root implícito

O Card é um elemento DOM único (um `<div>` que envolve tudo) — pela regra da seção 2 de `idris-estrutura-componentes.md`, não precisa de `.Root` explícito. O próprio `<Card>` já é o root, igual ao Button.

## 2. Partes

| Parte | Elemento | Papel | Obrigatória? |
|---|---|---|---|
| `Card` (root implícito) | `<div>` (ou outro via `asChild`) | Container, `variant`/`size`, fornece contexto (`size`) pras partes | Sim |
| `Card.Header` | `<div>` | Agrupa `Title` + `Description`, padding de topo | Não |
| `Card.Title` | `<h3>` (aceita `asChild` pra trocar o nível do heading) | Título do card | Não |
| `Card.Description` | `<p>` | Subtítulo/texto de apoio, logo abaixo do Title | Não |
| `Card.Content` | `<div>` | Corpo principal | Não |
| `Card.Footer` | `<div>` | Rodapé — ações, com separador visual do conteúdo acima | Não |
| `Card.Styles` | — | `tv()` cru, pra aplicar a aparência do Card em outro elemento fora da composição | Não — uso avançado |

> `Card.Description` não estava no rascunho original da tabela de roadmap (`design-system-fundacao.md`) — adicionei porque é praticamente universal em cards com título (padrão comum: título + linha de apoio). Se não fizer sentido pro seu uso, é só não renderizar essa parte — ela é opcional como todas as outras.

**Por que o Title aceita `asChild`:** diferente do Button (onde `asChild` serve pra trocar o elemento renderizado por completo), aqui o motivo é semântico — o nível do heading (`h2`, `h3`, `h4`) depende de onde o Card aparece na página, e isso é responsabilidade de quem usa o componente, não do design system.

## 3. Variantes e tamanhos

- **Variantes:** `default` (fundo `surface`) · `elevated` (fundo `surface-elevated`, pra destacar sobre outros cards/seções)
- **Tamanhos:** `sm` / `md` / `lg` — controlam o padding interno de `Header`/`Content`/`Footer` (herdado via contexto, não precisa repetir em cada parte)

## 4. Tokens usados

`surface` / `surface-elevated`, `border-thin` (borda do card e separador do footer), `radius-lg`, `space-4`/`space-5`/`space-6` (padding conforme o size), `duration-fast`, tipografia: título em `font-display` (Fraunces) + peso semibold, descrição em `text-sm` + `text-secondary`.

---

## 5. Estrutura de pastas

```
src/components/Card/
├── Card.tsx              # root — comportamento, contexto (size), forwardRef, asChild
├── Card.context.ts        # contexto compartilhado (size) entre as partes
├── Card.styles.ts          # tv() de cada parte
├── Card.stories.tsx
├── index.ts
├── parts/                 # nome do arquivo sem prefixo `Card.` — igual a Button/Input
│   ├── Header.tsx
│   ├── Title.tsx
│   ├── Description.tsx
│   ├── Content.tsx
│   └── Footer.tsx
└── specs/
    ├── Card.test.tsx
    └── __snapshots__/
```

---

## 6. Código

**`Card.context.ts`**:

```ts
import { createContext, useContext } from 'react'

export type CardVariant = 'default' | 'elevated'
export type CardSize = 'sm' | 'md' | 'lg'

export interface CardContextValue {
  size: CardSize
}

export const CardContext = createContext<CardContextValue | null>(null)

export function useCardContext(part: string) {
  const ctx = useContext(CardContext)
  if (!ctx) {
    throw new Error(`<Card.${part} /> precisa estar dentro de <Card>`)
  }
  return ctx
}
```

**`Card.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const card = tv({
  base: 'rounded-lg border border-white/10 overflow-hidden transition-colors duration-fast',
  variants: {
    variant: {
      default: 'bg-surface',
      elevated: 'bg-surface-elevated',
    },
  },
  defaultVariants: { variant: 'default' },
})

export const header = tv({
  base: 'flex flex-col gap-1.5',
  variants: {
    size: {
      sm: 'p-4 pb-0',
      md: 'p-5 pb-0',
      lg: 'p-6 pb-0',
    },
  },
})

export const title = tv({
  base: 'font-display text-xl font-semibold text-text-primary',
})

export const description = tv({
  base: 'text-sm text-text-secondary',
})

export const content = tv({
  base: '',
  variants: {
    size: {
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    },
  },
})

export const footer = tv({
  base: 'flex items-center justify-end gap-2 border-t border-white/10',
  variants: {
    size: {
      sm: 'p-4 mt-4',
      md: 'p-5 mt-5',
      lg: 'p-6 mt-6',
    },
  },
})
```

**`Card.tsx`** — o root:

> O `Slot` caseiro exige um `children` que seja um `ReactElement` único. Por isso, em vez de `const Comp = asChild ? Slot : 'div'` (que não passa no TS), ramificamos explicitamente — mesmo padrão do `Input.Field`.

```tsx
import { forwardRef, type HTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../primitives/Slot'
import { card } from './Card.styles'
import { CardContext, type CardVariant, type CardSize } from './Card.context'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  size?: CardSize
  asChild?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', size = 'md', asChild, children, ...props }, ref) => {
    const sharedProps = {
      'data-variant': variant,
      'data-size': size,
      className: card({ variant, className }),
    }

    return (
      <CardContext.Provider value={{ size }}>
        {asChild ? (
          <Slot ref={ref} {...sharedProps} {...props}>
            {children as ReactElement<Record<string, unknown>>}
          </Slot>
        ) : (
          <div ref={ref} {...sharedProps} {...props}>
            {children}
          </div>
        )}
      </CardContext.Provider>
    )
  }
)

Card.displayName = 'Card'
```

**`parts/Header.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { useCardContext } from '../Card.context'
import { header } from '../Card.styles'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { size } = useCardContext('Header')
    return <div ref={ref} className={header({ size, className })} {...props} />
  }
)

CardHeader.displayName = 'Card.Header'
```

**`parts/Title.tsx`** — suporta `asChild` pra flexibilizar o nível do heading:

```tsx
import { forwardRef, type HTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useCardContext } from '../Card.context'
import { title } from '../Card.styles'

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, asChild, children, ...props }, ref) => {
    useCardContext('Title')
    const sharedProps = { className: title({ className }) }

    if (asChild) {
      return (
        <Slot ref={ref} {...sharedProps} {...props}>
          {children as ReactElement<Record<string, unknown>>}
        </Slot>
      )
    }

    return (
      <h3 ref={ref} {...sharedProps} {...props}>
        {children}
      </h3>
    )
  }
)

CardTitle.displayName = 'Card.Title'
```

**`parts/Description.tsx`**:

```tsx
import type { HTMLAttributes } from 'react'
import { useCardContext } from '../Card.context'
import { description } from '../Card.styles'

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  useCardContext('Description')
  return <p className={description({ className })} {...props} />
}

CardDescription.displayName = 'Card.Description'
```

**`parts/Content.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { useCardContext } from '../Card.context'
import { content } from '../Card.styles'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { size } = useCardContext('Content')
    return <div ref={ref} className={content({ size, className })} {...props} />
  }
)

CardContent.displayName = 'Card.Content'
```

**`parts/Footer.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { useCardContext } from '../Card.context'
import { footer } from '../Card.styles'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { size } = useCardContext('Footer')
    return <div ref={ref} className={footer({ size, className })} {...props} />
  }
)

CardFooter.displayName = 'Card.Footer'
```

**`index.ts`** — Card tem root implícito (é uma função/componente), então usa `Object.assign` igual ao Button:

```ts
import { Card as Root } from './Card'
import { CardHeader } from './parts/Header'
import { CardTitle } from './parts/Title'
import { CardDescription } from './parts/Description'
import { CardContent } from './parts/Content'
import { CardFooter } from './parts/Footer'
import { card as cardStyles } from './Card.styles'

export const Card = Object.assign(Root, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
  Styles: cardStyles,
})

export type { CardProps } from './Card'
```

---

## 7. Uso

```jsx
// Card padrão, com header, conteúdo e footer de ações
<Card>
  <Card.Header>
    <Card.Title>Plano Pro</Card.Title>
    <Card.Description>Pra quem já usa o Idris no dia a dia.</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Componentes ilimitados, temas dark/light, suporte a asChild em tudo.</p>
  </Card.Content>
  <Card.Footer>
    <Button variant="ghost" size="sm">
      <Button.Label>Cancelar</Button.Label>
    </Button>
    <Button variant="primary" size="sm">
      <Button.Label>Assinar</Button.Label>
    </Button>
  </Card.Footer>
</Card>

// Card inteiro clicável (vira um <a>), com heading h2 pra encaixar na hierarquia da página
<Card asChild variant="elevated">
  <a href="/post/1">
    <Card.Header>
      <Card.Title asChild>
        <h2>Como construímos o Idris</h2>
      </Card.Title>
      <Card.Description>Um design system do zero, com tokens, Slot próprio e testes.</Card.Description>
    </Card.Header>
  </a>
</Card>

// Só conteúdo, sem header/footer — as partes são todas opcionais
<Card size="sm">
  <Card.Content>Aviso rápido, sem título.</Card.Content>
</Card>
```

---

## 8. Teste (`specs/Card.test.tsx`)

```tsx
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
```
