# Idris — Componente: Tooltip

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato dos demais `idris-componente-*.md`. É praticamente o mesmo formato do exemplo de `Popover` que motivou toda essa arquitetura lá no início.

---

## 1. Por que tem `.Root` explícito

`Trigger` e `Content` são elementos DOM desconectados (o gatilho fica onde o usuário passa o mouse; o balão flutua em outro ponto da tela) e precisam compartilhar estado de "aberto/fechado" mais o delay de exibição. Exatamente o caso descrito na seção 2 de `idris-estrutura-componentes.md` que exige `.Root` — igual ao Popover do exemplo original.

## 2. Partes

| Parte | Papel |
|---|---|
| `Tooltip.Root` | Coordena `open`, o delay de exibição (hover/focus) e gera o `id` do conteúdo pro `aria-describedby` |
| `Tooltip.Trigger` | O elemento que dispara o tooltip — aceita `asChild` (quase sempre envolve um ícone ou botão já existente) |
| `Tooltip.Content` | O balão — só renderiza quando `open` |
| `Tooltip.Arrow` | Setinha decorativa apontando pro trigger |

## 3. Simplificações deliberadas (vs. o Tooltip real do Radix)

Duas coisas que o Radix resolve e a gente conscientemente simplificou pra v1:

1. **Sem `Tooltip.Provider` global** — o Radix usa um Provider pra compartilhar configuração de delay entre múltiplos tooltips na mesma tela (e evitar re-delay ao mover o mouse entre tooltips próximos). Por enquanto, o delay é uma prop direta no `Root`. Se isso incomodar na prática (vários tooltips próximos um do outro), é candidato a virar `Provider` depois.
2. **Sem posicionamento inteligente (collision detection)** — o `Content` é posicionado com CSS simples (`absolute`, sempre abaixo do trigger). O Radix (e libs como `floating-ui`) recalculam a posição pra não estourar a tela. Fica documentado como próxima melhoria, não como parte do escopo v1.

## 4. Tokens usados

`surface-elevated` (fundo do balão), `text-primary`, `radius-sm`, `space-2`/`space-3` (padding), `duration-fast` (fade), tipografia `text-xs` (menor que `caption`, mas sem negrito).

---

## 5. Estrutura de pastas

```
src/components/Tooltip/
├── Tooltip.Root.tsx      # root explícito — estado, delay, contexto
├── Tooltip.context.ts
├── Tooltip.styles.ts
├── Tooltip.stories.tsx
├── index.ts
├── parts/
│   ├── Tooltip.Trigger.tsx
│   ├── Tooltip.Content.tsx
│   └── Tooltip.Arrow.tsx
└── specs/
    ├── Tooltip.test.tsx
    └── __snapshots__/
```

---

## 6. Código

**`Tooltip.context.ts`**:

```ts
import { createContext, useContext } from 'react'

export interface TooltipContextValue {
  open: boolean
  onOpen: () => void
  onClose: () => void
  contentId: string
}

export const TooltipContext = createContext<TooltipContextValue | null>(null)

export function useTooltipContext(part: string) {
  const ctx = useContext(TooltipContext)
  if (!ctx) {
    throw new Error(`<Tooltip.${part} /> precisa estar dentro de <Tooltip.Root>`)
  }
  return ctx
}
```

**`Tooltip.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const content = tv({
  base: [
    'absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50',
    'rounded-sm bg-surface-elevated px-3 py-2 text-xs text-text-primary',
    'whitespace-nowrap shadow-lg transition-opacity duration-fast',
  ],
})

export const arrow = tv({
  base: 'absolute left-1/2 -translate-x-1/2 -top-1 h-2 w-2 rotate-45 bg-surface-elevated',
})
```

**`Tooltip.Root.tsx`**:

```tsx
import { useId, useRef, useState, type HTMLAttributes } from 'react'
import { TooltipContext } from './Tooltip.context'

export interface TooltipRootProps extends HTMLAttributes<HTMLDivElement> {
  delayMs?: number
}

export function TooltipRoot({ delayMs = 500, className, children, ...props }: TooltipRootProps) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const contentId = useId()

  const onOpen = () => {
    timeoutRef.current = setTimeout(() => setOpen(true), delayMs)
  }
  const onClose = () => {
    clearTimeout(timeoutRef.current)
    setOpen(false)
  }

  return (
    <TooltipContext.Provider value={{ open, onOpen, onClose, contentId }}>
      <div className={`relative inline-flex ${className ?? ''}`} {...props}>
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

TooltipRoot.displayName = 'Tooltip.Root'
```

**`parts/Tooltip.Trigger.tsx`** — usa o `Slot` caseiro pra `asChild`:

```tsx
import type { ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useTooltipContext } from '../Tooltip.context'

export interface TooltipTriggerProps {
  asChild?: boolean
  children: ReactElement
}

export function TooltipTrigger({ asChild, children }: TooltipTriggerProps) {
  const { onOpen, onClose, contentId } = useTooltipContext('Trigger')
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      aria-describedby={contentId}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocus={onOpen}
      onBlur={onClose}
    >
      {children}
    </Comp>
  )
}

TooltipTrigger.displayName = 'Tooltip.Trigger'
```

**`parts/Tooltip.Content.tsx`**:

```tsx
import type { HTMLAttributes } from 'react'
import { useTooltipContext } from '../Tooltip.context'
import { content } from '../Tooltip.styles'

export function TooltipContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, contentId } = useTooltipContext('Content')
  if (!open) return null
  return <div id={contentId} role="tooltip" className={content({ className })} {...props} />
}

TooltipContent.displayName = 'Tooltip.Content'
```

**`parts/Tooltip.Arrow.tsx`**:

```tsx
import { useTooltipContext } from '../Tooltip.context'
import { arrow } from '../Tooltip.styles'

export function TooltipArrow() {
  useTooltipContext('Arrow')
  return <span aria-hidden className={arrow()} />
}

TooltipArrow.displayName = 'Tooltip.Arrow'
```

**`index.ts`**:

```ts
export { TooltipRoot as Root } from './Tooltip.Root'
export { TooltipTrigger as Trigger } from './parts/Tooltip.Trigger'
export { TooltipContent as Content } from './parts/Tooltip.Content'
export { TooltipArrow as Arrow } from './parts/Tooltip.Arrow'

export type { TooltipRootProps } from './Tooltip.Root'
```

---

## 7. Uso

```jsx
<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Button variant="ghost" size="sm">
      <Button.Icon><InfoIcon /></Button.Icon>
    </Button>
  </Tooltip.Trigger>
  <Tooltip.Content>
    <Tooltip.Arrow />
    Esse campo é obrigatório pra recuperação de conta.
  </Tooltip.Content>
</Tooltip.Root>
```

---

## 8. Teste (`specs/Tooltip.test.tsx`)

```tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as Tooltip from '../index'

describe('Tooltip', () => {
  it('mostra o conteúdo depois do delay, ao passar o mouse', async () => {
    render(
      <Tooltip.Root delayMs={0}>
        <Tooltip.Trigger>Ajuda</Tooltip.Trigger>
        <Tooltip.Content>Texto de ajuda</Tooltip.Content>
      </Tooltip.Root>
    )

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    fireEvent.mouseEnter(screen.getByText('Ajuda'))
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument())
  });

  it('esconde ao tirar o mouse', async () => {
    render(
      <Tooltip.Root delayMs={0}>
        <Tooltip.Trigger>Ajuda</Tooltip.Trigger>
        <Tooltip.Content>Texto de ajuda</Tooltip.Content>
      </Tooltip.Root>
    )
    const trigger = screen.getByText('Ajuda')
    fireEvent.mouseEnter(trigger)
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument())
    fireEvent.mouseLeave(trigger)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  });

  it('lança erro se uma parte for usada fora do Root', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Tooltip.Content>Solto</Tooltip.Content>)).toThrow()
    spy.mockRestore()
  });
})
```
