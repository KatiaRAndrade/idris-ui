# Idris — Hook: `useRovingFocus`

> Infraestrutura P1 do [`idris-roadmap-componentes.md`](./idris-roadmap-componentes.md). Extração do comportamento que o RadioGroup já implementa de forma pontual, generalizado pros 7 componentes que vão precisar dele. Vive em `src/hooks/`, como o `useControllableState` — não renderiza nada.

---

## 1. O que é roving tabindex

Num grupo de checkboxes, `Tab` passa por todos. Num grupo de radios, abas ou botões de toolbar, `Tab` entra **uma vez** no grupo inteiro e as **setas** navegam por dentro. O grupo é uma parada só na ordem de tabulação da página.

A técnica que produz isso: exatamente um item tem `tabIndex={0}` por vez; todos os outros ficam com `-1`. O foco "passeia" (*roves*) entre eles conforme as setas.

Isso não é preferência de UX — é o que a WAI-ARIA Authoring Practices define pra composites (radiogroup, tablist, toolbar, menu). Uma toolbar com 15 botões onde `Tab` para em cada um é acessível na letra e inutilizável na prática.

## 2. Por que virar hook agora

O RadioGroup já escreveu esse comportamento inteiro em `parts/Item.tsx` — navegação por setas via query no DOM, com pulo de itens desabilitados e volta circular. Está documentado como simplificação deliberada na seção 3 de [`idris-componente-radio-group.md`](./idris-componente-radio-group.md), e funciona.

O problema é o que vem a seguir:

| Componente | Fase | Orientação | Ativa ao navegar? |
|---|---|---|---|
| RadioGroup | ✅ em código | `both` | Sim |
| Tabs | 2 | `horizontal` (ou `vertical`) | Configurável |
| ToggleGroup | 2 | `horizontal` | Não |
| Toolbar | 2 | `horizontal` | Não |
| Menubar | 5 | `horizontal` | Não |
| NavigationMenu | 5 | `horizontal` | Não |
| DropdownMenu | 5 | `vertical` | Não |
| Select | 4 | `vertical` | Não |

Sete cópias do mesmo laço de setas, cada uma com uma variação. É exatamente o cenário que o `useControllableState` evitou nos controles booleanos: a terceira cópia sempre esquece de pular o item desabilitado, e a quinta esquece o `preventDefault` que impede a página de rolar.

## 3. Duas estratégias de "quem tem o tabIndex 0"

Aqui está a decisão de design que o RadioGroup escondeu, porque ele só precisava de uma das duas.

**Dirigida por seleção** (RadioGroup, Tabs, ToggleGroup single): o item **selecionado** tem o `0`. Se nada estiver selecionado, o primeiro habilitado assume. Faz sentido porque, ao voltar pro grupo com `Tab`, você quer cair no que está ativo.

**Dirigida por foco** (Toolbar, ToggleGroup multiple, Menubar): não existe "selecionado". O `0` vai pro **último item que teve foco**, e no início pro primeiro habilitado. Faz sentido porque voltar pro grupo deve te devolver onde você parou.

O hook cobre as duas: a navegação por setas é idêntica, e o que muda é só como o `tabIndex` é resolvido. Por isso são duas exportações — uma pro teclado, uma pro `tabIndex`.

## 4. O que fica de fora

- **Typeahead** (digitar "co" e pular pra "Configurações") — é comportamento de menu e de Select, não de composite genérico. Vai morar na engine de menu (P4)
- **Submenus e triângulo de segurança do mouse** — idem
- **`dir="rtl"`** — inverter ←/→ quando a direção é da direita pra esquerda. Só entra se o `DirectionProvider` algum dia entrar (Fase 6, provavelmente nunca)

---

## 5. Estrutura de pastas

```
src/hooks/
├── useControllableState.ts   # já existe
├── useRovingFocus.ts          # novo
└── specs/
    ├── useControllableState.test.ts
    └── useRovingFocus.test.tsx
```

Não é exportado no barrel público — é interno, e a assinatura ainda vai mexer quando Tabs e Select chegarem.

---

## 6. Código

**`src/hooks/useRovingFocus.ts`**:

```ts
import { useCallback } from 'react'
import type { KeyboardEvent } from 'react'

export type RovingOrientation = 'horizontal' | 'vertical' | 'both'

const NEXT_KEYS: Record<RovingOrientation, string[]> = {
  horizontal: ['ArrowRight'],
  vertical: ['ArrowDown'],
  both: ['ArrowRight', 'ArrowDown'],
}

const PREV_KEYS: Record<RovingOrientation, string[]> = {
  horizontal: ['ArrowLeft'],
  vertical: ['ArrowUp'],
  both: ['ArrowLeft', 'ArrowUp'],
}

export interface UseRovingFocusOptions {
  /** Seletor do container, usado com closest() a partir do item. Ex: '[role="radiogroup"]' */
  containerSelector: string
  /** Seletor dos itens navegáveis. Desabilitados já saem daqui. */
  itemSelector?: string
  orientation?: RovingOrientation
  /** Do último volta pro primeiro. Default: true */
  loop?: boolean
  /** Dispara click() no item ao navegar — comportamento nativo de radio. Default: false */
  activateOnNavigate?: boolean
  /** Gancho pra quem precisa reagir sem ativar (ex: Tabs com ativação manual). */
  onNavigate?: (item: HTMLElement) => void
}

/**
 * Devolve um handler de teclado pra pendurar em cada item navegável.
 * Os irmãos são descobertos por query no DOM a partir do container — ver seção 8.
 */
export function useRovingFocus({
  containerSelector,
  itemSelector = '[data-roving-item]:not([disabled])',
  orientation = 'both',
  loop = true,
  activateOnNavigate = false,
  onNavigate,
}: UseRovingFocusOptions) {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const { key } = event
      const isNext = NEXT_KEYS[orientation].includes(key)
      const isPrev = PREV_KEYS[orientation].includes(key)
      const isHome = key === 'Home'
      const isEnd = key === 'End'
      if (!isNext && !isPrev && !isHome && !isEnd) return

      const container = event.currentTarget.closest(containerSelector)
      if (!container) return

      const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector))
      if (items.length === 0) return

      const current = items.indexOf(event.currentTarget)
      if (current === -1) return

      let nextIndex: number
      if (isHome) {
        nextIndex = 0
      } else if (isEnd) {
        nextIndex = items.length - 1
      } else if (isNext) {
        nextIndex = loop ? (current + 1) % items.length : Math.min(current + 1, items.length - 1)
      } else {
        nextIndex = loop ? (current - 1 + items.length) % items.length : Math.max(current - 1, 0)
      }

      const target = items[nextIndex]
      if (!target || target === event.currentTarget) return

      // Impede a página de rolar junto com as setas
      event.preventDefault()
      target.focus()
      onNavigate?.(target)
      if (activateOnNavigate) target.click()
    },
    [containerSelector, itemSelector, orientation, loop, activateOnNavigate, onNavigate]
  )
}

export interface ResolveRovingTabIndexParams {
  /** Este item é o ativo (selecionado, ou o último focado)? */
  isActive: boolean
  /** Existe algum item ativo no grupo? */
  hasActive: boolean
  /** Este é o primeiro item habilitado do grupo? */
  isFirst: boolean
}

/**
 * Exatamente um item do grupo recebe 0. O ativo, ou — se não houver ativo —
 * o primeiro habilitado, pra que o grupo continue alcançável por Tab.
 */
export function resolveRovingTabIndex({
  isActive,
  hasActive,
  isFirst,
}: ResolveRovingTabIndexParams): 0 | -1 {
  if (isActive) return 0
  if (!hasActive && isFirst) return 0
  return -1
}
```

> **`Home`/`End` são ganho novo:** o RadioGroup atual não os suporta. Estão na spec de composites e custam quatro linhas — entram de graça na extração.

---

## 7. Retrofit do RadioGroup

O comportamento não muda. Os testes existentes em `specs/RadioGroup.test.tsx` devem passar **sem alteração nenhuma** — se passarem, a extração está correta. É o melhor teste da refatoração.

Três mudanças em `parts/Item.tsx`:

**1. Marcar o item pra query.** O seletor padrão do hook é `[data-roving-item]`, então o botão ganha o atributo:

```tsx
data-roving-item=""
```

Alternativa: passar `itemSelector: '[role="radio"]:not([disabled])'` e não mexer no markup. Prefiro o `data-roving-item` porque padroniza — Tabs, Toolbar e ToggleGroup usam o mesmo seletor e o hook não precisa saber o `role` de cada um.

**2. Trocar a função local pelo hook:**

```tsx
// antes: handleArrowNavigation(event) definida no fim do arquivo

// depois:
const handleRovingKeyDown = useRovingFocus({
  containerSelector: '[role="radiogroup"]',
  orientation: 'both',        // radio aceita as quatro setas
  loop: true,
  activateOnNavigate: true,   // navegar seleciona — comportamento nativo de radio
})
```

E no `onKeyDown` do botão:

```tsx
onKeyDown={(event) => {
  onKeyDown?.(event)
  if (event.defaultPrevented) return
  handleRovingKeyDown(event)
}}
```

**3. Trocar o cálculo do tabIndex:**

```tsx
// antes
const isRovingTarget = checked || (group.value === undefined && group.firstValue === value)
// ...
tabIndex={isRovingTarget ? 0 : -1}

// depois
tabIndex={resolveRovingTabIndex({
  isActive: checked,
  hasActive: group.value !== undefined,
  isFirst: group.firstValue === value,
})}
```

O registro de itens no contexto (`registerItem`/`firstValue`) **continua existindo** — ele resolve "quem é o primeiro habilitado" em tempo de render, coisa que uma query no DOM não pode fazer na primeira renderização.

**Deletar do `parts/Item.tsx`:** as constantes `NEXT_KEYS`/`PREV_KEYS` e a função `handleArrowNavigation`. Cerca de 30 linhas saem do componente.

---

## 8. Simplificação mantida (e por quê)

A descoberta dos irmãos continua sendo **query no DOM**, não um registro de refs ordenado no contexto. Herdado do RadioGroup de propósito:

- funciona com itens renderizados dinamicamente, filtrados ou reordenados, sem sincronização
- a ordem do DOM é a ordem visual — que é a ordem que a pessoa espera ao apertar a seta
- um registro de refs precisaria reordenar a si mesmo a cada mudança de árvore, o que é mais código e mais chances de dessincronizar

O custo: itens em portais separados não são encontrados pelo `closest()`. Isso importaria num DropdownMenu com submenu em portal próprio — e é justamente onde a engine de menu (P4) vai precisar de tratamento específico. Registrado como limite conhecido, não como bug.

---

## 9. Uso nos próximos componentes

```tsx
// Tabs — horizontal, com ativação automática (padrão da spec ARIA)
const onKeyDown = useRovingFocus({
  containerSelector: '[role="tablist"]',
  orientation: 'horizontal',
  activateOnNavigate: true,
})

// Tabs com ativação manual — navega sem trocar de painel, Enter/Space confirma.
// Necessário quando trocar de aba dispara requisição.
const onKeyDown = useRovingFocus({
  containerSelector: '[role="tablist"]',
  orientation: 'horizontal',
  activateOnNavigate: false,
})

// Toolbar — dirigida por foco, sem loop (chegou na ponta, para)
const onKeyDown = useRovingFocus({
  containerSelector: '[role="toolbar"]',
  orientation: 'horizontal',
  loop: false,
})

// ToggleGroup multiple — navegar nunca ativa, senão você marcaria tudo ao passar
const onKeyDown = useRovingFocus({
  containerSelector: '[data-toggle-group]',
  orientation: 'horizontal',
  activateOnNavigate: false,
})
```

---

## 10. Teste (`src/hooks/specs/useRovingFocus.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useRovingFocus, resolveRovingTabIndex } from '../useRovingFocus'

function Grupo({
  onNavigate,
  ...options
}: Partial<Parameters<typeof useRovingFocus>[0]> = {}) {
  const onKeyDown = useRovingFocus({
    containerSelector: '[role="toolbar"]',
    orientation: 'horizontal',
    onNavigate,
    ...options,
  })

  return (
    <div role="toolbar">
      <button data-roving-item onKeyDown={onKeyDown}>um</button>
      <button data-roving-item onKeyDown={onKeyDown}>dois</button>
      <button data-roving-item onKeyDown={onKeyDown} disabled>três</button>
      <button data-roving-item onKeyDown={onKeyDown}>quatro</button>
    </div>
  )
}

describe('useRovingFocus', () => {
  it('move o foco pro próximo item', async () => {
    render(<Grupo />)
    screen.getByText('um').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('dois')).toHaveFocus()
  })

  it('pula itens desabilitados', async () => {
    render(<Grupo />)
    screen.getByText('dois').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('quatro')).toHaveFocus()
  })

  it('dá a volta no fim quando loop', async () => {
    render(<Grupo />)
    screen.getByText('quatro').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('um')).toHaveFocus()
  })

  it('para na ponta quando loop é false', async () => {
    render(<Grupo loop={false} />)
    screen.getByText('quatro').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('quatro')).toHaveFocus()
  })

  it('Home e End vão às pontas', async () => {
    render(<Grupo />)
    screen.getByText('dois').focus()

    await userEvent.keyboard('{End}')
    expect(screen.getByText('quatro')).toHaveFocus()

    await userEvent.keyboard('{Home}')
    expect(screen.getByText('um')).toHaveFocus()
  })

  it('ignora setas fora da orientação', async () => {
    render(<Grupo orientation="horizontal" />)
    screen.getByText('um').focus()

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByText('um')).toHaveFocus()
  })

  it('aceita as quatro setas quando orientation é both', async () => {
    render(<Grupo orientation="both" />)
    screen.getByText('um').focus()

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByText('dois')).toHaveFocus()
  })

  it('ativa o item ao navegar quando activateOnNavigate', async () => {
    const onClick = vi.fn()
    function ComClick() {
      const onKeyDown = useRovingFocus({
        containerSelector: '[role="toolbar"]',
        orientation: 'horizontal',
        activateOnNavigate: true,
      })
      return (
        <div role="toolbar">
          <button data-roving-item onKeyDown={onKeyDown}>um</button>
          <button data-roving-item onKeyDown={onKeyDown} onClick={onClick}>dois</button>
        </div>
      )
    }

    render(<ComClick />)
    screen.getByText('um').focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('chama onNavigate sem ativar quando activateOnNavigate é false', async () => {
    const onNavigate = vi.fn()
    render(<Grupo onNavigate={onNavigate} />)
    screen.getByText('um').focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(onNavigate).toHaveBeenCalledOnce()
  })
})

describe('resolveRovingTabIndex', () => {
  it('dá 0 ao item ativo', () => {
    expect(resolveRovingTabIndex({ isActive: true, hasActive: true, isFirst: false })).toBe(0)
  })

  it('dá 0 ao primeiro quando nada está ativo', () => {
    expect(resolveRovingTabIndex({ isActive: false, hasActive: false, isFirst: true })).toBe(0)
  })

  it('dá -1 ao primeiro quando existe outro ativo', () => {
    expect(resolveRovingTabIndex({ isActive: false, hasActive: true, isFirst: true })).toBe(-1)
  })
})
```

---

## 11. Checklist

- [ ] `useRovingFocus.ts` criado, 11 testes passando
- [ ] `parts/Item.tsx` do RadioGroup consumindo o hook, com `data-roving-item`
- [ ] `handleArrowNavigation` e as constantes de teclas removidas do RadioGroup
- [ ] **Testes do RadioGroup passando sem nenhuma alteração** — é o critério de sucesso do retrofit
- [ ] Seção 3 de `idris-componente-radio-group.md` atualizada: o texto sobre a simplificação agora aponta pra este documento
