# Idris — Primitivas de formulário (`useControllableState`, `BubbleInput`)

> Peças compartilhadas que **precisam existir antes** de Checkbox, Switch e RadioGroup. Não são componentes visuais — são infraestrutura, então vivem fora de `src/components/`, do mesmo jeito que o `Slot` (ver [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md) seção 3).

---

## 1. Por que essas duas peças existem

Os três componentes da próxima leva (Checkbox, Switch, RadioGroup) têm exatamente os mesmos dois problemas em comum:

1. **Podem ser controlados ou não-controlados pelo consumidor.** Às vezes a pessoa passa `checked` + `onCheckedChange` e quer mandar no estado; às vezes só passa `defaultChecked` e quer que o componente se vire sozinho. Escrever essa lógica dentro de cada componente significaria copiá-la três vezes — e errar de três jeitos diferentes.
2. **Não são um `<input>` nativo, mas precisam se comportar como um dentro de um `<form>`.** Um `<button role="checkbox">` estilizado não entra no `FormData` do formulário. Precisa de um input escondido "boiando" junto (daí o nome `BubbleInput`).

Regra 6 das instruções do projeto já previa o `useControllableState`; esse documento fecha a implementação dele e adiciona a segunda peça, que só apareceu como necessidade ao modelar o Checkbox.

---

## 2. Estrutura de pastas

```
src/
├── primitives/
│   ├── Slot.tsx            # já existe
│   └── BubbleInput.tsx     # novo
└── hooks/
    ├── useControllableState.ts   # novo
    └── specs/
        └── useControllableState.test.ts
```

`BubbleInput` vai pra `primitives/` (renderiza DOM, é uma peça de composição) e `useControllableState` vai pra `hooks/` (não renderiza nada). Nenhum dos dois é exportado no barrel público da lib — são internos, e mudar a assinatura deles não deve ser breaking change pra quem consome o `idris-ui`.

---

## 3. `useControllableState`

### 3.1 A API

```ts
const [checked, setChecked] = useControllableState({
  value: checkedProp,        // undefined = não-controlado
  defaultValue: defaultChecked ?? false,
  onChange: onCheckedChange,
})
```

Depois dessa linha, o componente **para de se importar** com qual dos dois modos está ativo — ele lê `checked` e chama `setChecked` normalmente. Quem for controlado só vai ver o valor mudar quando o consumidor devolver um `value` novo; quem não for, atualiza o estado interno. Toda essa diferença fica presa dentro do hook.

### 3.2 Código

**`src/hooks/useControllableState.ts`**:

```ts
import { useCallback, useEffect, useRef, useState } from 'react'

export type SetControllableState<T> = (next: T | ((prev: T) => T)) => void

export interface UseControllableStateParams<T> {
  /** Valor vindo do consumidor. `undefined` significa não-controlado. */
  value?: T
  /** Valor inicial no modo não-controlado. */
  defaultValue: T
  /** Chamado sempre que o valor muda — nos dois modos. */
  onChange?: (value: T) => void
}

export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, SetControllableState<T>] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? (controlledValue as T) : uncontrolledValue

  // Mantém o onChange sempre atualizado sem entrar nas deps do setValue —
  // senão um handler inline (`onChange={() => ...}`) recriaria o setValue a cada render.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  const setValue = useCallback<SetControllableState<T>>(
    (next) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(value) : next

      // Nada mudou: não avisa ninguém. Evita re-render e onChange redundante.
      if (Object.is(resolved, value)) return

      if (!isControlled) setUncontrolledValue(resolved)
      onChangeRef.current?.(resolved)
    },
    [isControlled, value]
  )

  useControlledWarning(isControlled)

  return [value, setValue]
}

/** Avisa em dev se o componente alternar entre controlado e não-controlado. */
function useControlledWarning(isControlled: boolean) {
  const wasControlled = useRef(isControlled)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    if (wasControlled.current !== isControlled) {
      console.warn(
        `[idris] Um componente mudou de ${wasControlled.current ? 'controlado para não-controlado' : 'não-controlado para controlado'}. ` +
          `Decida um dos dois modos e mantenha — provavelmente o \`value\` virou \`undefined\` sem querer.`
      )
      wasControlled.current = isControlled
    }
  }, [isControlled])
}
```

### 3.3 Duas decisões que valem explicação

**Por que o `onChange` fica fora do updater do `setState`.** A tentação é escrever `setUncontrolledValue(prev => { onChange?.(next); return next })` — resolve o problema de "ler o valor anterior" de graça. Mas o updater do `useState` precisa ser uma função pura, e o React chama updaters **duas vezes** em desenvolvimento (StrictMode) justamente pra pegar quem colocou efeito colateral ali dentro. Resultado: o `onChange` do consumidor dispararia em dobro só em dev, e você passaria uma tarde caçando isso. Por isso o valor é resolvido fora, contra o `value` atual, e o `onChange` é chamado depois — ao custo de o `setValue` depender de `value` nas deps do `useCallback`.

**Por que o `Object.is` antes de avisar.** Sem essa guarda, clicar num Switch já ligado dispararia `onCheckedChange(true)` de novo. Componentes de formulário costumam estar ligados a validação ou requisição — disparar "mudou" quando nada mudou é o tipo de bug que só aparece em produção.

### 3.4 Teste (`src/hooks/specs/useControllableState.test.ts`)

```ts
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useControllableState } from '../useControllableState'

describe('useControllableState', () => {
  it('atualiza o estado interno quando não-controlado', () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: false }))

    act(() => result.current[1](true))
    expect(result.current[0]).toBe(true)
  })

  it('não atualiza sozinho quando controlado — só avisa via onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useControllableState({ value: false, defaultValue: false, onChange })
    )

    act(() => result.current[1](true))
    expect(result.current[0]).toBe(false) // o consumidor manda no valor
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('aceita função updater', () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 1 }))

    act(() => result.current[1]((prev) => prev + 1))
    expect(result.current[0]).toBe(2)
  })

  it('não dispara onChange quando o valor é o mesmo', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: true, onChange })
    )

    act(() => result.current[1](true))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('avisa ao alternar entre controlado e não-controlado', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = renderHook(
      ({ value }: { value?: boolean }) => useControllableState({ value, defaultValue: false }),
      { initialProps: { value: true as boolean | undefined } }
    )

    rerender({ value: undefined })
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
```

---

## 4. `BubbleInput`

### 4.1 O problema

Checkbox, Switch e RadioGroup **não** usam `<input type="checkbox">` como elemento visível. O motivo: o input nativo aceita muito pouca estilização (não dá pra colocar filhos dentro dele, então um `Checkbox.Indicator` com ícone customizado seria impossível) e o comportamento de `appearance: none` + pseudo-elementos varia entre navegadores. A solução — a mesma do Radix — é renderizar um `<button>` com o `role` ARIA correto, que é 100% estilizável, e deixar a acessibilidade por conta do `role` + `aria-checked`.

O custo disso: um `<button>` não é um campo de formulário. Se o componente estiver dentro de um `<form>`, o valor dele simplesmente não aparece no `FormData` no submit. O `BubbleInput` é um input nativo escondido, sincronizado com o estado do componente, só pra resolver isso.

### 4.2 Código

**`src/primitives/BubbleInput.tsx`**:

```tsx
import type { InputHTMLAttributes } from 'react'

export interface BubbleInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'type'> {
  type: 'checkbox' | 'radio'
  checked: boolean
}

/**
 * Input nativo escondido que espelha o estado do componente estilizado,
 * pra que o valor entre no FormData de um <form> nativo.
 * Fica fora da árvore de acessibilidade — quem é anunciado é o botão com role.
 */
export function BubbleInput({ type, checked, ...props }: BubbleInputProps) {
  return (
    <input
      type={type}
      checked={checked}
      // O estado real mora no componente pai; esse input só reflete.
      // `readOnly` evita o warning do React sobre input controlado sem onChange.
      readOnly
      tabIndex={-1}
      aria-hidden
      className="absolute h-0 w-0 opacity-0 pointer-events-none"
      {...props}
    />
  )
}

BubbleInput.displayName = 'BubbleInput'
```

### 4.3 Simplificações deliberadas (vs. o Radix)

No mesmo espírito da seção 3 de [`idris-componente-tooltip.md`](./idris-componente-tooltip.md) — documentadas, não esquecidas:

1. **Sem sincronização via setter nativo.** O Radix não usa `checked` do React aqui: ele pega o setter da property `checked` no `HTMLInputElement.prototype` e dispara um `click`/`input` sintético, pra que bibliotecas que escutam eventos nativos no `<form>` (algumas integrações de react-hook-form, validação nativa) percebam a mudança. Pro Idris v1, o input controlado + `readOnly` cobre o caso principal (o valor entrar no `FormData` no submit). Se aparecer uma integração que precise do evento nativo, é aqui que muda — e muda num arquivo só.
2. **Escondido via CSS, não via `hidden`.** O atributo `hidden` faz alguns navegadores ignorarem o campo em validação nativa. Posicionamento absoluto com opacidade zero mantém o campo "existente" pro formulário e invisível pra pessoa.
3. **Sem `form` prop repassada automaticamente.** Se o componente estiver fora do `<form>` e precisar se associar por `id`, passe `form="meu-form"` — é uma prop nativa e já passa direto pelo spread.

---

## 5. Checklist antes de seguir pros componentes

- [ ] `src/hooks/useControllableState.ts` criado, com os 5 testes passando
- [ ] `src/primitives/BubbleInput.tsx` criado
- [ ] Nenhum dos dois exportado em `src/index.ts` (são internos)
- [ ] Só depois disso: Checkbox → Switch → RadioGroup, nessa ordem (cada um reaproveita padrões do anterior)
