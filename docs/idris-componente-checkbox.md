# Idris — Componente: Checkbox

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato dos demais `idris-componente-*.md`. Depende das peças de [`idris-primitivas-formulario.md`](./idris-primitivas-formulario.md) (`useControllableState`, `BubbleInput`) — implemente aquelas primeiro.

---

## 1. Root implícito

Rodando a sequência de decisão da seção 8 de `idris-estrutura-componentes.md`:

1. **Elemento DOM único, sem portal/posicionamento?** Sim — é um `<button>` só. O `BubbleInput` que vai junto não conta como "elemento coordenado": ele não é composto pelo consumidor, é detalhe interno que espelha o estado. → **root implícito**, como Button/Card/Badge.
2. **Quais partes variam de caso pra caso?** Só o conteúdo que aparece quando está marcado (ícone de check, traço do estado misto) → `Checkbox.Indicator`.
3. **A parte precisa saber de algo do pai?** Sim — precisa saber se está marcado (pra renderizar ou não) e o `size` (pra dimensionar o ícone). → precisa de `Checkbox.context.ts`.

## 2. Por que não é um `<input type="checkbox">`

O motivo completo está na seção 4.1 de `idris-primitivas-formulario.md`. Resumo: o input nativo não aceita filhos, então um `Checkbox.Indicator` com ícone customizado seria impossível — e é exatamente essa composição que faz o componente valer a pena. Renderizamos um `<button role="checkbox">` (totalmente estilizável, acessibilidade garantida pelo `role` + `aria-checked`) e um `BubbleInput` escondido pra que o valor entre no `FormData`.

## 3. Partes

| Parte | Elemento | Papel | Obrigatória? |
|---|---|---|---|
| `Checkbox` (root implícito) | `<button role="checkbox">` | Estado (`checked`/`indeterminate`/`disabled`/`invalid`), contexto, `BubbleInput` interno | Sim |
| `Checkbox.Indicator` | `<span>` | Conteúdo que só aparece quando marcado ou indeterminado | Não — mas na prática sempre usada |
| `Checkbox.Styles` | — | `tv()` cru, uso avançado fora da composição | Não |

Sem `Checkbox.Label`: o rótulo de um checkbox é um `<label>` externo que envolve ou aponta pro campo — não é uma parte interna dele. Compõe-se com `<Text as="label" size="label">` do Typography, reaproveitando o token `label` que Input e Button já usam.

## 4. O estado indeterminado

`checked` aceita três valores: `true`, `false` e `'indeterminate'`. O terceiro existe pro padrão "marcar todos" — um checkbox pai que representa uma lista onde só parte dos filhos está marcada.

**Por que é um valor de `checked` e não uma prop `indeterminate` separada:** no DOM nativo, `indeterminate` é uma property (só via JS, não é atributo) que convive com `checked` — dá pra ter um input `checked` **e** `indeterminate` ao mesmo tempo, o que não significa nada visualmente e é fonte de bug. Modelando como três estados mutuamente exclusivos, esse estado inválido deixa de ser representável. É a mesma escolha do Radix, e a razão é essa.

Ao clicar num checkbox indeterminado, ele vai pra `true` (nunca volta pra `'indeterminate'` sozinho — quem coloca nesse estado é sempre o consumidor).

## 5. Variantes, tamanhos e estados

- **Sem variantes de cor.** Checkbox é um controle funcional de formulário: sempre `brand-500` quando marcado. Uma variante `accent` violaria a regra de composição da seção 2.1 de `design-system-fundacao.md` (magenta-vinho é destaque pontual, não UI funcional do dia a dia).
- **Tamanhos:** `sm` (16px) / `md` (20px) / `lg` (24px) — a mesma escala de nomes de Button e Input, porque os três aparecem lado a lado no mesmo formulário. Um `Input size="lg"` com um checkbox travado em `md` desalinha visualmente.
- **Estados:** `default`, `hover`, `focus-visible` (ring `brand-400`), `checked`, `indeterminate`, `disabled` (opacidade 40%), `invalid` (borda `error`).

Todos expostos como `data-*`, quem reage é o `.styles.ts`:

| Atributo | Valores |
|---|---|
| `data-state` | `checked` · `unchecked` · `indeterminate` |
| `data-size` | `sm` · `md` · `lg` |
| `data-disabled` | presente ou ausente |
| `data-invalid` | presente ou ausente |

## 6. Tokens usados

`brand-500` (fundo quando marcado), `brand-400` (ring de foco), `surface` (fundo quando desmarcado), `border-thin` (borda), `error` (estado inválido), `text-primary` (cor do ícone sobre o fundo teal), `radius-sm` (6px — Checkbox é quadrado com canto suave, ao contrário do Radio), `duration-fast`.

---

## 7. Estrutura de pastas

```
src/components/Checkbox/
├── Checkbox.tsx            # root — estado, contexto, BubbleInput, forwardRef
├── Checkbox.context.ts     # contexto compartilhado (state, size)
├── Checkbox.styles.ts
├── Checkbox.stories.tsx
├── index.ts
├── parts/
│   └── Indicator.tsx       # exporta CheckboxIndicator (displayName "Checkbox.Indicator")
└── specs/
    ├── Checkbox.test.tsx
    └── __snapshots__/
```

---

## 8. Código

**`Checkbox.context.ts`**:

```ts
import { createContext, useContext } from 'react'

export type CheckedState = boolean | 'indeterminate'
export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxContextValue {
  checked: CheckedState
  size: CheckboxSize
}

export const CheckboxContext = createContext<CheckboxContextValue | null>(null)

export function useCheckboxContext(part: string) {
  const ctx = useContext(CheckboxContext)
  if (!ctx) {
    throw new Error(`<Checkbox.${part} /> precisa estar dentro de <Checkbox>`)
  }
  return ctx
}

/** Traduz o estado interno pro valor do `data-state`. */
export function toDataState(checked: CheckedState) {
  if (checked === 'indeterminate') return 'indeterminate'
  return checked ? 'checked' : 'unchecked'
}
```

**`Checkbox.styles.ts`** — repare que nenhuma classe depende de prop booleana: tudo reage aos `data-*`:

```ts
import { tv } from 'tailwind-variants'

export const checkbox = tv({
  base: [
    'inline-flex shrink-0 items-center justify-center',
    'rounded-sm border border-white/20 bg-surface',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
    'hover:border-white/40',
    'data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-500',
    'data-[state=indeterminate]:border-brand-500 data-[state=indeterminate]:bg-brand-500',
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
  base: 'inline-flex items-center justify-center text-text-primary',
})
```

**`Checkbox.tsx`** — o root:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { BubbleInput } from '../../primitives/BubbleInput'
import { checkbox } from './Checkbox.styles'
import {
  CheckboxContext,
  toDataState,
  type CheckedState,
  type CheckboxSize,
} from './Checkbox.context'

export interface CheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'type'> {
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  size?: CheckboxSize
  invalid?: boolean
  /** Nome do campo no FormData — só necessário dentro de um <form> nativo. */
  name?: string
  /** Valor enviado quando marcado. Default: "on", igual ao input nativo. */
  value?: string
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      size = 'md',
      invalid = false,
      disabled,
      name,
      value = 'on',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [checked, setChecked] = useControllableState<CheckedState>({
      value: checkedProp,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    })

    return (
      <CheckboxContext.Provider value={{ checked, size }}>
        <button
          ref={ref}
          type="button"
          role="checkbox"
          // 'mixed' é o valor ARIA pro estado indeterminado — não existe "aria-indeterminate"
          aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
          aria-invalid={invalid || undefined}
          data-state={toDataState(checked)}
          data-size={size}
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
          disabled={disabled}
          className={checkbox({ size, className })}
          onClick={(event) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            // Indeterminado sempre vira marcado — nunca volta sozinho pro estado misto
            setChecked((prev) => (prev === 'indeterminate' ? true : !prev))
          }}
          {...props}
        >
          {children}
        </button>

        {name ? (
          <BubbleInput
            type="checkbox"
            name={name}
            value={value}
            checked={checked === true}
            disabled={disabled}
          />
        ) : null}
      </CheckboxContext.Provider>
    )
  }
)

Checkbox.displayName = 'Checkbox'
```

> **Por que o `BubbleInput` só renderiza com `name`:** fora de um formulário nativo (o caso mais comum em React), ele seria DOM morto em toda tela. Renderizar condicionalmente mantém a árvore limpa e sinaliza a intenção — se tem `name`, é porque vai ser submetido.
>
> **Por que o `onClick` do consumidor roda antes e respeita `preventDefault`:** dá a quem usa a chance de cancelar a mudança (ex: pedir confirmação antes de desmarcar), sem precisar virar componente controlado só pra isso.

**`parts/Indicator.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { useCheckboxContext, type CheckboxSize } from '../Checkbox.context'
import { indicator } from '../Checkbox.styles'

const ICON_SIZE: Record<CheckboxSize, number> = { sm: 10, md: 12, lg: 14 }

export interface CheckboxIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** Conteúdo mostrado no estado indeterminado. Default: um traço. */
  indeterminate?: React.ReactNode
}

export const CheckboxIndicator = forwardRef<HTMLSpanElement, CheckboxIndicatorProps>(
  ({ className, children, indeterminate, ...props }, ref) => {
    const { checked, size } = useCheckboxContext('Indicator')

    if (checked === false) return null

    const fallbackDash = (
      <span
        style={{ width: ICON_SIZE[size], height: 2 }}
        className="rounded-full bg-current"
        aria-hidden
      />
    )

    return (
      <span ref={ref} aria-hidden className={indicator({ className })} {...props}>
        {checked === 'indeterminate' ? (indeterminate ?? fallbackDash) : children}
      </span>
    )
  }
)

CheckboxIndicator.displayName = 'Checkbox.Indicator'
```

> O indicador é `aria-hidden` de propósito: o estado já é anunciado pelo `aria-checked` do botão. Se o ícone também fosse lido, o leitor de tela anunciaria a mesma informação duas vezes.

**`index.ts`**:

```ts
import { Checkbox as Root } from './Checkbox'
import { CheckboxIndicator } from './parts/Indicator'
import { checkbox as checkboxStyles } from './Checkbox.styles'

export const Checkbox = Object.assign(Root, {
  Indicator: CheckboxIndicator,
  Styles: checkboxStyles,
})

export type { CheckboxProps } from './Checkbox'
export type { CheckedState, CheckboxSize } from './Checkbox.context'
```

---

## 9. Uso

```jsx
// Não-controlado, com label ao lado
<div className="flex items-center gap-2">
  <Checkbox id="termos" defaultChecked={false}>
    <Checkbox.Indicator><CheckIcon /></Checkbox.Indicator>
  </Checkbox>
  <Text as="label" size="label" htmlFor="termos">
    Li e aceito os termos
  </Text>
</div>

// Controlado
<Checkbox checked={aceito} onCheckedChange={(v) => setAceito(v === true)}>
  <Checkbox.Indicator><CheckIcon /></Checkbox.Indicator>
</Checkbox>

// "Marcar todos" com estado misto
<Checkbox
  checked={todosMarcados ? true : algumMarcado ? 'indeterminate' : false}
  onCheckedChange={(v) => marcarTodos(v === true)}
>
  <Checkbox.Indicator indeterminate={<MinusIcon />}>
    <CheckIcon />
  </Checkbox.Indicator>
</Checkbox>

// Dentro de um <form> nativo — o `name` liga o BubbleInput
<form onSubmit={handleSubmit}>
  <Checkbox name="newsletter" value="sim" size="sm">
    <Checkbox.Indicator><CheckIcon /></Checkbox.Indicator>
  </Checkbox>
</form>

// Inválido e desabilitado
<Checkbox invalid>
  <Checkbox.Indicator><CheckIcon /></Checkbox.Indicator>
</Checkbox>

<Checkbox disabled defaultChecked>
  <Checkbox.Indicator><CheckIcon /></Checkbox.Indicator>
</Checkbox>
```

---

## 10. Acessibilidade

- `role="checkbox"` + `aria-checked` (`true` / `false` / `'mixed'`) — o `'mixed'` é o que faz o leitor de tela anunciar "parcialmente marcado"
- Teclado: `Space` ativa (comportamento nativo do `<button>`, sem código extra); `Tab` navega
- `type="button"` explícito — sem isso, dentro de um `<form>` o botão submeteria o formulário a cada clique
- Rótulo obrigatório: ou um `<label htmlFor>` apontando pro `id`, ou `aria-label` quando não houver texto visível
- O indicador é `aria-hidden` pra não duplicar a informação já dada pelo `aria-checked`

---

## 11. Teste (`specs/Checkbox.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from '../index'

describe('Checkbox', () => {
  it('alterna ao clicar, no modo não-controlado', async () => {
    render(
      <Checkbox aria-label="Aceitar">
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    const box = screen.getByRole('checkbox', { name: 'Aceitar' })

    expect(box).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(box)
    expect(box).toHaveAttribute('aria-checked', 'true')
  })

  it('não muda sozinho no modo controlado', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Checkbox aria-label="Aceitar" checked={false} onCheckedChange={onCheckedChange}>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    const box = screen.getByRole('checkbox')

    await userEvent.click(box)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(box).toHaveAttribute('aria-checked', 'false')
  })

  it('expõe o estado indeterminado como aria-checked="mixed"', () => {
    render(
      <Checkbox aria-label="Todos" checked="indeterminate">
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed')
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'indeterminate')
  })

  it('indeterminado vira marcado ao clicar', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Checkbox aria-label="Todos" defaultChecked="indeterminate" onCheckedChange={onCheckedChange}>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('esconde o Indicator quando desmarcado', () => {
    render(
      <Checkbox aria-label="Aceitar">
        <Checkbox.Indicator>marcado</Checkbox.Indicator>
      </Checkbox>
    )
    expect(screen.queryByText('marcado')).not.toBeInTheDocument()
  })

  it('ativa com a tecla Space', async () => {
    render(
      <Checkbox aria-label="Aceitar">
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    await userEvent.tab()
    await userEvent.keyboard(' ')
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')
  })

  it('envia o valor no FormData quando tem name', () => {
    const { container } = render(
      <form>
        <Checkbox aria-label="Newsletter" name="newsletter" value="sim" defaultChecked>
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox>
      </form>
    )
    const form = container.querySelector('form')!
    expect(new FormData(form).get('newsletter')).toBe('sim')
  })

  it('não dispara quando disabled', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Checkbox aria-label="Aceitar" disabled onCheckedChange={onCheckedChange}>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('lança erro se o Indicator for usado fora do Checkbox', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Checkbox.Indicator>Solto</Checkbox.Indicator>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Checkbox aria-label="Aceitar" defaultChecked size="md">
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
    )
    expect(container).toMatchSnapshot()
  })
})
```
