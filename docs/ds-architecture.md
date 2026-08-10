# Idris — Estrutura de Componentes (Compound Pattern)

> Documenta especificamente o **padrão de composição** que todo componente do Idris vai seguir — a API em partes nomeadas (`Componente.Parte`), como o Radix expõe (`Popover.Root`, `Popover.Trigger`, `Popover.Content`...). Não usamos o pacote do Radix, só a forma como a API é desenhada.
>
> Esse documento cobre **o que compõe um componente** (as partes, como elas se conectam, e como ficam organizadas em pastas). Separação de arquivo/estilo e `data-*` attributes seguem os mesmos princípios descritos aqui. O Button não usa `asChild`/`Slot` — quando um componente futuro precisar (portais, posicionamento), o `Slot` caseiro vive em `src/primitives/Slot.tsx`.

---

## 1. O padrão

Em vez de um componente monolítico que recebe uma prop pra cada variação possível de conteúdo, cada componente do Idris é um **namespace de partes**, e quem monta a composição é o consumidor:

```jsx
// Não é assim:
<Button icon={<PlusIcon />} label="Salvar" iconPosition="left" />

// É assim:
<Button variant="primary" size="md">
  <Button.Content>
    <Button.Icon><PlusIcon /></Button.Icon>
    <Button.Label>Salvar</Button.Label>
  </Button.Content>
</Button>
```

**Por quê:** a versão com props (`icon`, `label`, `iconPosition`...) cresce sem parar conforme o componente ganha casos de uso novos. A versão composta escala de graça — quer um botão só com ícone? Só não renderiza o `Button.Label`. Quer inverter a ordem? Troca a ordem no JSX. Nenhuma prop nova precisa ser inventada no componente base.

## 2. Root explícito vs. implícito

Olhando o exemplo do Popover que você trouxe:

```jsx
<Popover.Root>
  <Popover.Trigger />
  <Popover.Anchor />
  <Popover.Portal>
    <Popover.Content>
      <Popover.Close />
      <Popover.Arrow />
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

O `Popover.Root` existe porque o Popover não é um elemento DOM único — ele coordena estado (aberto/fechado) entre partes que nem ficam próximas na árvore (o `Trigger` fica onde foi clicado, o `Content` é teleportado pra um `Portal`). Precisa de um nó que não renderiza nada visualmente, só guarda o estado e o contexto.

**Regra pro Idris:**

| Tipo de componente | Tem `.Root` explícito? | Exemplos |
|---|---|---|
| Elemento único, sem portal/posicionamento | **Não** — o próprio export já é o root | Button, Badge, Card |
| Múltiplos elementos DOM desconectados, ou precisa de portal/posicionamento | **Sim** — precisa de `.Root` coordenando | Select, Dialog, Tooltip, Popover (quando chegarem na Onda 2/3) |

O Button se encaixa no primeiro grupo — `<Button>` já é o root implícito. É por isso que a API é `Button.Label`, `Button.Icon`, `Button.Content` sem um `Button.Root` separado.

## 3. Partes do Button

| Parte | Papel | Obrigatória? |
|---|---|---|
| `Button` (root implícito) | Elemento `<button>` real, estado (`variant`, `size`, `loading`, `disabled`), fornece contexto pras partes filhas | Sim |
| `Button.Content` | Wrapper de layout — organiza `Icon` + `Label` (flex, gap) | Não — só necessária quando há mais de uma parte filha |
| `Button.Icon` | Renderiza o ícone, dimensionado automaticamente conforme o `size` do Button (via contexto) | Não — só em botões com ícone |
| `Button.Label` | Renderiza o texto do botão | Não — só em botões com texto |
| `Button.Styles` | Exporta o `tv()` cru, pra aplicar a aparência do Button em outro elemento sem usar o componente (ex: um link estilizado igual ao Button fora do fluxo de composição) | Não — uso avançado |

## 4. Estrutura de pastas

```
src/components/Button/
├── Button.tsx              # root — comportamento, estado, contexto, forwardRef
├── Button.context.ts       # contexto compartilhado (variant/size) entre as partes
├── Button.styles.ts        # tv() — estilo, também exposto como Button.Styles
├── Button.stories.tsx
├── index.ts                 # monta o namespace final: Button.Content/.Icon/.Label/.Styles
├── parts/                   # partes compostas — só existe quando o componente tem >1 parte
│   ├── Content.tsx          # parte — layout
│   ├── Icon.tsx              # parte — ícone
│   └── Label.tsx              # parte — texto
└── specs/
    ├── Button.test.tsx      # cobre o root + todas as partes juntas
    └── __snapshots__/
```

> **Regra do `parts/`:** o caminho já carrega o nome do componente (`Button/parts/Icon.tsx`), então o arquivo não repete o prefixo — só o componente exportado e o `displayName` usam o nome completo (`ButtonIcon`, `'Button.Icon'`). Componentes de elemento único sem partes (ex: um Badge simples) não precisam dessa pasta.
>
> Se algum componente futuro crescer o suficiente pra justificar (parte com lógica própria complexa), dá pra dividir `specs/Button.test.tsx` em `specs/Icon.test.tsx`, `specs/Label.test.tsx` etc. Pro Button, um arquivo só já cobre bem.

---

## 5. Código completo

**`Button.context.ts`** — contexto interno, não exportado pro consumidor final:

```ts
import { createContext, useContext } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'metallic' | 'metallic-gold'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonContextValue {
  variant: ButtonVariant
  size: ButtonSize
}

export const ButtonContext = createContext<ButtonContextValue | null>(null)

export function useButtonContext(part: string) {
  const ctx = useContext(ButtonContext)
  if (!ctx) {
    throw new Error(`<Button.${part} /> precisa estar dentro de <Button>`)
  }
  return ctx
}
```

**`Button.tsx`** — o root:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { button } from './Button.styles'
import { ButtonContext, type ButtonVariant, type ButtonSize } from './Button.context'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    return (
      <ButtonContext.Provider value={{ variant, size }}>
        <button
          ref={ref}
          data-variant={variant}
          data-size={size}
          data-loading={loading || undefined}
          disabled={disabled || loading}
          aria-busy={loading || undefined}
          className={button({ variant, size, className })}
          {...props}
        >
          {loading ? (
            <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </span>
          ) : null}
          {children}
        </button>
      </ButtonContext.Provider>
    )
  }
)

Button.displayName = 'Button'
```

> O Button não usa `asChild`: quando fizer sentido aplicar a aparência do Button a outro elemento (ex: um link), use `Button.Styles` (seção 6) em vez de emprestar o comportamento via `Slot`. `asChild`/`Slot` ficam reservados pra componentes que realmente precisam (Select, Dialog — Onda 2/3).

**`parts/Content.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { useButtonContext } from '../Button.context'

export const ButtonContent = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => {
    useButtonContext('Content') // garante que só é usado dentro de <Button>
    return (
      <span ref={ref} className={`inline-flex items-center gap-2 ${className ?? ''}`} {...props}>
        {children}
      </span>
    )
  }
)

ButtonContent.displayName = 'Button.Content'
```

**`parts/Icon.tsx`** — dimensiona o ícone conforme o `size` herdado do contexto:

```tsx
import { cloneElement, isValidElement, type ReactElement } from 'react'
import { useButtonContext, type ButtonSize } from '../Button.context'

const ICON_SIZE: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 }

export interface ButtonIconProps {
  children: ReactElement<{ width?: number; height?: number; 'aria-hidden'?: boolean }>
}

export function ButtonIcon({ children }: ButtonIconProps) {
  const { size } = useButtonContext('Icon')
  if (!isValidElement(children)) return null

  return cloneElement(children, {
    width: ICON_SIZE[size],
    height: ICON_SIZE[size],
    'aria-hidden': true,
  })
}

ButtonIcon.displayName = 'Button.Icon'
```

**`parts/Label.tsx`**:

```tsx
import type { HTMLAttributes } from 'react'
import { useButtonContext } from '../Button.context'

export function ButtonLabel({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  useButtonContext('Label')
  return <span className={className} {...props} />
}

ButtonLabel.displayName = 'Button.Label'
```

**`index.ts`** — monta o namespace final, do mesmo jeito que o Radix monta `Popover = { Root, Trigger, Content, ... }`:

```ts
import { Button as Root } from './Button'
import { ButtonContent } from './parts/Content'
import { ButtonIcon } from './parts/Icon'
import { ButtonLabel } from './parts/Label'
import { button as buttonStyles } from './Button.styles'

export const Button = Object.assign(Root, {
  Content: ButtonContent,
  Icon: ButtonIcon,
  Label: ButtonLabel,
  Styles: buttonStyles,
})

export type { ButtonProps } from './Button'
```

`Object.assign` funciona aqui porque `Root` já é uma função (o componente) — a gente só está pendurando propriedades extras nela, exatamente como o Radix faz internamente.

---

## 6. Uso

```jsx
import { Button } from '@/components/Button'
import { PlusIcon } from '@/icons/PlusIcon'

// Só texto
<Button variant="primary" size="md">
  <Button.Label>Salvar</Button.Label>
</Button>

// Ícone + texto
<Button variant="primary" size="md">
  <Button.Content>
    <Button.Icon><PlusIcon /></Button.Icon>
    <Button.Label>Adicionar item</Button.Label>
  </Button.Content>
</Button>

// Só ícone (ex: botão de ação compacto)
<Button variant="ghost" size="sm" aria-label="Fechar">
  <Button.Icon><CloseIcon /></Button.Icon>
</Button>

// Estilo do Button aplicado a outro elemento, fora do fluxo de composição
<a href="/login" className={Button.Styles({ variant: 'ghost', size: 'sm' })}>
  Entrar
</a>
```

---

## 7. Teste (`specs/Button.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '../index'

describe('Button', () => {
  it('renderiza label', () => {
    render(
      <Button>
        <Button.Label>Salvar</Button.Label>
      </Button>
    )
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('renderiza ícone + label dentro de Content', () => {
    render(
      <Button>
        <Button.Content>
          <Button.Icon><svg data-testid="icon" /></Button.Icon>
          <Button.Label>Adicionar</Button.Label>
        </Button.Content>
      </Button>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Adicionar')).toBeInTheDocument()
  })

  it('Button.Icon dimensiona conforme o size', () => {
    render(
      <Button size="lg">
        <Button.Icon><svg data-testid="icon" /></Button.Icon>
      </Button>
    )
    expect(screen.getByTestId('icon')).toHaveAttribute('width', '18')
  })

  it('lança erro se Button.Label for usado fora de <Button>', () => {
    // Suprime o console.error esperado do React ao capturar o throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Button.Label>Solto</Button.Label>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Button variant="primary">
        <Button.Label>Salvar</Button.Label>
      </Button>
    )
    expect(container).toMatchSnapshot()
  })
})
```

---

## 8. Regra geral pros próximos componentes

Ao modelar um componente novo, pergunte nessa ordem:

1. **Ele é um elemento DOM único, sem portal/posicionamento?** → root implícito (como o Button). Senão → precisa de `.Root` explícito.
2. **Quais partes de conteúdo variam de caso pra caso?** Cada uma vira uma parte nomeada (`.Label`, `.Icon`, `.Description`, `.Trigger`...).
3. **As partes precisam saber de algo do pai** (tamanho, variante, estado aberto/fechado)? Se sim, entra um `Componente.context.ts` como o do Button.
4. **Existe estado compartilhado entre partes que ficam longe uma da outra na árvore** (ex: `Trigger` e `Content` de um Popover)? Isso é sinal de que precisa de `.Root` + Context, não é opcional.
5. Sempre expor `.Styles` quando fizer sentido reaproveitar a aparência fora da composição.

**Exemplos de partes esperadas pros próximos componentes** (rascunho, ajustar quando chegar a vez de cada um):

| Componente | Partes prováveis |
|---|---|
| Input | `Input.Root`, `Input.Label`, `Input.Field`, `Input.Error`, `Input.Hint` |
| Card | `Card.Root`, `Card.Header`, `Card.Title`, `Card.Content`, `Card.Footer` |
| Badge | `Badge` (root implícito), `Badge.Icon`, `Badge.Label` |
| Select | `Select.Root`, `Select.Trigger`, `Select.Value`, `Select.Portal`, `Select.Content`, `Select.Item` |
| Modal/Dialog | `Dialog.Root`, `Dialog.Trigger`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Close` |

---

## Próximo passo

Aplicar essa estrutura de partes no Button de verdade, junto com o que já foi definido em `idris-arquitetura-componentes.md` (Slot caseiro, `data-*`, `.styles.ts` separado). Depois do Button, o próximo componente da Onda 1 (provavelmente o Input) já nasce seguindo as duas docs juntas.