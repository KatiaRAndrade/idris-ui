# Idris — Hook: `usePresence`

> Infraestrutura P3 do [`idris-roadmap-componentes.md`](./idris-roadmap-componentes.md). Resolve a animação de saída, hoje impossível em Dialog e futuramente em Popover, Select, Toast, Accordion e todos os menus. Vive em `src/hooks/`.

---

## 1. O problema

```tsx
{open && <Conteudo />}
```

Essa linha anima a entrada e **não** anima a saída. O motivo é mecânico: quando `open` vira `false`, o React desmonta o nó imediatamente. Não há elemento no DOM pra transicionar — ele simplesmente some.

O Dialog tem exatamente isso hoje, documentado na seção 11 de [`idris-componente-dialog.md`](./idris-componente-dialog.md): abre com fade, fecha com um corte seco. Em Toast e Accordion isso fica pior ainda — um toast que desaparece sem transição parece bug de renderização, não decisão de design.

## 2. A ideia

Separar dois conceitos que a linha acima trata como um só:

- **`present`** — o que o estado diz: "deveria estar aberto?"
- **`isPresent`** — o que o DOM faz: "ainda precisa estar montado?"

Quando `present` vira `false`, `isPresent` continua `true` até a animação de saída acabar. Nesse intervalo o elemento fica montado com `data-state="closed"`, o CSS reage a esse atributo com a transição de saída, e só quando o `transitionend` chega é que `isPresent` vira `false` e o React desmonta.

O componente nunca sabe que existe animação. Ele só troca um atributo — o mesmo princípio 2 da arquitetura (`data-*` expõe estado, o `.styles.ts` reage) que já governa o Button e o Switch.

## 3. A máquina de estados

| Estado | `present` | Montado? | O que está acontecendo |
|---|---|---|---|
| `unmounted` | `false` | não | Repouso |
| `mounted` | `true` | sim | Aberto (ou animando a entrada) |
| `exiting` | `false` | sim | Animando a saída, esperando o evento |

A única transição interessante é `mounted → exiting → unmounted`. E a pergunta difícil é: **como saber se existe animação de saída?**

Se não existir — porque o componente não tem transição, ou porque a pessoa ativou `prefers-reduced-motion` — o `transitionend` nunca dispara e o elemento fica montado pra sempre. Duas defesas:

1. **Ler o CSS computado** ao entrar em `exiting`. Se `transition-duration` e `animation-name` estiverem zerados, desmonta na hora.
2. **Timeout de segurança** com a duração lida do próprio CSS + margem. Cobre o caso em que o evento não chega (elemento removido de vista, aba em segundo plano, transição interrompida).

A segunda defesa é a que evita o pior bug possível desse hook: um overlay invisível preso no DOM, bloqueando cliques da página inteira.

---

## 4. Estrutura de pastas

```
src/hooks/
├── useControllableState.ts
├── useRovingFocus.ts
├── usePresence.ts             # novo
└── specs/
    └── usePresence.test.tsx
```

Interno, não exportado no barrel público.

---

## 5. Código

**`src/hooks/usePresence.ts`**:

```ts
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UsePresenceResult {
  /** O elemento ainda precisa estar montado? */
  isPresent: boolean
  /** Pendure no nó que carrega a transição de saída. */
  ref: (node: HTMLElement | null) => void
}

/**
 * Mantém o elemento montado até a animação de saída terminar.
 * O nó deve reagir ao `data-state` (open/closed) via CSS — ver seção 6.
 */
export function usePresence(present: boolean): UsePresenceResult {
  const [isPresent, setIsPresent] = useState(present)
  const nodeRef = useRef<HTMLElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const ref = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node
  }, [])

  useEffect(() => {
    if (present) {
      clearTimeout(timeoutRef.current)
      setIsPresent(true)
      return
    }

    const node = nodeRef.current
    if (!node) {
      setIsPresent(false)
      return
    }

    const styles = getComputedStyle(node)
    const duration = getLongestDuration(styles)

    // Sem transição declarada (ou prefers-reduced-motion zerando tudo):
    // não há o que esperar, desmonta agora
    if (duration === 0) {
      setIsPresent(false)
      return
    }

    const finish = () => {
      clearTimeout(timeoutRef.current)
      setIsPresent(false)
    }

    // Só reage ao evento do próprio nó — uma transição de um filho
    // (o thumb de um switch dentro do content, por exemplo) desmontaria cedo demais
    const handleEnd = (event: TransitionEvent | AnimationEvent) => {
      if (event.target === node) finish()
    }

    node.addEventListener('transitionend', handleEnd)
    node.addEventListener('animationend', handleEnd)

    // Rede de segurança: se o evento não chegar, desmonta assim mesmo.
    // Sem isso, um overlay invisível fica preso bloqueando a página inteira.
    timeoutRef.current = setTimeout(finish, duration + 50)

    return () => {
      node.removeEventListener('transitionend', handleEnd)
      node.removeEventListener('animationend', handleEnd)
      clearTimeout(timeoutRef.current)
    }
  }, [present])

  return { isPresent, ref }
}

/** Maior duração declarada, em ms, considerando transition e animation (+ delays). */
function getLongestDuration(styles: CSSStyleDeclaration): number {
  const toMs = (value: string) =>
    value
      .split(',')
      .map((v) => {
        const trimmed = v.trim()
        if (trimmed.endsWith('ms')) return parseFloat(trimmed)
        if (trimmed.endsWith('s')) return parseFloat(trimmed) * 1000
        return 0
      })
      .reduce((max, n) => Math.max(max, n), 0)

  const transition = toMs(styles.transitionDuration) + toMs(styles.transitionDelay)
  const animation =
    styles.animationName === 'none' ? 0 : toMs(styles.animationDuration) + toMs(styles.animationDelay)

  return Math.max(transition, animation)
}
```

> **Por que ler a duração do CSS em vez de receber como prop:** se fosse `usePresence(open, 250)`, a duração viveria em dois lugares — no `.styles.ts` e na chamada do hook — e um dia divergiriam. Lendo do CSS computado, o `duration-base` do arquivo de estilo é a única fonte da verdade, e trocar o token de motion não exige tocar em componente nenhum. É o mesmo raciocínio que fez o estado virar `data-*` em vez de className condicional.

---

## 6. O contrato com o CSS

O hook não anima nada — ele só mantém montado. Quem anima é o `.styles.ts`, reagindo ao `data-state`:

```ts
export const content = tv({
  base: [
    // ...posicionamento e aparência...
    'transition-opacity duration-base',
    'data-[state=open]:opacity-100',
    'data-[state=closed]:opacity-0',
  ],
})
```

**Regra:** o nó que recebe o `ref` do `usePresence` precisa ser o mesmo que carrega a classe de transição. Se o `ref` for pro wrapper e a transição estiver no filho, o `getComputedStyle` lê duração zero e o elemento desmonta na hora — a animação começa e é cortada no primeiro frame. É o erro mais provável ao usar esse hook, e vale um comentário no código.

---

## 7. Retrofit do Dialog

Hoje o `Dialog.Portal` desmonta tudo assim que `open` vira `false`. Depois do retrofit, quem decide quando sair é cada parte animada — e o Portal só precisa saber se **alguma** delas ainda está presente.

### 7.1 O Root ganha um contador de partes presentes

Mesmo padrão de registro que `Title`/`Description` já usam (seção 10 de `idris-componente-dialog.md`):

```ts
// Dialog.context.ts — adições
export interface DialogContextValue {
  // ...o resto igual...
  /** Quantas partes ainda estão montadas (incluindo as que estão animando a saída). */
  presentCount: number
  registerPresence: () => () => void
}
```

```tsx
// Dialog.Root.tsx — adições
const [presentCount, setPresentCount] = useState(0)

const registerPresence = useCallback(() => {
  setPresentCount((n) => n + 1)
  return () => setPresentCount((n) => n - 1)
}, [])
```

### 7.2 O Portal espera as partes saírem

```tsx
// parts/Portal.tsx
export function DialogPortal({ children, container, forceMount }: DialogPortalProps) {
  const { open, presentCount } = useDialogContext('Portal')

  // Continua montado enquanto alguma parte estiver animando a saída
  if (!open && presentCount === 0 && !forceMount) return null

  return <Portal container={container}>{children}</Portal>
}
```

### 7.3 Overlay e Content usam o hook

```tsx
// parts/Overlay.tsx
export const DialogOverlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, forwardedRef) => {
    const { open, modal, registerPresence } = useDialogContext('Overlay')
    const { isPresent, ref: presenceRef } = usePresence(open)

    useEffect(() => {
      if (!isPresent) return
      return registerPresence()
    }, [isPresent, registerPresence])

    if (!modal || !isPresent) return null

    return (
      <div
        ref={mergeRefs(forwardedRef, presenceRef)}
        aria-hidden
        data-state={open ? 'open' : 'closed'}
        className={overlay({ className })}
        {...props}
      />
    )
  }
)
```

O `Content` segue o mesmo padrão, com um detalhe a mais: o `ref` do presence precisa chegar ao nó do `DismissableLayer` (que é quem tem a classe de transição), então os três refs se mesclam ali — `forwardedRef`, `presenceRef` e o interno do próprio `DismissableLayer`.

> **Isso é a terceira aparição do `mergeRefs`** (já estava em `Input.Textarea`, `DismissableLayer` e `FocusScope`). O roadmap já listava extraí-lo pra `primitives/mergeRefs.ts` como retrofit — esse é o momento. Ele já existe implementado dentro do `Slot.tsx`; é só mover pra um arquivo próprio e reexportar.

### 7.4 O que não muda

API pública, testes existentes, comportamento de foco e de `Escape`. Os 11 testes de `specs/Dialog.test.tsx` continuam valendo — só os que verificam desmontagem imediata (`fecha no Escape`, `fecha no clique fora`) precisam do `waitFor` que já têm. Foi sorte, mas é sorte que vale conferir antes de comemorar.

---

## 8. Limites conhecidos

1. **Sem controle de animação interrompida.** Reabrir no meio da saída volta pra `mounted` na hora, sem "rebobinar" a transição — o CSS assume dali. Aceitável na prática, e resolver de verdade exigiria a Web Animations API.
2. **Uma parte, uma transição.** O hook escuta o nó direto e ignora eventos de filhos (de propósito, senão desmontaria cedo). Se um dia uma parte precisar de saída em duas etapas coordenadas, é outro problema.
3. **`getComputedStyle` no momento da saída.** Custa um reflow por fechamento. Irrelevante no volume em que isso acontece.

---

## 9. Teste (`src/hooks/specs/usePresence.test.tsx`)

```tsx
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useState } from 'react'
import { usePresence } from '../usePresence'

function Caixa({ open, duration }: { open: boolean; duration: string }) {
  const { isPresent, ref } = usePresence(open)
  if (!isPresent) return null
  return (
    <div ref={ref} data-testid="caixa" data-state={open ? 'open' : 'closed'} style={{ transitionDuration: duration }}>
      conteúdo
    </div>
  )
}

describe('usePresence', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('monta quando present vira true', () => {
    const { rerender } = render(<Caixa open={false} duration="0s" />)
    expect(screen.queryByTestId('caixa')).not.toBeInTheDocument()

    rerender(<Caixa open duration="0s" />)
    expect(screen.getByTestId('caixa')).toBeInTheDocument()
  })

  it('desmonta na hora quando não há transição', () => {
    const { rerender } = render(<Caixa open duration="0s" />)
    rerender(<Caixa open={false} duration="0s" />)

    expect(screen.queryByTestId('caixa')).not.toBeInTheDocument()
  })

  it('mantém montado com data-state=closed durante a saída', () => {
    const { rerender } = render(<Caixa open duration="0.25s" />)
    rerender(<Caixa open={false} duration="0.25s" />)

    const caixa = screen.getByTestId('caixa')
    expect(caixa).toBeInTheDocument()
    expect(caixa).toHaveAttribute('data-state', 'closed')
  })

  it('desmonta ao receber transitionend do próprio nó', () => {
    const { rerender } = render(<Caixa open duration="0.25s" />)
    rerender(<Caixa open={false} duration="0.25s" />)

    const caixa = screen.getByTestId('caixa')
    act(() => {
      caixa.dispatchEvent(new Event('transitionend', { bubbles: true }))
    })

    expect(screen.queryByTestId('caixa')).not.toBeInTheDocument()
  })

  it('desmonta pelo timeout se o evento nunca chegar', () => {
    const { rerender } = render(<Caixa open duration="0.25s" />)
    rerender(<Caixa open={false} duration="0.25s" />)

    expect(screen.getByTestId('caixa')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(300))
    expect(screen.queryByTestId('caixa')).not.toBeInTheDocument()
  })

  it('cancela a saída se reabrir no meio', () => {
    const { rerender } = render(<Caixa open duration="0.25s" />)
    rerender(<Caixa open={false} duration="0.25s" />)
    rerender(<Caixa open duration="0.25s" />)

    act(() => vi.advanceTimersByTime(300))
    expect(screen.getByTestId('caixa')).toBeInTheDocument()
    expect(screen.getByTestId('caixa')).toHaveAttribute('data-state', 'open')
  })

  it('ignora transitionend vindo de um filho', () => {
    function ComFilho({ open }: { open: boolean }) {
      const { isPresent, ref } = usePresence(open)
      if (!isPresent) return null
      return (
        <div ref={ref} data-testid="pai" style={{ transitionDuration: '0.25s' }}>
          <span data-testid="filho" />
        </div>
      )
    }

    const { rerender } = render(<ComFilho open />)
    rerender(<ComFilho open={false} />)

    act(() => {
      screen.getByTestId('filho').dispatchEvent(new Event('transitionend', { bubbles: true }))
    })

    expect(screen.getByTestId('pai')).toBeInTheDocument()
  })
})
```

> O jsdom não roda transições de verdade, então os testes disparam os eventos na mão e usam timers falsos. O que dá pra garantir aqui é a **máquina de estados**; o comportamento visual fica pro Storybook — vale uma story de Dialog com botão de abrir/fechar só pra ver a saída animando.

---

## 10. Checklist

- [ ] `usePresence.ts` criado, 7 testes passando
- [ ] `mergeRefs` extraído de `Slot.tsx` pra `primitives/mergeRefs.ts` (quarta aparição — chegou a hora)
- [ ] `Dialog.context.ts`: `presentCount` + `registerPresence`
- [ ] `Dialog.Root.tsx`: contador
- [ ] `parts/Portal.tsx`: espera `presentCount === 0`
- [ ] `parts/Overlay.tsx` e `parts/Content.tsx`: consomem o hook
- [ ] `Dialog.styles.ts`: `data-[state=closed]:opacity-0` no overlay e no content
- [ ] Os 11 testes de `specs/Dialog.test.tsx` passando sem alteração
- [ ] Story de Dialog validando a saída animada no navegador
- [ ] Seção 11 de `idris-componente-dialog.md` atualizada — a simplificação deixou de existir
