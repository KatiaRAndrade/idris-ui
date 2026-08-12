# Idris — Componente: Input

> Segue as duas specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md) (separação de arquivo, `Slot` caseiro, `data-*`) e [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) (padrão de partes nomeadas).

---

## 1. Por que o Input tem `.Root` explícito

Diferente do Button, o Input **não é um elemento DOM único** — é um `<label>`, um `<input>`, e opcionalmente um `<p>` de erro ou dica, todos precisando estar associados (`htmlFor`/`id`, `aria-describedby`, `aria-invalid`). Pela regra da seção 2 de `idris-estrutura-componentes.md`, isso exige um `.Root` explícito: ele não renderiza o campo em si, só coordena estado e gera os ids compartilhados via contexto.

## 2. Partes

| Parte | Elemento | Papel |
|---|---|---|
| `Input.Root` | `<div>` | Gera o `id` compartilhado (`useId`), guarda `size`/`disabled`/`invalid`, coordena quais elementos entram no `aria-describedby` do campo |
| `Input.Label` | `<label>` | Associado ao campo via `htmlFor` |
| `Input.Field` | `<input>` (ou outro via `asChild`, ex: um input mascarado) | O campo em si — herda `size`/`disabled`/`invalid` do contexto |
| `Input.Hint` | `<p>` | Texto de ajuda — só aparece quando **não** há erro |
| `Input.Error` | `<p role="alert">` | Mensagem de erro — só aparece quando `Root` está `invalid` |

`Hint` e `Error` se registram no `aria-describedby` do `Field` automaticamente ao montar (via `useEffect` + callback do contexto) — o `Field` não precisa saber de antemão quais partes vão existir.

## 3. Estados e tamanhos

- **Tamanhos:** `sm` / `md` / `lg` — mesma escala de padding/tipografia do Button, pra manter os dois alinhados numa mesma linha de formulário.
- **Estados:** `default`, `focus` (ring `brand-400`), `invalid` (borda + ring `error`, esconde o `Hint`, mostra o `Error`), `disabled` (propaga do `Root` pro `Field`, opacidade 40%).

## 4. Tokens usados

`surface` (fundo do campo), `border-thin`, `text-primary`/`text-secondary`, `error`, `brand-400` (ring de foco), `radius-md`, escala de espaçamento (`space-2` a `space-5` nos paddings), `type/label` (rótulo), `type/body-sm` (hint/erro).

---

## 5. Estrutura de pastas

```
src/components/Input/
├── Input.context.ts     # id, size, disabled, invalid, registro de describedby
├── Input.Root.tsx
├── Input.styles.ts
├── Input.stories.tsx
├── index.ts              # monta o namespace final: Input.Root/.Label/.Field/.Hint/.Error
├── parts/                # partes compostas — Label, Field, Hint, Error
│   ├── Label.tsx
│   ├── Field.tsx
│   ├── Hint.tsx
│   └── Error.tsx
└── specs/
    ├── Input.test.tsx
    └── __snapshots__/
```

> Segue a **regra do `parts/`** de `ds-architecture.md`: o caminho já carrega o nome do componente (`Input/parts/Field.tsx`), então o arquivo não repete o prefixo — só o componente exportado e o `displayName` usam o nome completo (`InputField`, `'Input.Field'`). `Input.Root` fica fora de `parts/` porque é a peça que abre a composição (ver seção 1), não uma parte opcional.

---

## 6. Código

**`Input.context.ts`**:

```ts
import { createContext, useContext } from 'react'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputContextValue {
  id: string
  size: InputSize
  disabled: boolean
  invalid: boolean
  describedByIds: string[]
  registerDescribedBy: (id: string) => () => void
}

export const InputContext = createContext<InputContextValue | null>(null)

export function useInputContext(part: string) {
  const ctx = useContext(InputContext)
  if (!ctx) {
    throw new Error(`<Input.${part} /> precisa estar dentro de <Input.Root>`)
  }
  return ctx
}
```

**`Input.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const root = tv({
  base: 'flex flex-col gap-1.5',
})

export const label = tv({
  base: 'font-sans text-sm font-medium text-text-primary',
})

export const field = tv({
  base: [
    'w-full rounded-md border border-white/10 bg-surface text-text-primary font-sans',
    'placeholder:text-text-secondary transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
    'disabled:opacity-40 disabled:pointer-events-none',
  ],
  variants: {
    size: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    },
    invalid: {
      true: 'border-error focus-visible:ring-error',
    },
  },
  defaultVariants: { size: 'md' },
})

export const hint = tv({
  base: 'text-sm text-text-secondary',
})

export const error = tv({
  base: 'text-sm text-error',
})
```

**`Input.Root.tsx`**:

```tsx
import { forwardRef, useCallback, useId, useMemo, useState, type HTMLAttributes } from 'react'
import { InputContext, type InputSize } from './Input.context'
import { root } from './Input.styles'

export interface InputRootProps extends HTMLAttributes<HTMLDivElement> {
  size?: InputSize
  disabled?: boolean
  invalid?: boolean
}

export const InputRoot = forwardRef<HTMLDivElement, InputRootProps>(
  ({ className, size = 'md', disabled = false, invalid = false, children, ...props }, ref) => {
    const id = useId()
    const [describedByIds, setDescribedByIds] = useState<string[]>([])

    const registerDescribedBy = useCallback((descId: string) => {
      setDescribedByIds((prev) => (prev.includes(descId) ? prev : [...prev, descId]))
      return () => setDescribedByIds((prev) => prev.filter((i) => i !== descId))
    }, [])

    const value = useMemo(
      () => ({ id, size, disabled, invalid, describedByIds, registerDescribedBy }),
      [id, size, disabled, invalid, describedByIds, registerDescribedBy]
    )

    return (
      <InputContext.Provider value={value}>
        <div
          ref={ref}
          data-size={size}
          data-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          className={root({ className })}
          {...props}
        >
          {children}
        </div>
      </InputContext.Provider>
    )
  }
)

InputRoot.displayName = 'Input.Root'
```

**`parts/Label.tsx`**:

```tsx
import type { LabelHTMLAttributes } from 'react'
import { useInputContext } from '../Input.context'
import { label as labelStyles } from '../Input.styles'

export function InputLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  const { id } = useInputContext('Label')
  return <label htmlFor={id} className={labelStyles({ className })} {...props} />
}

InputLabel.displayName = 'Input.Label'
```

**`parts/Field.tsx`** — suporta `asChild` pra casos como um input mascarado de terceiros. `Slot` exige `children: ReactElement`, o que não bate com `InputHTMLAttributes` genérico — por isso os dois caminhos (`asChild` vs `input` nativo) são ramificados em vez de resolvidos por um `Comp` polimórfico único:

```tsx
import { forwardRef, type InputHTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useInputContext } from '../Input.context'
import { field } from '../Input.styles'

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, asChild, disabled, ...props }, ref) => {
    const { id, size, disabled: rootDisabled, invalid, describedByIds } = useInputContext('Field')
    const sharedProps = {
      id,
      'data-size': size,
      'data-invalid': invalid || undefined,
      disabled: disabled ?? rootDisabled,
      'aria-invalid': invalid || undefined,
      'aria-describedby': describedByIds.length ? describedByIds.join(' ') : undefined,
      className: field({ size, invalid, className }),
    }

    if (asChild) {
      const { children, ...rest } = props
      return (
        <Slot ref={ref} {...sharedProps} {...rest}>
          {children as ReactElement<Record<string, unknown>>}
        </Slot>
      )
    }

    return <input ref={ref} {...sharedProps} {...props} />
  }
)

InputField.displayName = 'Input.Field'
```

**`parts/Hint.tsx`** — só renderiza quando não há erro, e se registra no `describedby` do campo:

```tsx
import { useEffect, useId, type HTMLAttributes } from 'react'
import { useInputContext } from '../Input.context'
import { hint } from '../Input.styles'

export function InputHint({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { invalid, registerDescribedBy } = useInputContext('Hint')
  const hintId = useId()

  useEffect(() => {
    if (invalid) return
    return registerDescribedBy(hintId)
  }, [invalid, hintId, registerDescribedBy])

  if (invalid) return null

  return <p id={hintId} className={hint({ className })} {...props} />
}

InputHint.displayName = 'Input.Hint'
```

**`parts/Error.tsx`** — o inverso: só renderiza quando o `Root` está `invalid`:

```tsx
import { useEffect, useId, type HTMLAttributes } from 'react'
import { useInputContext } from '../Input.context'
import { error as errorStyles } from '../Input.styles'

export function InputError({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { invalid, registerDescribedBy } = useInputContext('Error')
  const errorId = useId()

  useEffect(() => {
    if (!invalid) return
    return registerDescribedBy(errorId)
  }, [invalid, errorId, registerDescribedBy])

  if (!invalid) return null

  return <p id={errorId} role="alert" className={errorStyles({ className })} {...props} />
}

InputError.displayName = 'Input.Error'
```

**`index.ts`** — aqui é um objeto simples, não `Object.assign` num componente: o Input não tem um elemento único pra "ser" a raiz, então `Root` já é a parte que a pessoa usa pra abrir a composição:

```ts
export { InputRoot as Root } from './Input.Root'
export { InputLabel as Label } from './parts/Label'
export { InputField as Field } from './parts/Field'
export { InputHint as Hint } from './parts/Hint'
export { InputError as Error } from './parts/Error'

export type { InputRootProps } from './Input.Root'
export type { InputFieldProps } from './parts/Field'
```

Consumido como `import * as Input from './Input'`, ou reexportado no barrel principal como `export * as Input from './Input'`.

---

## 7. Uso

```jsx
// Caso simples, com dica
<Input.Root>
  <Input.Label>E-mail</Input.Label>
  <Input.Field type="email" placeholder="voce@exemplo.com" />
  <Input.Hint>Usamos isso só pra recuperação de conta.</Input.Hint>
</Input.Root>

// Com erro — o Hint desaparece automaticamente, o Error assume o describedby
<Input.Root invalid size="sm">
  <Input.Label>Senha</Input.Label>
  <Input.Field type="password" />
  <Input.Error>A senha precisa ter no mínimo 8 caracteres.</Input.Error>
</Input.Root>

// Desabilitado
<Input.Root disabled>
  <Input.Label>Cupom</Input.Label>
  <Input.Field value="EXPIRADO10" readOnly />
</Input.Root>
```

---

## 8. Teste (`specs/Input.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as Input from '../index'

describe('Input', () => {
  it('associa label e campo pelo mesmo id', () => {
    render(
      <Input.Root>
        <Input.Label>E-mail</Input.Label>
        <Input.Field />
      </Input.Root>
    )
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it('associa o Hint via aria-describedby', () => {
    render(
      <Input.Root>
        <Input.Label>E-mail</Input.Label>
        <Input.Field />
        <Input.Hint>Texto de ajuda</Input.Hint>
      </Input.Root>
    )
    const field = screen.getByLabelText('E-mail')
    const hint = screen.getByText('Texto de ajuda')
    expect(field).toHaveAttribute('aria-describedby', hint.id)
  })

  it('esconde o Hint e mostra o Error quando invalid', () => {
    render(
      <Input.Root invalid>
        <Input.Label>Senha</Input.Label>
        <Input.Field />
        <Input.Hint>Não deveria aparecer</Input.Hint>
        <Input.Error>Senha inválida</Input.Error>
      </Input.Root>
    )
    expect(screen.queryByText('Não deveria aparecer')).not.toBeInTheDocument()
    expect(screen.getByText('Senha inválida')).toHaveAttribute('role', 'alert')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('aria-invalid', 'true')
  })

  it('propaga disabled do Root pro Field', () => {
    render(
      <Input.Root disabled>
        <Input.Label>Cupom</Input.Label>
        <Input.Field />
      </Input.Root>
    )
    expect(screen.getByLabelText('Cupom')).toBeDisabled()
  })

  it('lança erro se uma parte for usada fora do Root', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Input.Field />)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Input.Root>
        <Input.Label>E-mail</Input.Label>
        <Input.Field placeholder="voce@exemplo.com" />
        <Input.Hint>Usamos isso só pra recuperação de conta.</Input.Hint>
      </Input.Root>
    )
    expect(container).toMatchSnapshot()
  })
})
```
