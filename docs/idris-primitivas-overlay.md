# Idris — Primitivas de overlay (`Portal`, `VisuallyHidden`, `DismissableLayer`, `FocusScope`, `useScrollLock`)

> Infraestrutura compartilhada por Dialog, Popover, Select e DropdownMenu. Não são componentes visuais — vivem fora de `src/components/`, como o `Slot` (ver [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md) seção 3) e as primitivas de formulário ([`idris-primitivas-formulario.md`](./idris-primitivas-formulario.md)).

---

## 1. Por que essas peças vêm antes do Dialog

Um modal parece um componente simples: um fundo escuro e uma caixa no meio. O que ele é de verdade são cinco comportamentos independentes acontecendo juntos:

| Comportamento | Peça |
|---|---|
| Renderizar fora da árvore do pai, escapando de `overflow: hidden` e `z-index` | `Portal` |
| Fechar no `Escape` e no clique fora, respeitando camadas empilhadas | `DismissableLayer` |
| Prender o foco dentro e devolvê-lo ao trigger ao fechar | `FocusScope` |
| Impedir a página atrás de rolar | `useScrollLock` |
| Dar nome acessível a coisas sem texto visível | `VisuallyHidden` |

Todos os cinco reaparecem no Popover, no Select e no DropdownMenu com pequenas variações. Escrever isso dentro do `Dialog.Content` significaria reescrever quatro vezes — e é exatamente onde bugs de acessibilidade nascem, porque a terceira cópia sempre esquece de devolver o foco.

Esse documento é o maior investimento de infra do projeto até agora. Depois dele, o Dialog é quase só estilo.

---

## 2. Estrutura de pastas

```
src/
├── primitives/
│   ├── Slot.tsx              # já existe
│   ├── BubbleInput.tsx        # já existe
│   ├── Portal.tsx             # novo
│   ├── VisuallyHidden.tsx     # novo
│   ├── DismissableLayer.tsx   # novo
│   ├── FocusScope.tsx         # novo
│   └── specs/
│       ├── DismissableLayer.test.tsx
│       └── FocusScope.test.tsx
└── hooks/
    ├── useControllableState.ts  # já existe
    └── useScrollLock.ts          # novo
```

`Portal` e `VisuallyHidden` são exportados no barrel público (são úteis pra quem consome a lib). `DismissableLayer`, `FocusScope` e `useScrollLock` ficam internos por enquanto — a API deles ainda vai mudar quando o Popover chegar, e não queremos isso preso a semver.

---

## 3. `Portal`

### 3.1 O problema

Um modal renderizado dentro de um `<div class="overflow-hidden">` é cortado. Dentro de um `position: relative` com `z-index: 1`, aparece atrás de outra coisa da página. Nenhum `z-index: 9999` resolve isso de forma confiável, porque `z-index` só compara elementos dentro do mesmo contexto de empilhamento. A única solução robusta é renderizar em outro lugar da árvore DOM — normalmente direto no `<body>`.

### 3.2 Código

**`src/primitives/Portal.tsx`**:

```tsx
import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface PortalProps {
  children: ReactNode
  /** Onde renderizar. Default: document.body */
  container?: Element | null
}

export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  // No servidor não existe `document`. Só liberamos o portal depois
  // da primeira renderização no cliente — sem isso, quebra em SSR (Next.js).
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const target = container ?? document.body
  return createPortal(children, target)
}

Portal.displayName = 'Portal'
```

> **Consequência do portal que vale saber:** a árvore React continua a mesma — contexto atravessa o portal normalmente (é por isso que `Dialog.Content` dentro de `Dialog.Portal` ainda enxerga o `Dialog.Root`). O que muda é só a posição no DOM. Eventos também continuam borbulhando pela árvore React, não pela DOM — o que é ótimo aqui e surpreendente na primeira vez que se vê.

---

## 4. `VisuallyHidden`

Esconde visualmente mantendo o conteúdo acessível a leitores de tela. Necessário porque `display: none` e `visibility: hidden` removem o elemento da árvore de acessibilidade também.

**`src/primitives/VisuallyHidden.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'

export const VisuallyHidden = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    // `sr-only` é utilitário nativo do Tailwind: position absolute, 1×1px,
    // clip-path, overflow hidden — some da tela sem sair do a11y tree
    <span ref={ref} className={`sr-only ${className ?? ''}`} {...props} />
  )
)

VisuallyHidden.displayName = 'VisuallyHidden'
```

Uso típico: o `Dialog.Title` é obrigatório pra acessibilidade, mas nem todo modal tem título visível no design. `<VisuallyHidden><Dialog.Title>Confirmar exclusão</Dialog.Title></VisuallyHidden>` resolve sem inventar um `title` invisível por prop.

---

## 5. `DismissableLayer`

### 5.1 O problema das camadas

Fechar no `Escape` é trivial. O que não é trivial: um Select aberto **dentro** de um Dialog. Apertar `Escape` deve fechar o Select, não o Dialog. Se cada componente registrar seu próprio listener no `document`, os dois fecham juntos.

A solução é uma **pilha de camadas** em nível de módulo: cada overlay que monta entra na pilha, e só a camada do topo reage ao `Escape` e ao clique fora. É a mesma ideia que o Radix implementa, reduzida ao necessário.

### 5.2 Código

**`src/primitives/DismissableLayer.tsx`**:

```tsx
import { forwardRef, useEffect, useRef, type HTMLAttributes } from 'react'

/** Pilha de camadas abertas — a última é a do topo. */
const layerStack: symbol[] = []

export interface DismissableLayerProps extends HTMLAttributes<HTMLDivElement> {
  /** Chamado no Escape ou no clique fora. Chame preventDefault no evento pra cancelar. */
  onDismiss?: () => void
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
  /** Desliga o fechamento por clique fora (ex: AlertDialog). */
  disableOutsidePointerDown?: boolean
}

export const DismissableLayer = forwardRef<HTMLDivElement, DismissableLayerProps>(
  (
    {
      onDismiss,
      onEscapeKeyDown,
      onPointerDownOutside,
      disableOutsidePointerDown = false,
      children,
      ...props
    },
    forwardedRef
  ) => {
    const nodeRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      const layerId = Symbol('idris-layer')
      layerStack.push(layerId)

      const isTopLayer = () => layerStack[layerStack.length - 1] === layerId

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || !isTopLayer()) return
        onEscapeKeyDown?.(event)
        if (!event.defaultPrevented) onDismiss?.()
      }

      const handlePointerDown = (event: PointerEvent) => {
        if (disableOutsidePointerDown || !isTopLayer()) return
        const node = nodeRef.current
        if (!node || node.contains(event.target as Node)) return
        onPointerDownOutside?.(event)
        if (!event.defaultPrevented) onDismiss?.()
      }

      // `pointerdown` e não `click`: se o clique fora abrir um menu ou mover
      // o conteúdo, o `click` pode acabar disparando sobre outro elemento.
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('pointerdown', handlePointerDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('pointerdown', handlePointerDown)
        const index = layerStack.indexOf(layerId)
        if (index !== -1) layerStack.splice(index, 1)
      }
    }, [onDismiss, onEscapeKeyDown, onPointerDownOutside, disableOutsidePointerDown])

    return (
      <div
        ref={(node) => {
          nodeRef.current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) forwardedRef.current = node
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

DismissableLayer.displayName = 'DismissableLayer'
```

> **Por que a pilha é módulo-level e não Context:** camadas podem estar em portais diferentes, montadas por componentes que não têm relação de ancestralidade nenhuma. Um Context exigiria um Provider global envolvendo o app — que é exatamente o tipo de coisa que a gente evitou no Tooltip ao não criar um `Tooltip.Provider`. O array de símbolos é global, mas é detalhe interno de um arquivo.

---

## 6. `FocusScope`

### 6.1 Os dois comportamentos

1. **Prender o foco.** `Tab` no último elemento focável volta pro primeiro; `Shift+Tab` no primeiro vai pro último. Sem isso, a pessoa navegando por teclado sai do modal e fica presa atrás do overlay, interagindo com uma página que ela não vê.
2. **Devolver o foco.** Ao fechar, o foco volta pro elemento que abriu o modal. Sem isso, o foco vai pro `<body>` e a próxima tecla `Tab` recomeça do topo da página — a pessoa perde completamente o lugar onde estava.

O segundo é o mais esquecido e o mais irritante na prática.

### 6.2 Código

**`src/primitives/FocusScope.tsx`**:

```tsx
import { forwardRef, useEffect, useRef, type HTMLAttributes } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    // offsetParent nulo = escondido por display:none ou por um ancestral escondido
    (el) => el.offsetParent !== null || el === document.activeElement
  )
}

export interface FocusScopeProps extends HTMLAttributes<HTMLDivElement> {
  /** Prende o Tab dentro do escopo. */
  trapped?: boolean
  /** Foca o primeiro elemento focável ao montar. */
  autoFocus?: boolean
  /** Devolve o foco ao elemento anterior ao desmontar. */
  restoreFocus?: boolean
}

export const FocusScope = forwardRef<HTMLDivElement, FocusScopeProps>(
  (
    { trapped = true, autoFocus = true, restoreFocus = true, children, tabIndex, ...props },
    forwardedRef
  ) => {
    const nodeRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      const node = nodeRef.current
      if (!node) return

      const previouslyFocused = document.activeElement as HTMLElement | null

      if (autoFocus) {
        const [first] = getFocusable(node)
        // Se não há nada focável dentro, foca o container (por isso o tabIndex -1 abaixo)
        ;(first ?? node).focus()
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (!trapped || event.key !== 'Tab') return

        const focusable = getFocusable(node)
        if (focusable.length === 0) {
          event.preventDefault()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement

        if (event.shiftKey && active === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }

      node.addEventListener('keydown', handleKeyDown)

      return () => {
        node.removeEventListener('keydown', handleKeyDown)
        // Devolve o foco só se o elemento ainda existir no documento —
        // ele pode ter sido removido junto com o que abriu o modal
        if (restoreFocus && previouslyFocused?.isConnected) previouslyFocused.focus()
      }
    }, [trapped, autoFocus, restoreFocus])

    return (
      <div
        ref={(node) => {
          nodeRef.current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) forwardedRef.current = node
        }}
        tabIndex={tabIndex ?? -1}
        {...props}
      >
        {children}
      </div>
    )
  }
)

FocusScope.displayName = 'FocusScope'
```

### 6.3 Simplificações deliberadas (v1)

No mesmo espírito da seção 3 de [`idris-componente-tooltip.md`](./idris-componente-tooltip.md):

1. **A lista de focáveis é recalculada a cada `Tab`**, em vez de mantida por um `MutationObserver`. Custa uma query por tecla, mas funciona com conteúdo que aparece e some dentro do modal. Trocar por observer é otimização prematura aqui.
2. **Sem `inert` no resto da página.** O foco fica preso via `Tab`, mas um leitor de tela em modo de navegação livre ainda consegue "ler" o conteúdo atrás. A solução completa é o atributo `inert` nos irmãos do portal (ou `aria-hidden`). Ficou de fora da v1 porque exige coordenar a árvore inteira; o `aria-modal="true"` do `Dialog.Content` cobre o caso principal na maioria dos leitores atuais.
3. **Sem `onEscapeKeyDown` aqui** — quem cuida de `Escape` é o `DismissableLayer`. Cada peça faz uma coisa.

---

## 7. `useScrollLock`

Impede a página de fundo de rolar enquanto o modal está aberto, sem causar o "pulo" de layout que acontece quando a barra de rolagem some.

**`src/hooks/useScrollLock.ts`**:

```ts
import { useLayoutEffect } from 'react'

/** Quantos overlays estão travando o scroll agora — evita destravar cedo demais. */
let lockCount = 0
let originalOverflow = ''
let originalPaddingRight = ''

export function useScrollLock(enabled = true) {
  useLayoutEffect(() => {
    if (!enabled) return

    lockCount += 1

    if (lockCount === 1) {
      const { body } = document
      originalOverflow = body.style.overflow
      originalPaddingRight = body.style.paddingRight

      // Compensa a largura da barra de rolagem que vai sumir —
      // sem isso a página inteira "pula" pra direita ao abrir o modal
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      const current = parseInt(window.getComputedStyle(body).paddingRight, 10) || 0

      body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) body.style.paddingRight = `${current + scrollbarWidth}px`
    }

    return () => {
      lockCount -= 1
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [enabled])
}
```

> **Por que o contador:** com um Dialog aberto e um Select aberto dentro dele, fechar o Select não pode destravar o scroll da página — o Dialog ainda está aberto. Sem o contador, o segundo overlay a fechar restauraria o estilo original enquanto o primeiro ainda precisa dele.

---

## 8. Testes

**`src/primitives/specs/DismissableLayer.test.tsx`**:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DismissableLayer } from '../DismissableLayer'

describe('DismissableLayer', () => {
  it('chama onDismiss no Escape', async () => {
    const onDismiss = vi.fn()
    render(<DismissableLayer onDismiss={onDismiss}>conteúdo</DismissableLayer>)

    await userEvent.keyboard('{Escape}')
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('chama onDismiss no clique fora, não no clique dentro', async () => {
    const onDismiss = vi.fn()
    render(
      <>
        <button>fora</button>
        <DismissableLayer onDismiss={onDismiss}>
          <button>dentro</button>
        </DismissableLayer>
      </>
    )

    await userEvent.click(screen.getByText('dentro'))
    expect(onDismiss).not.toHaveBeenCalled()

    await userEvent.click(screen.getByText('fora'))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('só a camada do topo reage ao Escape', async () => {
    const onDismissBase = vi.fn()
    const onDismissTopo = vi.fn()
    render(
      <DismissableLayer onDismiss={onDismissBase}>
        <DismissableLayer onDismiss={onDismissTopo}>topo</DismissableLayer>
      </DismissableLayer>
    )

    await userEvent.keyboard('{Escape}')
    expect(onDismissTopo).toHaveBeenCalledOnce()
    expect(onDismissBase).not.toHaveBeenCalled()
  })

  it('não fecha no clique fora quando disableOutsidePointerDown', async () => {
    const onDismiss = vi.fn()
    render(
      <>
        <button>fora</button>
        <DismissableLayer onDismiss={onDismiss} disableOutsidePointerDown>
          conteúdo
        </DismissableLayer>
      </>
    )

    await userEvent.click(screen.getByText('fora'))
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('permite cancelar via preventDefault', async () => {
    const onDismiss = vi.fn()
    render(
      <DismissableLayer onDismiss={onDismiss} onEscapeKeyDown={(e) => e.preventDefault()}>
        conteúdo
      </DismissableLayer>
    )

    await userEvent.keyboard('{Escape}')
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
```

**`src/primitives/specs/FocusScope.test.tsx`**:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useState } from 'react'
import { FocusScope } from '../FocusScope'

describe('FocusScope', () => {
  it('foca o primeiro elemento focável ao montar', () => {
    render(
      <FocusScope>
        <button>primeiro</button>
        <button>segundo</button>
      </FocusScope>
    )
    expect(screen.getByText('primeiro')).toHaveFocus()
  })

  it('prende o Tab dentro do escopo', async () => {
    render(
      <FocusScope>
        <button>primeiro</button>
        <button>último</button>
      </FocusScope>
    )

    await userEvent.tab() // primeiro → último
    expect(screen.getByText('último')).toHaveFocus()

    await userEvent.tab() // último → dá a volta pro primeiro
    expect(screen.getByText('primeiro')).toHaveFocus()
  })

  it('volta pro último com Shift+Tab a partir do primeiro', async () => {
    render(
      <FocusScope>
        <button>primeiro</button>
        <button>último</button>
      </FocusScope>
    )

    await userEvent.tab({ shift: true })
    expect(screen.getByText('último')).toHaveFocus()
  })

  it('devolve o foco ao desmontar', async () => {
    function Exemplo() {
      const [aberto, setAberto] = useState(false)
      return (
        <>
          <button onClick={() => setAberto(true)}>abrir</button>
          {aberto && (
            <FocusScope>
              <button onClick={() => setAberto(false)}>fechar</button>
            </FocusScope>
          )}
        </>
      )
    }

    render(<Exemplo />)
    await userEvent.click(screen.getByText('abrir'))
    expect(screen.getByText('fechar')).toHaveFocus()

    await userEvent.click(screen.getByText('fechar'))
    expect(screen.getByText('abrir')).toHaveFocus()
  })

  it('não prende o Tab quando trapped é false', async () => {
    render(
      <>
        <FocusScope trapped={false}>
          <button>dentro</button>
        </FocusScope>
        <button>fora</button>
      </>
    )

    await userEvent.tab()
    expect(screen.getByText('fora')).toHaveFocus()
  })
})
```

---

## 9. Checklist antes de seguir pro Dialog

- [ ] `Portal.tsx` e `VisuallyHidden.tsx` criados e exportados em `src/index.ts`
- [ ] `DismissableLayer.tsx` com os 5 testes passando (o de camadas empilhadas é o que mais importa)
- [ ] `FocusScope.tsx` com os 5 testes passando (o de devolver o foco é o mais esquecido)
- [ ] `useScrollLock.ts` criado — sem teste unitário: o jsdom não tem barra de rolagem, então a compensação de largura não é testável ali. Validar no Storybook, numa página propositalmente longa
- [ ] Só depois disso: Dialog → AlertDialog
