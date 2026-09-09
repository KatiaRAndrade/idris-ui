# Idris — Componente: Switch

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato dos demais `idris-componente-*.md`. Compartilha as primitivas de [`idris-primitivas-formulario.md`](./idris-primitivas-formulario.md) e o mesmo esqueleto de [`idris-componente-checkbox.md`](./idris-componente-checkbox.md).

---

## 1. Root implícito

Mesma sequência de decisão do Checkbox, mesmo resultado: elemento DOM único (`<button role="switch">`), sem portal nem posicionamento → **root implícito**. Uma parte (`Switch.Thumb`), que precisa saber do estado e do `size` → precisa de contexto.

## 2. Switch vs. Checkbox — por que são dois componentes

Tecnicamente são quase idênticos (botão binário com `role` ARIA e input escondido). A tentação seria fazer um `<Checkbox appearance="switch">`. Não fazemos, por dois motivos:

1. **Semântica diferente pra quem usa leitor de tela.** `role="checkbox"` é anunciado como "caixa de seleção, marcada"; `role="switch"` é anunciado como "interruptor, ligado". Não é sinônimo: checkbox significa "esse item faz parte da seleção" e switch significa "essa configuração está ativa agora".
2. **Momento de aplicação diferente.** Checkbox costuma ser aplicado no submit do formulário; switch costuma ter efeito imediato. Uma prop de aparência esconderia essa diferença de comportamento esperado atrás de uma escolha visual.

Além disso, o Switch **não tem estado indeterminado** — um interruptor "parcialmente ligado" não significa nada. Isso simplifica o tipo: `boolean`, não `CheckedState`.

## 3. Partes

| Parte | Elemento | Papel | Obrigatória? |
|---|---|---|---|
| `Switch` (root implícito) | `<button role="switch">` | Trilho, estado (`checked`/`disabled`), contexto, `BubbleInput` interno | Sim |
| `Switch.Thumb` | `<span>` | A bolinha que desliza — posicionada por `data-state`, não por style inline | Sim, na prática |
| `Switch.Styles` | — | `tv()` cru, uso avançado | Não |

Sem `Switch.Label`, pelo mesmo motivo do Checkbox: o rótulo é externo, composto com `<Text as="label">`.

## 4. Tamanhos e estados

- **Sem variantes de cor** — `brand-500` quando ligado, pelo mesmo argumento do Checkbox (UI funcional não usa `accent`).
- **Tamanhos:** `sm` (trilho 32×18) / `md` (40×22) / `lg` (48×26). A bolinha é sempre 4px menor que a altura do trilho, deixando 2px de respiro de cada lado.
- **Estados:** `default`, `hover`, `focus-visible` (ring `brand-400`), `checked`, `disabled`.

| Atributo | Valores |
|---|---|
| `data-state` | `checked` · `unchecked` |
| `data-size` | `sm` · `md` · `lg` |
| `data-disabled` | presente ou ausente |

## 5. Como o Thumb desliza (sem JS de animação)

O trilho é `relative`, o thumb é `absolute` com `left` fixo, e a posição ligada é um `translate-x` que reage ao `data-state` do **pai** — via seletor `group-data-[state=checked]:`. Ou seja: a animação inteira é CSS, e o componente `.tsx` não sabe que existe animação nenhuma. É a aplicação mais literal do princípio 2 da arquitetura (estado via `data-*`, aparência reagindo a ele).

Por isso o root carrega a classe `group`: é o que permite o thumb ler o estado do pai sem precisar do contexto pra estilo. O contexto continua existindo, mas só pro `size` e pra validação de uso fora do root.

## 6. Tokens usados

`brand-500` (trilho ligado), `brand-400` (ring de foco), `surface-elevated` (trilho desligado), `text-primary` (bolinha), `border-thin`, `radius-full` (trilho e bolinha são pills), `duration-fast` (150ms — a distância percorrida é curta, `base` ficaria arrastado).

---

## 7. Estrutura de pastas

```
src/components/Switch/
├── Switch.tsx            # root — estado, contexto, BubbleInput, forwardRef
├── Switch.context.ts     # contexto compartilhado (checked, size)
├── Switch.styles.ts
├── Switch.stories.tsx
├── index.ts
├── parts/
│   └── Thumb.tsx         # exporta SwitchThumb (displayName "Switch.Thumb")
└── specs/
    ├── Switch.test.tsx
    └── __snapshots__/
```

---

## 8. Código

**`Switch.context.ts`**:

```ts
import { createContext, useContext } from 'react'

export type SwitchSize = 'sm' | 'md' | 'lg'

export interface SwitchContextValue {
  checked: boolean
  size: SwitchSize
}

export const SwitchContext = createContext<SwitchContextValue | null>(null)

export function useSwitchContext(part: string) {
  const ctx = useContext(SwitchContext)
  if (!ctx) {
    throw new Error(`<Switch.${part} /> precisa estar dentro de <Switch>`)
  }
  return ctx
}
```

**`Switch.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const root = tv({
  base: [
    'group relative inline-flex shrink-0 items-center',
    'rounded-full border border-white/20 bg-surface-elevated',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
    'data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-500',
    'data-[disabled]:opacity-40 data-[disabled]:pointer-events-none',
  ],
  variants: {
    size: {
      sm: 'h-[18px] w-8',
      md: 'h-[22px] w-10',
      lg: 'h-[26px] w-12',
    },
  },
  defaultVariants: { size: 'md' },
})

export const thumb = tv({
  base: [
    'pointer-events-none absolute left-[2px] rounded-full bg-text-primary',
    'transition-transform duration-fast',
  ],
  variants: {
    size: {
      // translate = largura do trilho − tamanho do thumb − (2px × 2 de respiro)
      sm: 'h-3.5 w-3.5 group-data-[state=checked]:translate-x-[14px]',
      md: 'h-[18px] w-[18px] group-data-[state=checked]:translate-x-[18px]',
      lg: 'h-[22px] w-[22px] group-data-[state=checked]:translate-x-[22px]',
    },
  },
  defaultVariants: { size: 'md' },
})
```

**`Switch.tsx`** — o root:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { BubbleInput } from '../../primitives/BubbleInput'
import { root } from './Switch.styles'
import { SwitchContext, type SwitchSize } from './Switch.context'

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'type'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: SwitchSize
  /** Nome do campo no FormData — só necessário dentro de um <form> nativo. */
  name?: string
  /** Valor enviado quando ligado. Default: "on". */
  value?: string
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      size = 'md',
      disabled,
      name,
      value = 'on',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [checked, setChecked] = useControllableState<boolean>({
      value: checkedProp,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    })

    return (
      <SwitchContext.Provider value={{ checked, size }}>
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          data-state={checked ? 'checked' : 'unchecked'}
          data-size={size}
          data-disabled={disabled || undefined}
          disabled={disabled}
          className={root({ size, className })}
          onClick={(event) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            setChecked((prev) => !prev)
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
            checked={checked}
            disabled={disabled}
          />
        ) : null}
      </SwitchContext.Provider>
    )
  }
)

Switch.displayName = 'Switch'
```

> O `BubbleInput` é `type="checkbox"` mesmo aqui: no HTML nativo não existe `<input type="switch">`. Switch é um conceito de ARIA e de interface, não de formulário — no `FormData` ele é um checkbox como qualquer outro.

**`parts/Thumb.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { useSwitchContext } from '../Switch.context'
import { thumb } from '../Switch.styles'

export const SwitchThumb = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    const { size } = useSwitchContext('Thumb')
    // A posição vem do `data-state` do root via `group-data-[state=checked]:`
    // — o Thumb não precisa saber se está ligado, só qual o tamanho.
    return <span ref={ref} aria-hidden className={thumb({ size, className })} {...props} />
  }
)

SwitchThumb.displayName = 'Switch.Thumb'
```

**`index.ts`**:

```ts
import { Switch as Root } from './Switch'
import { SwitchThumb } from './parts/Thumb'
import { root as switchStyles } from './Switch.styles'

export const Switch = Object.assign(Root, {
  Thumb: SwitchThumb,
  Styles: switchStyles,
})

export type { SwitchProps } from './Switch'
export type { SwitchSize } from './Switch.context'
```

---

## 9. Uso

```jsx
// Configuração com rótulo — caso mais comum
<div className="flex items-center justify-between">
  <Text as="label" size="label" htmlFor="notif">
    Notificações por e-mail
  </Text>
  <Switch id="notif" defaultChecked>
    <Switch.Thumb />
  </Switch>
</div>

// Controlado, com efeito imediato
<Switch checked={temaEscuro} onCheckedChange={setTemaEscuro} aria-label="Tema escuro">
  <Switch.Thumb />
</Switch>

// Pedindo confirmação antes de desligar (cancela via preventDefault)
<Switch
  defaultChecked
  aria-label="Autenticação em dois fatores"
  onClick={(e) => {
    if (!confirm('Desativar mesmo?')) e.preventDefault()
  }}
>
  <Switch.Thumb />
</Switch>

// Dentro de um form nativo
<Switch name="marketing" value="sim" size="sm" aria-label="Receber novidades">
  <Switch.Thumb />
</Switch>

// Desabilitado
<Switch disabled defaultChecked aria-label="Plano Pro">
  <Switch.Thumb />
</Switch>
```

---

## 10. Acessibilidade

- `role="switch"` + `aria-checked` — anunciado como "ligado/desligado", não "marcado/desmarcado"
- `Space` e `Enter` ativam (comportamento nativo do `<button>`)
- Rótulo obrigatório: `<label htmlFor>` ou `aria-label`. Switch quase nunca tem texto interno, então o `aria-label` é o caso mais comum
- O `Thumb` é `aria-hidden` — é decoração, o estado já está no `aria-checked`
- Contraste: o trilho desligado usa `surface-elevated` + borda de 10% branco. Em dark mode isso passa AA contra o `background`, mas **vale checar no addon de a11y do Storybook** — é justamente o tipo de caso que a seção 5 de `design-system-fundacao.md` marca como risco

---

## 11. Teste (`specs/Switch.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from '../index'

describe('Switch', () => {
  it('alterna ao clicar, no modo não-controlado', async () => {
    render(
      <Switch aria-label="Notificações">
        <Switch.Thumb />
      </Switch>
    )
    const sw = screen.getByRole('switch', { name: 'Notificações' })

    expect(sw).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(sw).toHaveAttribute('data-state', 'checked')
  })

  it('no modo controlado, só avisa via onCheckedChange', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch aria-label="Tema" checked={false} onCheckedChange={onCheckedChange}>
        <Switch.Thumb />
      </Switch>
    )
    await userEvent.click(screen.getByRole('switch'))

    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('permite cancelar a mudança com preventDefault', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        aria-label="2FA"
        onCheckedChange={onCheckedChange}
        onClick={(e) => e.preventDefault()}
      >
        <Switch.Thumb />
      </Switch>
    )
    await userEvent.click(screen.getByRole('switch'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('ativa pelo teclado', async () => {
    render(
      <Switch aria-label="Notificações">
        <Switch.Thumb />
      </Switch>
    )
    await userEvent.tab()
    await userEvent.keyboard(' ')
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('envia o valor no FormData quando tem name', () => {
    const { container } = render(
      <form>
        <Switch aria-label="Marketing" name="marketing" value="sim" defaultChecked>
          <Switch.Thumb />
        </Switch>
      </form>
    )
    const form = container.querySelector('form')!
    expect(new FormData(form).get('marketing')).toBe('sim')
  })

  it('não alterna quando disabled', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch aria-label="Plano" disabled onCheckedChange={onCheckedChange}>
        <Switch.Thumb />
      </Switch>
    )
    await userEvent.click(screen.getByRole('switch'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('lança erro se o Thumb for usado fora do Switch', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Switch.Thumb />)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Switch aria-label="Notificações" defaultChecked size="md">
        <Switch.Thumb />
      </Switch>
    )
    expect(container).toMatchSnapshot()
  })
})
```
