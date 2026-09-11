# Idris — Componente: Alert

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato dos demais `idris-componente-*.md`. Fase 1 do [`idris-roadmap-componentes.md`](./idris-roadmap-componentes.md).

---

## 1. Alert ≠ Toast

O roadmap original agrupava os dois como "Toast / Alert", como se fossem variações. Não são — e a diferença muda tudo, da estrutura à acessibilidade:

| | Alert | Toast |
|---|---|---|
| Onde vive | No fluxo da página, ancorado ao conteúdo | Num viewport fixo, sobreposto |
| Duração | Permanente até resolver | Efêmero, some sozinho |
| Quantidade | Um por contexto | Vários empilhados, com fila |
| Infraestrutura | Nenhuma | Viewport global, fila, swipe, `usePresence` |
| Fase no roadmap | 1 (barato) | 6 (caro) |

Um Alert é "esse formulário tem erros de validação" ou "sua assinatura vence em 3 dias" — informação que pertence àquele lugar da página. Um Toast é "salvo com sucesso" — confirmação de uma ação que já passou.

Este documento é só o Alert. O Toast fica pra Fase 6, quando `usePresence` e um viewport global existirem.

## 2. Root implícito, com contexto

1. **Elemento DOM único?** Sim, um `<div>`. → root implícito, como Card e Badge.
2. **Partes:** `Icon`, `Title`, `Description`, `Close`.
3. **Precisam saber do pai?** Sim — `variant` (o ícone padrão e a cor dependem dela) e a função de fechar. → `.context.ts`.

## 3. Partes

| Parte | Elemento | Papel | Obrigatória? |
|---|---|---|---|
| `Alert` (root implícito) | `<div>` | Container, `variant`, região viva, contexto | Sim |
| `Alert.Icon` | `<span>` | Ícone à esquerda. Dimensionado pelo contexto | Não |
| `Alert.Title` | `<p>` | Linha principal, em peso médio | Não |
| `Alert.Description` | `<div>` | Texto de apoio — aceita conteúdo rico (links, listas) | Não |
| `Alert.Close` | `<button>` | Dispensa o alerta | Não |
| `Alert.Styles` | — | `tv()` cru | Não |

**Por que `Description` é `<div>` e não `<p>`:** um alerta de validação costuma conter uma lista de erros, e `<ul>` dentro de `<p>` é HTML inválido — o navegador fecha o parágrafo sozinho e o resultado é uma árvore diferente da que você escreveu. O `Card.Description` é `<p>` porque ali o conteúdo é sempre uma linha de apoio; aqui não é.

## 4. A decisão de acessibilidade: `role="alert"` é intrusivo

Essa é a parte que mais gente erra. `role="alert"` cria uma região viva **assertiva**: o leitor de tela interrompe o que estiver falando pra anunciar o conteúdo.

Isso é certo pra um erro que apareceu agora, em resposta a uma ação. É errado pra um aviso que já estava na página quando ela carregou — nesse caso o conteúdo é lido na ordem normal, e forçar interrupção só atrapalha.

Pior: um alerta **estático** com `role="alert"` pode ser anunciado na montagem, do nada, antes da pessoa ter contexto do que está ouvindo.

Por isso o comportamento é uma prop explícita:

| `live` | `role` | Quando |
|---|---|---|
| `off` (padrão) | nenhum | Alerta que já está na página. Lido na ordem natural |
| `polite` | `status` | Apareceu agora, mas pode esperar a pessoa terminar |
| `assertive` | `alert` | Erro que exige atenção imediata |

O padrão é `off` porque a maioria dos alertas é estática. Quem renderiza um alerta em resposta a uma ação escolhe conscientemente entre `polite` e `assertive`.

> Comparação útil: o `Input.Error` usa `role="alert"` fixo, e está certo — ele **só** existe quando a validação falha, então nunca é estático. O Alert é genérico e precisa da escolha.

## 5. Variantes

`info` · `success` · `warning` · `error` · `neutral`

As quatro primeiras reaproveitam os tokens `-bg` que já existem desde a fundação (`success-bg`, `warning-bg`, `error-bg`, `info-bg`) — foram criados justamente pra "fundo de alerta/toast", conforme a seção 2.1 de `design-system-fundacao.md`, e este é o primeiro componente a usá-los como fundo de bloco. A `neutral` usa `surface-elevated`, como o Badge neutro.

Sem `brand` e sem `accent`: alerta é comunicação semântica de estado, e as cores de marca não carregam significado de estado. Mesma regra de composição que manteve o `accent` fora do Button.

**Sem tamanhos.** Um alerta ocupa a largura do container e tem o padding que tem. Um "alerta pequeno" é um `Text size="body-sm" color="secondary"`; um "alerta grande" é um Card. Mesmo argumento que limitou o Badge a dois tamanhos.

| Atributo | Valores |
|---|---|
| `data-variant` | `info` · `success` · `warning` · `error` · `neutral` |
| `data-live` | `off` · `polite` · `assertive` |

## 6. Ícone padrão por variante

`Alert.Icon` sem filho renderiza o ícone convencional da variante (check, exclamação, informação). Com filho, usa o que você passou.

Isso existe porque o ícone de um alerta é quase sempre previsível pela variante, e obrigar a passar `<CheckIcon />` em todo alerta de sucesso é repetição sem escolha real. Mas continua sendo composição — quem quiser outro ícone só passa.

> **Dependência:** isso pressupõe um conjunto de ícones no projeto. Hoje os exemplos das docs usam `<CheckIcon />`, `<CloseIcon />` etc. sem que exista uma pasta de ícones definida. Se não existir, o fallback é `Alert.Icon` sempre exigir filho — e fica registrado que um `src/icons/` precisa ser decidido em algum momento.
>
> **Implementado com o fallback.** `src/icons/` não existe no projeto — `Alert.Icon` segue o mesmo contrato do `Badge.Icon`: `children` obrigatório, sem lookup de ícone padrão por variante. O código da seção 9 abaixo reflete a versão com ícone padrão (a intenção original); a versão realmente implementada é a mais simples. Revisitar quando `src/icons/` existir.

## 7. Tokens usados

`success`/`success-bg`, `warning`/`warning-bg`, `error`/`error-bg`, `info`/`info-bg`, `surface-elevated`, `text-primary`, `text-secondary`, `border-thin`, `radius-md`, `space-3`/`space-4`, `duration-fast`. Nenhum token novo.

---

## 8. Estrutura de pastas

```
src/components/Alert/
├── Alert.tsx
├── Alert.context.ts
├── Alert.styles.ts
├── Alert.stories.tsx
├── index.ts
├── parts/
│   ├── Icon.tsx
│   ├── Title.tsx
│   ├── Description.tsx
│   └── Close.tsx
└── specs/
    ├── Alert.test.tsx
    └── __snapshots__/
```

---

## 9. Código

**`Alert.context.ts`**:

```ts
import { createContext, useContext } from 'react'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral'
export type AlertLive = 'off' | 'polite' | 'assertive'

export interface AlertContextValue {
  variant: AlertVariant
  onClose?: () => void
}

export const AlertContext = createContext<AlertContextValue | null>(null)

export function useAlertContext(part: string) {
  const ctx = useContext(AlertContext)
  if (!ctx) {
    throw new Error(`<Alert.${part} /> precisa estar dentro de <Alert>`)
  }
  return ctx
}

/** role e aria-live derivados da prop `live` — ver seção 4. */
export function liveAttributes(live: AlertLive) {
  if (live === 'assertive') return { role: 'alert' as const }
  if (live === 'polite') return { role: 'status' as const }
  return {}
}
```

**`Alert.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const alert = tv({
  base: 'flex gap-3 rounded-md border p-4 text-sm',
  variants: {
    variant: {
      info: 'border-info/30 bg-info-bg text-text-primary',
      success: 'border-success/30 bg-success-bg text-text-primary',
      warning: 'border-warning/30 bg-warning-bg text-text-primary',
      error: 'border-error/30 bg-error-bg text-text-primary',
      neutral: 'border-white/10 bg-surface-elevated text-text-primary',
    },
  },
  defaultVariants: { variant: 'neutral' },
})

export const icon = tv({
  // shrink-0 e mt-0.5: o ícone alinha com a primeira linha de texto,
  // não com o centro do bloco inteiro quando a descrição é longa
  base: 'shrink-0 mt-0.5',
  variants: {
    variant: {
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
      neutral: 'text-text-secondary',
    },
  },
})

export const body = tv({ base: 'flex min-w-0 flex-1 flex-col gap-1' })
export const title = tv({ base: 'font-sans font-medium text-text-primary' })
export const description = tv({ base: 'text-text-secondary [&_a]:underline' })

export const close = tv({
  base: [
    'shrink-0 -mr-1 -mt-1 inline-flex h-6 w-6 items-center justify-center',
    'rounded-sm text-text-secondary transition-colors duration-fast',
    'hover:text-text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
  ],
})
```

**`Alert.tsx`** — o root:

```tsx
import { forwardRef, useMemo, type HTMLAttributes } from 'react'
import { alert } from './Alert.styles'
import { AlertContext, liveAttributes, type AlertVariant, type AlertLive } from './Alert.context'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  /** Como leitores de tela anunciam este alerta — ver seção 4. Default: 'off' */
  live?: AlertLive
  /** Torna o alerta dispensável. Sem isso, Alert.Close não faz nada. */
  onClose?: () => void
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'neutral', live = 'off', onClose, children, ...props }, ref) => {
    const value = useMemo(() => ({ variant, onClose }), [variant, onClose])

    return (
      <AlertContext.Provider value={value}>
        <div
          ref={ref}
          {...liveAttributes(live)}
          data-variant={variant}
          data-live={live}
          className={alert({ variant, className })}
          {...props}
        >
          {children}
        </div>
      </AlertContext.Provider>
    )
  }
)

Alert.displayName = 'Alert'
```

**`parts/Icon.tsx`**:

```tsx
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { useAlertContext, type AlertVariant } from '../Alert.context'
import { icon } from '../Alert.styles'
import { InfoIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon } from '../../../icons'

const DEFAULT_ICON: Record<AlertVariant, ReactNode> = {
  info: <InfoIcon />,
  success: <CheckCircleIcon />,
  warning: <AlertTriangleIcon />,
  error: <XCircleIcon />,
  neutral: <InfoIcon />,
}

export interface AlertIconProps {
  children?: ReactElement<{ width?: number; height?: number; 'aria-hidden'?: boolean }>
}

export function AlertIcon({ children }: AlertIconProps) {
  const { variant } = useAlertContext('Icon')
  const node = children ?? DEFAULT_ICON[variant]

  if (!isValidElement(node)) return null

  return (
    <span className={icon({ variant })}>
      {cloneElement(node as ReactElement<Record<string, unknown>>, {
        width: 16,
        height: 16,
        // Decoração: a variante já é comunicada pelo texto e pelo role
        'aria-hidden': true,
      })}
    </span>
  )
}

AlertIcon.displayName = 'Alert.Icon'
```

**`parts/Title.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { useAlertContext } from '../Alert.context'
import { title } from '../Alert.styles'

export const AlertTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    useAlertContext('Title')
    return <p ref={ref} className={title({ className })} {...props} />
  }
)

AlertTitle.displayName = 'Alert.Title'
```

**`parts/Description.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { useAlertContext } from '../Alert.context'
import { description } from '../Alert.styles'

// <div> e não <p>: precisa aceitar listas e conteúdo rico — ver seção 3
export const AlertDescription = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    useAlertContext('Description')
    return <div ref={ref} className={description({ className })} {...props} />
  }
)

AlertDescription.displayName = 'Alert.Description'
```

**`parts/Close.tsx`**:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { useAlertContext } from '../Alert.context'
import { close } from '../Alert.styles'

export const AlertClose = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, 'aria-label': ariaLabel = 'Fechar aviso', ...props }, ref) => {
    const { onClose } = useAlertContext('Close')

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        className={close({ className })}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) onClose?.()
        }}
        {...props}
      />
    )
  }
)

AlertClose.displayName = 'Alert.Close'
```

**`index.ts`**:

```ts
import { Alert as Root } from './Alert'
import { AlertIcon } from './parts/Icon'
import { AlertTitle } from './parts/Title'
import { AlertDescription } from './parts/Description'
import { AlertClose } from './parts/Close'
import { alert as alertStyles } from './Alert.styles'

export const Alert = Object.assign(Root, {
  Icon: AlertIcon,
  Title: AlertTitle,
  Description: AlertDescription,
  Close: AlertClose,
  Styles: alertStyles,
})

export type { AlertProps } from './Alert'
export type { AlertVariant, AlertLive } from './Alert.context'
```

> O `body` do `Alert.styles.ts` não vira parte, pela mesma lógica que deixou `Header`/`Footer` do Dialog como estilos: é wrapper de layout, não uma peça que o consumidor compõe conscientemente. Quem usa aplica `className={Alert.Styles.body?.()}`... **ou** — mais simples — o root já faz o `flex gap-3` e o consumidor agrupa Title e Description numa `<div className="flex flex-col gap-1">`. Escolhi a segunda, por isso `body` fica exportado mas não é obrigatório.

---

## 10. Uso

```jsx
// Aviso estático — o padrão, sem região viva
<Alert variant="warning">
  <Alert.Icon />
  <div className="flex flex-col gap-1">
    <Alert.Title>Sua assinatura vence em 3 dias</Alert.Title>
    <Alert.Description>
      Renove pra não perder acesso. <a href="/planos">Ver planos</a>
    </Alert.Description>
  </div>
</Alert>

// Erro de validação que apareceu depois do submit — interrompe
<Alert variant="error" live="assertive">
  <Alert.Icon />
  <div className="flex flex-col gap-1">
    <Alert.Title>Não foi possível salvar</Alert.Title>
    <Alert.Description>
      <ul className="list-disc pl-4">
        <li>O e-mail já está em uso</li>
        <li>A senha precisa ter 8 caracteres</li>
      </ul>
    </Alert.Description>
  </div>
</Alert>

// Confirmação que apareceu agora, mas não é urgente
<Alert variant="success" live="polite">
  <Alert.Icon />
  <Alert.Title>Alterações salvas</Alert.Title>
</Alert>

// Dispensável
<Alert variant="info" onClose={() => setVisivel(false)}>
  <Alert.Icon />
  <div className="flex flex-col gap-1">
    <Alert.Title>Novidade: temas claro e escuro</Alert.Title>
    <Alert.Description>Alterne nas configurações da conta.</Alert.Description>
  </div>
  <Alert.Close><CloseIcon /></Alert.Close>
</Alert>

// Ícone customizado
<Alert variant="neutral">
  <Alert.Icon><SparklesIcon /></Alert.Icon>
  <Alert.Title>Dica: use Cmd+K pra buscar</Alert.Title>
</Alert>

// Só título, sem ícone — as partes são todas opcionais
<Alert variant="error">
  <Alert.Title>Campo obrigatório</Alert.Title>
</Alert>
```

---

## 11. Acessibilidade

- `role` derivado da prop `live`, com padrão sem região viva (seção 4)
- O ícone é `aria-hidden` — a variante é comunicada pelo texto, não pela cor nem pelo símbolo. **Cor nunca é o único portador de significado**, e é por isso que um alerta sem título é desencorajado
- `Alert.Close` tem `aria-label` padrão ("Fechar aviso"), sobrescrevível
- Contraste: os tokens `-bg` são fundos escuros no dark e claros no light, com o texto sempre em `text-primary`. **Verificar no addon de a11y do Storybook nas cinco variantes e nos dois temas** — a seção 5 de `design-system-fundacao.md` marca isso como o ponto de falha mais comum, e alerta é onde mais dói errar
- Um alerta com `live="assertive"` que fica na tela permanentemente é um erro de uso: ele interrompe na montagem e depois vira ruído visual. `assertive` é pra o que aparece e some

---

## 12. Teste (`specs/Alert.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from '../index'

describe('Alert', () => {
  it('não cria região viva por padrão', () => {
    render(
      <Alert variant="warning">
        <Alert.Title>Aviso</Alert.Title>
      </Alert>
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('Aviso')).toBeInTheDocument()
  })

  it('usa role="alert" quando live é assertive', () => {
    render(
      <Alert variant="error" live="assertive">
        <Alert.Title>Erro</Alert.Title>
      </Alert>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('usa role="status" quando live é polite', () => {
    render(
      <Alert variant="success" live="polite">
        <Alert.Title>Salvo</Alert.Title>
      </Alert>
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('aplica o data-variant', () => {
    const { container } = render(
      <Alert variant="error">
        <Alert.Title>Erro</Alert.Title>
      </Alert>
    )
    expect(container.firstChild).toHaveAttribute('data-variant', 'error')
  })

  it('renderiza o ícone padrão da variante', () => {
    const { container } = render(
      <Alert variant="success">
        <Alert.Icon />
        <Alert.Title>Salvo</Alert.Title>
      </Alert>
    )
    expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('usa o ícone customizado quando informado', () => {
    render(
      <Alert variant="neutral">
        <Alert.Icon>
          <svg data-testid="custom" />
        </Alert.Icon>
        <Alert.Title>Dica</Alert.Title>
      </Alert>
    )
    expect(screen.getByTestId('custom')).toBeInTheDocument()
  })

  it('chama onClose ao clicar em Alert.Close', async () => {
    const onClose = vi.fn()
    render(
      <Alert variant="info" onClose={onClose}>
        <Alert.Title>Novidade</Alert.Title>
        <Alert.Close>×</Alert.Close>
      </Alert>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('Description aceita conteúdo rico sem quebrar o HTML', () => {
    const { container } = render(
      <Alert variant="error">
        <Alert.Description>
          <ul>
            <li>Erro um</li>
          </ul>
        </Alert.Description>
      </Alert>
    )
    // Um <p> teria expulsado a <ul> pra fora na hora do parse
    expect(container.querySelector('ul li')).toBeInTheDocument()
  })

  it('lança erro se uma parte for usada fora do Alert', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Alert.Title>Solto</Alert.Title>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Alert variant="warning">
        <Alert.Icon />
        <div className="flex flex-col gap-1">
          <Alert.Title>Atenção</Alert.Title>
          <Alert.Description>Detalhes do aviso.</Alert.Description>
        </div>
      </Alert>
    )
    expect(container).toMatchSnapshot()
  })
})
```
