# Idris — Componente: Badge

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato usado em `idris-componente-input.md`/`idris-componente-card.md`.

---

## 1. Root implícito

Elemento único (`<span>`), sem portal/posicionamento — mesmo caso do Button e do Card. `<Badge>` já é o root.

## 2. Partes

| Parte | Elemento | Papel | Obrigatória? |
|---|---|---|---|
| `Badge` (root implícito) | `<span>` (ou outro via `asChild`) | Container, `variant`/`size`, fornece contexto (`size`) pro Icon | Sim |
| `Badge.Icon` | — | Ícone pequeno, dimensionado conforme o `size` (via contexto) | Não |
| `Badge.Label` | `<span>` | Texto do badge | Não |
| `Badge.Styles` | — | `tv()` cru, uso avançado fora da composição | Não |

Mesma lógica do `Button.Icon`/`Button.Label` — só que sem `Content` como wrapper de layout, porque o Badge já nasce com `display: inline-flex` no root, sem precisar de uma parte extra só pra organizar o layout interno.

## 3. Variantes e tamanhos

**Variantes:** `neutral` (padrão) · `brand` · `accent` · `success` · `warning` · `error` · `info` — as quatro últimas reaproveitam os tokens `-bg` que já existiam pra toast/alert (`success-bg`, `warning-bg`...), então não precisou inventar tokens novos. `brand` e `accent` não têm um `-bg` dedicado, então usam a cor base com opacidade reduzida via utilitário do Tailwind (`bg-brand-500/15`), o que também evita inflar o arquivo de tokens só pra essa variação pontual.

**Tamanhos:** só `sm` / `md` — **sem `lg`**, diferente de Button/Input/Card. Badge é um elemento de status compacto por definição; um "badge grande" normalmente já é outra coisa (uma tag de filtro, um chip). Se esse caso aparecer, é melhor virar um componente novo do que esticar o Badge.

## 4. Tokens usados

`surface-elevated`, `border-thin` (variante `neutral`), `brand-500`/`brand-400`, `accent-500`/`accent-400`, `success`/`success-bg`, `warning`/`warning-bg`, `error`/`error-bg`, `info`/`info-bg`, `radius-full` (formato pill).

---

## 5. Estrutura de pastas

```
src/components/Badge/
├── Badge.tsx              # root — comportamento, contexto (size), forwardRef, asChild
├── Badge.context.ts        # contexto compartilhado (size)
├── Badge.styles.ts
├── Badge.stories.tsx
├── index.ts
├── parts/
│   ├── Icon.tsx            # exporta BadgeIcon (displayName "Badge.Icon")
│   └── Label.tsx           # exporta BadgeLabel (displayName "Badge.Label")
└── specs/
    ├── Badge.test.tsx
    └── __snapshots__/
```

> Os arquivos de `parts/` seguem a convenção do Button/Card: nome do arquivo sem o prefixo do componente (`Icon.tsx`, `Label.tsx`), com o prefixo aparecendo só no `displayName` (`Badge.Icon`, `Badge.Label`) e na composição feita no `index.ts`.

---

## 6. Código

**`Badge.context.ts`**:

```ts
import { createContext, useContext } from 'react'

export type BadgeVariant = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'md'

export interface BadgeContextValue {
  size: BadgeSize
}

export const BadgeContext = createContext<BadgeContextValue | null>(null)

export function useBadgeContext(part: string) {
  const ctx = useContext(BadgeContext)
  if (!ctx) {
    throw new Error(`<Badge.${part} /> precisa estar dentro de <Badge>`)
  }
  return ctx
}
```

**`Badge.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const badge = tv({
  base: 'inline-flex items-center gap-1 rounded-full font-sans font-medium whitespace-nowrap',
  variants: {
    variant: {
      neutral: 'bg-surface-elevated text-text-secondary border border-white/10',
      brand: 'bg-brand-500/15 text-brand-400',
      accent: 'bg-accent-500/15 text-accent-400',
      success: 'bg-success-bg text-success',
      warning: 'bg-warning-bg text-warning',
      error: 'bg-error-bg text-error',
      info: 'bg-info-bg text-info',
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    },
  },
  defaultVariants: { variant: 'neutral', size: 'md' },
})
```

**`Badge.tsx`** — o root:

```tsx
import { forwardRef, type HTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../primitives/Slot'
import { badge } from './Badge.styles'
import { BadgeContext, type BadgeVariant, type BadgeSize } from './Badge.context'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  asChild?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', asChild, children, ...props }, ref) => {
    const sharedProps = {
      'data-variant': variant,
      'data-size': size,
      className: badge({ variant, size, className }),
    }

    return (
      <BadgeContext.Provider value={{ size }}>
        {asChild ? (
          <Slot ref={ref} {...sharedProps} {...props}>
            {children as ReactElement<Record<string, unknown>>}
          </Slot>
        ) : (
          <span ref={ref} {...sharedProps} {...props}>
            {children}
          </span>
        )}
      </BadgeContext.Provider>
    )
  }
)

Badge.displayName = 'Badge'
```

**`parts/Icon.tsx`** — dimensiona conforme o `size` herdado do contexto (a mesma técnica do `Button.Icon`, escala menor pois o Badge é compacto):

```tsx
import { cloneElement, isValidElement, type ReactElement } from 'react'
import { useBadgeContext, type BadgeSize } from '../Badge.context'

const ICON_SIZE: Record<BadgeSize, number> = { sm: 10, md: 12 }

export interface BadgeIconProps {
  children: ReactElement<{ width?: number; height?: number; 'aria-hidden'?: boolean }>
}

export function BadgeIcon({ children }: BadgeIconProps) {
  const { size } = useBadgeContext('Icon')
  if (!isValidElement(children)) return null

  return cloneElement(children, {
    width: ICON_SIZE[size],
    height: ICON_SIZE[size],
    'aria-hidden': true,
  })
}

BadgeIcon.displayName = 'Badge.Icon'
```

**`parts/Label.tsx`**:

```tsx
import type { HTMLAttributes } from 'react'
import { useBadgeContext } from '../Badge.context'

export function BadgeLabel({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  useBadgeContext('Label')
  return <span className={className} {...props} />
}

BadgeLabel.displayName = 'Badge.Label'
```

**`index.ts`**:

```ts
import { Badge as Root } from './Badge'
import { BadgeIcon } from './parts/Icon'
import { BadgeLabel } from './parts/Label'
import { badge as badgeStyles } from './Badge.styles'

export const Badge = Object.assign(Root, {
  Icon: BadgeIcon,
  Label: BadgeLabel,
  Styles: badgeStyles,
})

export type { BadgeProps } from './Badge'
```

---

## 7. Uso

```jsx
// Status simples
<Badge variant="success" size="sm">
  <Badge.Icon><CheckIcon /></Badge.Icon>
  <Badge.Label>Ativo</Badge.Label>
</Badge>

// Só texto
<Badge variant="brand">
  <Badge.Label>Novo</Badge.Label>
</Badge>

// Contador de pendências
<Badge variant="error" size="sm">
  <Badge.Label>3 pendências</Badge.Label>
</Badge>

// Badge clicável (ex: filtro removível), via asChild
<Badge asChild variant="neutral" size="sm">
  <button type="button" onClick={() => removeFilter('categoria')}>
    <Badge.Label>Categoria: Roupas</Badge.Label>
    <Badge.Icon><CloseIcon /></Badge.Icon>
  </button>
</Badge>
```

---

## 8. Teste (`specs/Badge.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Badge } from '../index'

describe('Badge', () => {
  it('renderiza o label', () => {
    render(
      <Badge variant="success">
        <Badge.Label>Ativo</Badge.Label>
      </Badge>
    )
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('aplica o data-variant correto', () => {
    render(
      <Badge variant="error">
        <Badge.Label>Erro</Badge.Label>
      </Badge>
    )
    expect(screen.getByText('Erro').closest('[data-variant]')).toHaveAttribute('data-variant', 'error')
  })

  it('Badge.Icon dimensiona conforme o size', () => {
    render(
      <Badge size="sm">
        <Badge.Icon><svg data-testid="icon" /></Badge.Icon>
      </Badge>
    )
    expect(screen.getByTestId('icon')).toHaveAttribute('width', '10')
  })

  it('asChild renderiza como o elemento filho (ex: button)', () => {
    render(
      <Badge asChild>
        <button type="button">
          <Badge.Label>Remover</Badge.Label>
        </button>
      </Badge>
    )
    expect(screen.getByRole('button', { name: 'Remover' })).toBeInTheDocument()
  })

  it('lança erro se uma parte for usada fora do Badge', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Badge.Label>Solto</Badge.Label>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Badge variant="brand" size="md">
        <Badge.Label>Novo</Badge.Label>
      </Badge>
    )
    expect(container).toMatchSnapshot()
  })
})
```
