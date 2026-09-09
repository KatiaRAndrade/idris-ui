# Idris — Componente: Typography (Heading, Text)

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato usado nos demais `idris-componente-*.md`.

---

## 1. Por que não tem `parts/` aqui

Diferente de Button/Input/Card/Badge, `Heading` e `Text` são **folhas** — elementos atômicos que não compõem nada por dentro. Não existe um `Heading.Icon` ou `Text.Label` fazendo sentido aqui. Pela mesma lógica que decide quando algo precisa de `.Root` explícito (seção 2 de `idris-estrutura-componentes.md`), a ausência de partes compostas também é uma decisão válida — nem todo componente precisa forçar o padrão de namespace. `Heading` e `Text` são usados diretamente, sem member access.

## 2. `as` em vez de `asChild`

Nos outros componentes, `asChild` (via `Slot`) resolve "renderizar como qualquer elemento". Aqui a necessidade é mais restrita: só trocar entre tags de texto/heading válidas (`h1`–`h6` pro Heading; `p`/`span`/`label`/`div` pro Text). Por isso os dois usam uma prop `as` simples e tipada, em vez do `Slot` — mais seguro (não dá pra acidentalmente passar um elemento incompatível) e mais simples de implementar.

**Por que isso importa:** o `size` controla a aparência (`h3` visualmente grande/pequeno), e o `as` controla a semântica (que tag HTML realmente é renderizada). Eles são independentes de propósito — um "h3 visual" pode precisar ser um `<h2>` de verdade dependendo de onde entra na hierarquia da página, sem mudar como ele parece.

## 3. Tokens usados

**Heading** consome a escala `display`/`heading-1`/`heading-2`/`heading-3`/`heading-4` (Fraunces) já definida em `design-system-fundacao.md` seção 2.2 — os mesmos valores de tamanho/peso/line-height, só que exatos via classe arbitrária do Tailwind (`text-[56px]` etc.), já que não criamos uma extensão de `fontSize` no `tailwind.config`.

**Text** consome `body-lg`/`body`/`body-sm`/`label`/`caption` (Inter) da mesma escala, mais `text-primary`/`text-secondary` pra cor.

---

## 4. Estrutura de pastas

```
src/components/Typography/
├── Heading.tsx
├── Heading.styles.ts
├── Text.tsx
├── Text.styles.ts
├── Typography.stories.tsx   # cobre os dois nas stories
├── index.ts
└── specs/
    ├── Heading.test.tsx
    └── Text.test.tsx
```

Sem `parts/` (não há partes) e sem `.context.ts` (não há estado compartilhado entre nada, cada um é independente).

---

## 5. Código

**`Heading.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const heading = tv({
  base: 'font-display text-text-primary',
  variants: {
    size: {
      display: 'text-[56px] font-light leading-[1.1]',
      h1: 'text-[40px] font-normal leading-[1.15]',
      h2: 'text-[32px] font-normal leading-[1.2]',
      h3: 'text-[24px] font-semibold leading-[1.25]',
      h4: 'text-[20px] font-semibold leading-[1.3]',
    },
  },
  defaultVariants: { size: 'h2' },
})
```

**`Heading.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { heading } from './Heading.styles'

export type HeadingSize = 'display' | 'h1' | 'h2' | 'h3' | 'h4'
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

// Tag semântica padrão por tamanho — pode ser sobrescrita via `as`
const DEFAULT_TAG: Record<HeadingSize, HeadingTag> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
}

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: HeadingSize
  as?: HeadingTag
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, size = 'h2', as, ...props }, ref) => {
    const Tag = as ?? DEFAULT_TAG[size]
    return <Tag ref={ref} data-size={size} className={heading({ size, className })} {...props} />
  }
)

Heading.displayName = 'Heading'
```

**`Text.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const text = tv({
  base: 'font-sans',
  variants: {
    size: {
      'body-lg': 'text-lg leading-[1.6]',
      body: 'text-base leading-[1.6]',
      'body-sm': 'text-sm leading-[1.5]',
      label: 'text-sm font-medium leading-[1.4]',
      caption: 'text-xs font-medium leading-[1.4] uppercase tracking-wide',
    },
    color: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
    },
    truncate: {
      true: 'truncate',
    },
  },
  defaultVariants: { size: 'body', color: 'primary' },
})
```

**`Text.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes, type ElementType } from 'react'
import { text } from './Text.styles'

export type TextSize = 'body-lg' | 'body' | 'body-sm' | 'label' | 'caption'
export type TextTag = 'p' | 'span' | 'label' | 'div'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  size?: TextSize
  color?: 'primary' | 'secondary'
  truncate?: boolean
  as?: TextTag
}

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ className, size = 'body', color = 'primary', truncate, as = 'p', ...props }, ref) => {
    const Tag = as as ElementType
    return (
      <Tag
        ref={ref}
        data-size={size}
        className={text({ size, color, truncate, className })}
        {...props}
      />
    )
  }
)

Text.displayName = 'Text'
```

**`index.ts`**:

```ts
export { Heading } from './Heading'
export type { HeadingProps, HeadingSize, HeadingTag } from './Heading'

export { Text } from './Text'
export type { TextProps, TextSize, TextTag } from './Text'
```

---

## 6. Uso

```jsx
// Tamanho e tag juntos (caso comum)
<Heading size="display">Idris</Heading>
<Heading size="h3">Seção da página</Heading>

// Tamanho visual e nível semântico desacoplados
<Heading size="h3" as="h2">
  Visualmente um h3, mas é o h2 real da página
</Heading>

// Texto padrão
<Text>Parágrafo comum, tamanho body.</Text>

// Como label de formulário (reaproveitando o token `label`, mesmo do Input.Label)
<Text as="label" size="label" htmlFor="email">E-mail</Text>

// Metadado discreto
<Text size="caption" color="secondary">Atualizado há 2 minutos</Text>

// Truncamento de uma linha
<Text truncate className="max-w-[220px]">
  Um texto bem comprido que deveria cortar com reticências no fim
</Text>
```

---

## 7. Testes

**`specs/Heading.test.tsx`**:

```tsx
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
```

**`specs/Text.test.tsx`**:

```tsx
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
```
