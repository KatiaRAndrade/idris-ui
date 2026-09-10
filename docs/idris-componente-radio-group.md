# Idris — Componente: RadioGroup

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato dos demais `idris-componente-*.md`. Depende de [`idris-primitivas-formulario.md`](./idris-primitivas-formulario.md) e reaproveita o esqueleto de [`idris-componente-checkbox.md`](./idris-componente-checkbox.md).

---

## 1. Por que tem `.Root` explícito

Rodando a sequência de decisão da seção 8 de `idris-estrutura-componentes.md`:

1. **Elemento DOM único?** Não. São N botões irmãos que precisam concordar sobre qual está selecionado, mais um `name` compartilhado pro formulário. → **`.Root` explícito**, como Input e Tooltip.
2. **Partes:** `Item` (cada opção) e `Indicator` (a bolinha interna do item selecionado).
3. **Precisam saber do pai?** Sim: qual o valor selecionado, o `size`, se o grupo está desabilitado. → contexto obrigatório.
4. **Estado compartilhado entre partes distantes?** Sim — clicar num item desmarca outro. É o critério que torna o `.Root` não-opcional.

Diferença importante em relação ao Checkbox: lá, cada caixa é independente e o estado mora nela. Aqui o estado mora no grupo, e os itens são só projeções dele. É por isso que o RadioGroup nunca poderia ser "vários Checkbox com `type=radio`".

## 2. Partes

| Parte | Elemento | Papel |
|---|---|---|
| `RadioGroup.Root` | `<div role="radiogroup">` | Guarda o `value` (controlado ou não), gera o `name`, coordena teclado, contexto |
| `RadioGroup.Item` | `<button role="radio">` | Uma opção. Recebe `value` obrigatório |
| `RadioGroup.Indicator` | `<span>` | A bolinha interna — só renderiza no item selecionado |

Sem parte de rótulo: cada item é acompanhado por um `<Text as="label" htmlFor>` externo, e o grupo inteiro por um `aria-labelledby` apontando pro título da pergunta.

## 3. Roving tabindex — o comportamento que diferencia radio de checkbox

Num grupo de checkboxes, `Tab` passa por todos. Num grupo de radios, `Tab` entra **uma vez** no grupo inteiro e as **setas** navegam entre as opções, selecionando conforme se movem. Esse padrão se chama *roving tabindex*: exatamente um item do grupo tem `tabIndex={0}` por vez; todos os outros ficam com `-1`.

Qual item recebe o `0`:
- o item selecionado, se houver um;
- senão, o primeiro item habilitado do grupo.

**Como o Item descobre se é o primeiro:** cada item habilitado se registra no contexto ao montar (`useEffect` + callback), no mesmo padrão que `Input.Hint`/`Input.Error` já usam pra montar o `aria-describedby`. A ordem de registro corresponde à ordem de montagem, que na montagem inicial é a ordem do DOM.

**Retrofit:** a navegação por setas e o cálculo do `tabIndex` foram extraídos pro hook compartilhado [`useRovingFocus`](./idris-hook-use-roving-focus.md), que outros seis componentes (Tabs, ToggleGroup, Toolbar, Menubar, NavigationMenu, DropdownMenu, Select) também vão consumir. O comportamento não mudou — os irmãos continuam descobertos por query no DOM (`closest('[role="radiogroup"]')` → `querySelectorAll('[data-roving-item]')`) em vez de um registro de refs no contexto, pelos mesmos motivos documentados na seção 8 daquele hook: mais simples, funciona com itens renderizados dinamicamente, resolve sozinho o caso de itens reordenados. O ganho novo, de graça na extração: `Home`/`End` agora levam às pontas do grupo.

## 4. Tamanhos, orientação e estados

- **Sem variantes de cor** — mesmo argumento de Checkbox e Switch.
- **Tamanhos:** `sm` (16px) / `md` (20px) / `lg` (24px), a mesma escala de nomes de Button/Input/Checkbox.
- **Orientação:** `vertical` (padrão) ou `horizontal` — muda o layout e o `aria-orientation`. As quatro setas funcionam nas duas orientações, porque forçar "só ↑↓ no vertical" quebra a expectativa de quem navega no teclado sem olhar o layout.
- **Estados:** `default`, `hover`, `focus-visible`, `checked`, `disabled` (no grupo inteiro ou por item), `invalid` (no grupo).

| Atributo | Onde | Valores |
|---|---|---|
| `data-orientation` | Root | `vertical` · `horizontal` |
| `data-invalid` / `data-disabled` | Root e Item | presente ou ausente |
| `data-state` | Item | `checked` · `unchecked` |
| `data-size` | Root e Item | `sm` · `md` · `lg` |

## 5. Tokens usados

`brand-500` (borda e bolinha do item selecionado), `brand-400` (ring de foco), `surface` (fundo do item), `border-thin`, `error` (grupo inválido), `radius-full` (radio é redondo — a diferença visual de forma com o Checkbox quadrado é o que sinaliza "escolha única" antes mesmo de interagir), `space-2`/`space-3` (gap entre opções), `duration-fast`.

---

## 6. Estrutura de pastas

```
src/components/RadioGroup/
├── RadioGroup.Root.tsx     # root explícito — estado, name, contexto, BubbleInput
├── RadioGroup.context.ts   # dois contextos: o do grupo e o do item
├── RadioGroup.styles.ts
├── RadioGroup.stories.tsx
├── index.ts
├── parts/
│   ├── Item.tsx            # exporta RadioGroupItem (displayName "RadioGroup.Item")
│   └── Indicator.tsx       # exporta RadioGroupIndicator
└── specs/
    ├── RadioGroup.test.tsx
    └── __snapshots__/
```

---

## 7. Código

**`RadioGroup.context.ts`** — dois contextos, porque `Indicator` precisa saber do **item** em que está, não só do grupo:

```ts
import { createContext, useContext } from 'react'

export type RadioGroupSize = 'sm' | 'md' | 'lg'
export type RadioGroupOrientation = 'vertical' | 'horizontal'

export interface RadioGroupContextValue {
  value: string | undefined
  setValue: (value: string) => void
  size: RadioGroupSize
  disabled: boolean
  invalid: boolean
  /** Primeiro item habilitado — recebe tabIndex 0 quando nada está selecionado. */
  firstValue: string | undefined
  /** Cada item habilitado se registra ao montar. Devolve a função de limpeza. */
  registerItem: (value: string) => () => void
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export function useRadioGroupContext(part: string) {
  const ctx = useContext(RadioGroupContext)
  if (!ctx) {
    throw new Error(`<RadioGroup.${part} /> precisa estar dentro de <RadioGroup.Root>`)
  }
  return ctx
}

/** Contexto do item — só pro Indicator saber se deve aparecer. */
export interface RadioItemContextValue {
  checked: boolean
  size: RadioGroupSize
}

export const RadioItemContext = createContext<RadioItemContextValue | null>(null)

export function useRadioItemContext(part: string) {
  const ctx = useContext(RadioItemContext)
  if (!ctx) {
    throw new Error(`<RadioGroup.${part} /> precisa estar dentro de <RadioGroup.Item>`)
  }
  return ctx
}
```

**`RadioGroup.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const root = tv({
  base: 'flex',
  variants: {
    orientation: {
      vertical: 'flex-col gap-3',
      horizontal: 'flex-row items-center gap-4',
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

export const item = tv({
  base: [
    'inline-flex shrink-0 items-center justify-center',
    'rounded-full border border-white/20 bg-surface',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
    'hover:border-white/40',
    'data-[state=checked]:border-brand-500',
    'data-[invalid]:border-error data-[invalid]:focus-visible:ring-error',
    'data-[disabled]:opacity-40 data-[disabled]:pointer-events-none',
  ],
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: { size: 'md' },
})

export const indicator = tv({
  base: 'rounded-full bg-brand-500',
  variants: {
    size: {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
      lg: 'h-2.5 w-2.5',
    },
  },
  defaultVariants: { size: 'md' },
})
```

**`RadioGroup.Root.tsx`**:

```tsx
import { forwardRef, useCallback, useId, useMemo, useState, type HTMLAttributes } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { BubbleInput } from '../../primitives/BubbleInput'
import { root } from './RadioGroup.styles'
import {
  RadioGroupContext,
  type RadioGroupOrientation,
  type RadioGroupSize,
} from './RadioGroup.context'

export interface RadioGroupRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: RadioGroupSize
  orientation?: RadioGroupOrientation
  disabled?: boolean
  invalid?: boolean
  /** Nome do campo no FormData — só necessário dentro de um <form> nativo. */
  name?: string
}

export const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupRootProps>(
  (
    {
      className,
      value: valueProp,
      defaultValue,
      onValueChange,
      size = 'md',
      orientation = 'vertical',
      disabled = false,
      invalid = false,
      name,
      children,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useControllableState<string | undefined>({
      value: valueProp,
      defaultValue,
      onChange: onValueChange as (v: string | undefined) => void,
    })

    // Registro dos itens habilitados, em ordem de montagem —
    // mesmo padrão do registerDescribedBy do Input.Root
    const [items, setItems] = useState<string[]>([])
    const registerItem = useCallback((itemValue: string) => {
      setItems((prev) => (prev.includes(itemValue) ? prev : [...prev, itemValue]))
      return () => setItems((prev) => prev.filter((v) => v !== itemValue))
    }, [])

    const ctx = useMemo(
      () => ({
        value,
        setValue: setValue as (v: string) => void,
        size,
        disabled,
        invalid,
        firstValue: items[0],
        registerItem,
      }),
      [value, setValue, size, disabled, invalid, items, registerItem]
    )

    const fallbackName = useId()

    return (
      <RadioGroupContext.Provider value={ctx}>
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          aria-invalid={invalid || undefined}
          aria-disabled={disabled || undefined}
          data-orientation={orientation}
          data-size={size}
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
          className={root({ orientation, className })}
          {...props}
        >
          {children}
        </div>

        {name ? (
          <BubbleInput
            type="radio"
            name={name}
            value={value ?? ''}
            checked={value !== undefined}
            disabled={disabled}
            id={fallbackName}
          />
        ) : null}
      </RadioGroupContext.Provider>
    )
  }
)

RadioGroupRoot.displayName = 'RadioGroup.Root'
```

**`parts/Item.tsx`** — onde mora o roving tabindex e a navegação por setas:

```tsx
import { forwardRef, useEffect, type ButtonHTMLAttributes } from 'react'
import { useRadioGroupContext, RadioItemContext } from '../RadioGroup.context'
import { item as itemStyles } from '../RadioGroup.styles'

export interface RadioGroupItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'type'> {
  value: string
}

export const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, disabled, onClick, onKeyDown, children, ...props }, ref) => {
    const group = useRadioGroupContext('Item')
    const isDisabled = disabled || group.disabled
    const checked = group.value === value

    // Só itens habilitados entram na disputa pelo tabIndex 0
    useEffect(() => {
      if (isDisabled) return
      return group.registerItem(value)
    }, [isDisabled, value, group.registerItem]) // eslint-disable-line react-hooks/exhaustive-deps

    const isRovingTarget = checked || (group.value === undefined && group.firstValue === value)

    return (
      <RadioItemContext.Provider value={{ checked, size: group.size }}>
        <button
          ref={ref}
          type="button"
          role="radio"
          aria-checked={checked}
          tabIndex={isRovingTarget ? 0 : -1}
          disabled={isDisabled}
          data-state={checked ? 'checked' : 'unchecked'}
          data-size={group.size}
          data-invalid={group.invalid || undefined}
          data-disabled={isDisabled || undefined}
          className={itemStyles({ size: group.size, className })}
          onClick={(event) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            group.setValue(value)
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (event.defaultPrevented) return
            handleArrowNavigation(event)
          }}
          {...props}
        >
          {children}
        </button>
      </RadioItemContext.Provider>
    )
  }
)

const NEXT_KEYS = ['ArrowDown', 'ArrowRight']
const PREV_KEYS = ['ArrowUp', 'ArrowLeft']

/**
 * Move o foco pro item vizinho e o seleciona (padrão ARIA de radiogroup:
 * navegar já seleciona). Os irmãos vêm de uma query no DOM — ver seção 3.
 */
function handleArrowNavigation(event: React.KeyboardEvent<HTMLButtonElement>) {
  const isNext = NEXT_KEYS.includes(event.key)
  const isPrev = PREV_KEYS.includes(event.key)
  if (!isNext && !isPrev) return

  const group = event.currentTarget.closest('[role="radiogroup"]')
  if (!group) return

  const items = Array.from(
    group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])')
  )
  const current = items.indexOf(event.currentTarget)
  if (current === -1) return

  // Circular: do último volta pro primeiro, e vice-versa
  const nextIndex = isNext
    ? (current + 1) % items.length
    : (current - 1 + items.length) % items.length

  event.preventDefault() // impede a página de rolar com as setas
  items[nextIndex].focus()
  items[nextIndex].click() // navegar seleciona
}

RadioGroupItem.displayName = 'RadioGroup.Item'
```

**`parts/Indicator.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { useRadioItemContext } from '../RadioGroup.context'
import { indicator } from '../RadioGroup.styles'

export const RadioGroupIndicator = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    const { checked, size } = useRadioItemContext('Indicator')
    if (!checked) return null
    return <span ref={ref} aria-hidden className={indicator({ size, className })} {...props} />
  }
)

RadioGroupIndicator.displayName = 'RadioGroup.Indicator'
```

**`index.ts`** — igual ao Input: objeto de partes, não `Object.assign`, porque não existe um elemento único que "seja" a raiz:

```ts
export { RadioGroupRoot as Root } from './RadioGroup.Root'
export { RadioGroupItem as Item } from './parts/Item'
export { RadioGroupIndicator as Indicator } from './parts/Indicator'

export type { RadioGroupRootProps } from './RadioGroup.Root'
export type { RadioGroupItemProps } from './parts/Item'
export type { RadioGroupSize, RadioGroupOrientation } from './RadioGroup.context'
```

Consumido como `import * as RadioGroup from './RadioGroup'`, ou reexportado no barrel principal como `export * as RadioGroup from './RadioGroup'`.

---

## 8. Uso

```jsx
// Grupo simples, com rótulo do grupo e de cada opção
<Text id="label-plano" size="label">Plano</Text>
<RadioGroup.Root aria-labelledby="label-plano" defaultValue="mensal">
  <div className="flex items-center gap-2">
    <RadioGroup.Item value="mensal" id="plano-mensal">
      <RadioGroup.Indicator />
    </RadioGroup.Item>
    <Text as="label" size="label" htmlFor="plano-mensal">Mensal</Text>
  </div>

  <div className="flex items-center gap-2">
    <RadioGroup.Item value="anual" id="plano-anual">
      <RadioGroup.Indicator />
    </RadioGroup.Item>
    <Text as="label" size="label" htmlFor="plano-anual">Anual</Text>
    <Badge variant="accent" size="sm">
      <Badge.Label>−20%</Badge.Label>
    </Badge>
  </div>
</RadioGroup.Root>

// Controlado, horizontal, tamanho pequeno
<RadioGroup.Root
  value={entrega}
  onValueChange={setEntrega}
  orientation="horizontal"
  size="sm"
  aria-label="Tipo de entrega"
>
  <RadioGroup.Item value="padrao"><RadioGroup.Indicator /></RadioGroup.Item>
  <RadioGroup.Item value="expressa"><RadioGroup.Indicator /></RadioGroup.Item>
</RadioGroup.Root>

// Com uma opção indisponível — ela sai da navegação por setas
<RadioGroup.Root defaultValue="basico" aria-label="Plano">
  <RadioGroup.Item value="basico"><RadioGroup.Indicator /></RadioGroup.Item>
  <RadioGroup.Item value="pro"><RadioGroup.Indicator /></RadioGroup.Item>
  <RadioGroup.Item value="enterprise" disabled><RadioGroup.Indicator /></RadioGroup.Item>
</RadioGroup.Root>

// Estado inválido, dentro de um form nativo
<RadioGroup.Root name="plano" invalid aria-label="Plano">
  <RadioGroup.Item value="mensal"><RadioGroup.Indicator /></RadioGroup.Item>
  <RadioGroup.Item value="anual"><RadioGroup.Indicator /></RadioGroup.Item>
</RadioGroup.Root>
```

---

## 9. Acessibilidade

- `role="radiogroup"` no Root + `role="radio"` com `aria-checked` em cada item
- **Rótulo do grupo é obrigatório** — `aria-labelledby` apontando pro título da pergunta, ou `aria-label`. Sem isso, o leitor de tela anuncia as opções sem dizer do que elas são opção
- Roving tabindex: `Tab` entra e sai do grupo inteiro de uma vez, setas navegam dentro
- Setas selecionam ao navegar (comportamento esperado de radio no HTML nativo) e dão a volta no fim da lista
- `preventDefault()` nas setas impede a página de rolar junto
- Itens desabilitados são pulados pela navegação (a query já filtra `:not([disabled])`)
- `aria-invalid` no grupo, não em cada item — a validação é do conjunto

---

## 10. Teste (`specs/RadioGroup.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import * as RadioGroup from '../index'

function Setup(props: RadioGroup.RadioGroupRootProps = {}) {
  return (
    <RadioGroup.Root aria-label="Plano" {...props}>
      <RadioGroup.Item value="mensal" aria-label="Mensal">
        <RadioGroup.Indicator />
      </RadioGroup.Item>
      <RadioGroup.Item value="anual" aria-label="Anual">
        <RadioGroup.Indicator />
      </RadioGroup.Item>
      <RadioGroup.Item value="vitalicio" aria-label="Vitalício" disabled>
        <RadioGroup.Indicator />
      </RadioGroup.Item>
    </RadioGroup.Root>
  )
}

describe('RadioGroup', () => {
  it('seleciona ao clicar e desmarca o anterior', async () => {
    render(<Setup defaultValue="mensal" />)

    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: 'Anual' }))

    expect(screen.getByRole('radio', { name: 'Anual' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveAttribute('aria-checked', 'false')
  })

  it('só o item selecionado é alcançável por Tab (roving tabindex)', () => {
    render(<Setup defaultValue="anual" />)

    expect(screen.getByRole('radio', { name: 'Anual' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveAttribute('tabindex', '-1')
  })

  it('sem seleção, o primeiro item habilitado recebe o foco do Tab', () => {
    render(<Setup />)
    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveAttribute('tabindex', '0')
  })

  it('navega e seleciona com as setas', async () => {
    render(<Setup defaultValue="mensal" />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')

    const anual = screen.getByRole('radio', { name: 'Anual' })
    expect(anual).toHaveFocus()
    expect(anual).toHaveAttribute('aria-checked', 'true')
  })

  it('pula itens desabilitados e dá a volta no fim da lista', async () => {
    render(<Setup defaultValue="anual" />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}') // "vitalicio" está disabled → volta pro início

    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveFocus()
  })

  it('no modo controlado, só avisa via onValueChange', async () => {
    const onValueChange = vi.fn()
    render(<Setup value="mensal" onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Anual' }))

    expect(onValueChange).toHaveBeenCalledWith('anual')
    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveAttribute('aria-checked', 'true')
  })

  it('esconde o Indicator nos itens não selecionados', () => {
    const { container } = render(<Setup defaultValue="mensal" />)
    // só um indicador renderizado no grupo inteiro
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
  })

  it('propaga disabled do Root pros itens', async () => {
    const onValueChange = vi.fn()
    render(<Setup disabled onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Mensal' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('envia o valor no FormData quando tem name', () => {
    const { container } = render(
      <form>
        <Setup name="plano" defaultValue="anual" />
      </form>
    )
    const form = container.querySelector('form')!
    expect(new FormData(form).get('plano')).toBe('anual')
  })

  it('lança erro se uma parte for usada fora do Root', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<RadioGroup.Item value="x" />)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(<Setup defaultValue="mensal" />)
    expect(container).toMatchSnapshot()
  })
})
```
