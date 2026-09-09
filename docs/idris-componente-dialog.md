# Idris — Componente: Dialog (Modal)

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato dos demais `idris-componente-*.md`. Depende inteiramente de [`idris-primitivas-overlay.md`](./idris-primitivas-overlay.md) — implemente aquelas primeiro, ou este componente vira 300 linhas de comportamento misturado com estilo.

---

## 1. Por que tem `.Root` explícito

Sequência de decisão da seção 8 de `idris-estrutura-componentes.md`:

1. **Elemento DOM único, sem portal/posicionamento?** Não — precisa de portal por definição. → **`.Root` explícito**.
2. **Partes:** `Trigger`, `Portal`, `Overlay`, `Content`, `Title`, `Description`, `Close`.
3. **Precisam saber do pai?** Sim: estado `open`, função de fechar, ids do título e da descrição.
4. **Estado compartilhado entre partes distantes na árvore?** Sim, e no caso mais extremo possível: o `Trigger` fica onde a pessoa clicou e o `Content` é teleportado pro `<body>`. É literalmente o exemplo do Popover citado na seção 2 de `idris-estrutura-componentes.md`, que motivou toda essa arquitetura.

## 2. Partes

| Parte | Elemento | Papel |
|---|---|---|
| `Dialog.Root` | nenhum | Estado `open` (controlado ou não), gera os ids de título/descrição, contexto. Não renderiza DOM |
| `Dialog.Trigger` | `<button>` (ou `asChild`) | Abre o dialog. Carrega `aria-haspopup` e `aria-expanded` |
| `Dialog.Portal` | nenhum | Teleporta o conteúdo pro `<body>`. Só renderiza quando `open` |
| `Dialog.Overlay` | `<div>` | Fundo escurecido |
| `Dialog.Content` | `<div role="dialog">` | A caixa. Junta `FocusScope` + `DismissableLayer` + `useScrollLock` |
| `Dialog.Title` | `<h2>` (ou `asChild`) | Título — registra o `aria-labelledby` do Content |
| `Dialog.Description` | `<p>` | Texto de apoio — registra o `aria-describedby` |
| `Dialog.Close` | `<button>` (ou `asChild`) | Fecha o dialog |

**Por que `Portal` é uma parte explícita e não automático dentro do `Content`:** deixa quem usa escolher o container (`<Dialog.Portal container={ref.current}>`), o que importa em apps com shadow DOM, iframes ou testes que preferem manter tudo dentro do container renderizado. Também deixa a estrutura visível no JSX — quem lê o código vê que aquilo é teleportado, em vez de descobrir na DevTools.

## 3. Onde cada primitiva entra

O `Dialog.Content` é essencialmente a composição das quatro peças de overlay:

```
<Dialog.Portal>            → Portal (escapa de overflow/z-index)
  <Dialog.Overlay />
  <Dialog.Content>         → FocusScope (prende e devolve o foco)
                           → DismissableLayer (Escape + clique fora)
                           → useScrollLock (trava a página de fundo)
```

Se essas quatro estiverem corretas e testadas, o que sobra pro Dialog é `role="dialog"`, `aria-modal`, os ids de rótulo, e estilo. É o retorno do investimento do documento anterior.

## 4. Estado controlado e não-controlado

`open` / `defaultOpen` / `onOpenChange`, via o mesmo `useControllableState` de Checkbox e Switch (ver [`idris-primitivas-formulario.md`](./idris-primitivas-formulario.md)). O caso não-controlado — `Dialog.Trigger` abre, `Dialog.Close` e `Escape` fecham — cobre a maioria dos usos sem nenhum `useState` na aplicação.

## 5. `modal` — a prop que muda três comportamentos de uma vez

| `modal` | Scroll da página | Foco preso | Clique fora |
|---|---|---|---|
| `true` (padrão) | travado | sim | fecha |
| `false` | livre | não | fecha |

Um dialog não-modal é aquele que convive com a página (um painel lateral de configurações que deixa você continuar rolando o conteúdo). Não é o caso comum, mas é barato de suportar porque as três primitivas já aceitam ser desligadas individualmente — a prop só as coordena.

## 6. Tamanhos

`sm` (400px) · `md` (520px) · `lg` (680px) · `full` (quase tela cheia, com margem). Todos com `max-width` + largura fluida, então em telas pequenas o dialog ocupa a largura disponível menos a margem — sem media query.

| Atributo | Onde | Valores |
|---|---|---|
| `data-state` | Trigger, Overlay, Content | `open` · `closed` |
| `data-size` | Content | `sm` · `md` · `lg` · `full` |
| `data-modal` | Content | presente ou ausente |

## 7. Tokens usados

`surface-elevated` (fundo da caixa — é um elemento flutuante, conforme a regra da seção 2.1 de `design-system-fundacao.md`), `border-thin` (borda sutil de 10% branco, que é como a elevação funciona no Idris em vez de `box-shadow` — seção 2.4), `radius-lg` (16px, o token de modais), `background` com opacidade pro overlay, `space-5`/`space-6` (paddings), `duration-base` (250ms — a transição padrão de abrir/fechar), tipografia: título em `font-display` (Fraunces), descrição em `text-sm` + `text-secondary`.

> **Pendência de design registrada:** o mockup do Dialog no Figma tem um fill branco indevido atrás dos botões do footer (listado nas pendências de `idris-memoria-projeto.md`). O código abaixo **não** reproduz esse fill — o footer usa fundo transparente com um separador de 1px, igual ao `Card.Footer`. Quando o Figma for corrigido, é o Figma que se alinha ao código, não o contrário.

---

## 8. Estrutura de pastas

```
src/components/Dialog/
├── Dialog.Root.tsx        # root explícito — estado, ids, contexto. Não renderiza DOM
├── Dialog.context.ts
├── Dialog.styles.ts
├── Dialog.stories.tsx
├── index.ts
├── parts/
│   ├── Trigger.tsx
│   ├── Portal.tsx
│   ├── Overlay.tsx
│   ├── Content.tsx
│   ├── Title.tsx
│   ├── Description.tsx
│   └── Close.tsx
└── specs/
    ├── Dialog.test.tsx
    └── __snapshots__/
```

---

## 9. Código

**`Dialog.context.ts`**:

```ts
import { createContext, useContext } from 'react'

export type DialogSize = 'sm' | 'md' | 'lg' | 'full'

export interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  modal: boolean
  titleId: string
  descriptionId: string
  /** Title e Description avisam que existem — ver seção 10. */
  hasTitle: boolean
  hasDescription: boolean
  registerTitle: () => () => void
  registerDescription: () => () => void
}

export const DialogContext = createContext<DialogContextValue | null>(null)

export function useDialogContext(part: string) {
  const ctx = useContext(DialogContext)
  if (!ctx) {
    throw new Error(`<Dialog.${part} /> precisa estar dentro de <Dialog.Root>`)
  }
  return ctx
}
```

**`Dialog.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const overlay = tv({
  base: [
    'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
    'transition-opacity duration-base',
  ],
})

export const content = tv({
  base: [
    'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
    'w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] overflow-y-auto',
    'rounded-lg border border-white/10 bg-surface-elevated',
    'focus-visible:outline-none',
    'transition-opacity duration-base',
  ],
  variants: {
    size: {
      sm: 'max-w-[400px]',
      md: 'max-w-[520px]',
      lg: 'max-w-[680px]',
      full: 'max-w-[calc(100vw-4rem)] max-h-[calc(100vh-4rem)]',
    },
  },
  defaultVariants: { size: 'md' },
})

export const header = tv({ base: 'flex flex-col gap-1.5 p-6 pb-0' })
export const title = tv({ base: 'font-display text-xl font-semibold text-text-primary' })
export const description = tv({ base: 'text-sm text-text-secondary' })
export const body = tv({ base: 'p-6' })
export const footer = tv({
  base: 'flex items-center justify-end gap-2 border-t border-white/10 p-6',
})
export const close = tv({
  base: [
    'absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center',
    'rounded-md text-text-secondary transition-colors duration-fast',
    'hover:bg-surface hover:text-text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
  ],
})
```

> `header`, `body` e `footer` são estilos exportados, não partes. Diferente do Card, o layout interno do Dialog varia muito de caso pra caso (formulário, confirmação, conteúdo longo com rolagem), então forçar `Dialog.Header`/`Dialog.Body`/`Dialog.Footer` como partes obrigatórias engessaria sem ganho. Quem quiser a estrutura padrão aplica as classes; quem não quiser, compõe livre. Se na prática todo dialog acabar usando as três, aí sim viram partes.

**`Dialog.Root.tsx`**:

```tsx
import { useCallback, useId, useMemo, useState, type ReactNode } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { DialogContext } from './Dialog.context'

export interface DialogRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Trava o scroll, prende o foco e escurece o fundo. Default: true */
  modal?: boolean
  children?: ReactNode
}

export function DialogRoot({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  children,
}: DialogRootProps) {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  const baseId = useId()
  const [hasTitle, setHasTitle] = useState(false)
  const [hasDescription, setHasDescription] = useState(false)

  const registerTitle = useCallback(() => {
    setHasTitle(true)
    return () => setHasTitle(false)
  }, [])

  const registerDescription = useCallback(() => {
    setHasDescription(true)
    return () => setHasDescription(false)
  }, [])

  const value = useMemo(
    () => ({
      open,
      setOpen: setOpen as (o: boolean) => void,
      modal,
      titleId: `${baseId}-title`,
      descriptionId: `${baseId}-description`,
      hasTitle,
      hasDescription,
      registerTitle,
      registerDescription,
    }),
    [open, setOpen, modal, baseId, hasTitle, hasDescription, registerTitle, registerDescription]
  )

  // O Root não renderiza DOM nenhum — é só o nó de estado, igual ao Popover.Root do Radix
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
}

DialogRoot.displayName = 'Dialog.Root'
```

**`parts/Trigger.tsx`**:

```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useDialogContext } from '../Dialog.context'

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild, onClick, children, ...props }, ref) => {
    const { open, setOpen } = useDialogContext('Trigger')

    const sharedProps = {
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': open,
      'data-state': open ? ('open' as const) : ('closed' as const),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(true)
      },
    }

    if (asChild) {
      return (
        <Slot ref={ref} {...sharedProps} {...props}>
          {children as ReactElement<Record<string, unknown>>}
        </Slot>
      )
    }

    return (
      <button ref={ref} type="button" {...sharedProps} {...props}>
        {children}
      </button>
    )
  }
)

DialogTrigger.displayName = 'Dialog.Trigger'
```

**`parts/Portal.tsx`**:

```tsx
import type { ReactNode } from 'react'
import { Portal } from '../../../primitives/Portal'
import { useDialogContext } from '../Dialog.context'

export interface DialogPortalProps {
  children: ReactNode
  container?: Element | null
  /** Mantém no DOM mesmo fechado (útil pra animação de saída — ver seção 11). */
  forceMount?: boolean
}

export function DialogPortal({ children, container, forceMount }: DialogPortalProps) {
  const { open } = useDialogContext('Portal')
  if (!open && !forceMount) return null
  return <Portal container={container}>{children}</Portal>
}

DialogPortal.displayName = 'Dialog.Portal'
```

**`parts/Overlay.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { useDialogContext } from '../Dialog.context'
import { overlay } from '../Dialog.styles'

export const DialogOverlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open, modal } = useDialogContext('Overlay')
    // Sem overlay em dialog não-modal: escurecer o fundo comunica
    // "o resto está bloqueado", o que seria mentira aqui
    if (!modal) return null

    return (
      <div
        ref={ref}
        aria-hidden
        data-state={open ? 'open' : 'closed'}
        className={overlay({ className })}
        {...props}
      />
    )
  }
)

DialogOverlay.displayName = 'Dialog.Overlay'
```

> O overlay **não** tem `onClick` pra fechar. Quem cuida de clique fora é o `DismissableLayer` dentro do `Content` — e ele usa `pointerdown`, o que evita o bug clássico de começar a selecionar texto dentro do dialog, soltar o mouse fora, e o dialog fechar.

**`parts/Content.tsx`** — a peça central, onde as primitivas se juntam:

```tsx
import { forwardRef, useEffect, type HTMLAttributes } from 'react'
import { DismissableLayer } from '../../../primitives/DismissableLayer'
import { FocusScope } from '../../../primitives/FocusScope'
import { useScrollLock } from '../../../hooks/useScrollLock'
import { useDialogContext, type DialogSize } from '../Dialog.context'
import { content } from '../Dialog.styles'

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  size?: DialogSize
  /** Desliga o fechamento por clique fora (base do AlertDialog). */
  disableOutsideClose?: boolean
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, size = 'md', disableOutsideClose = false, children, ...props }, ref) => {
    const { open, setOpen, modal, titleId, descriptionId, hasTitle, hasDescription } =
      useDialogContext('Content')

    useScrollLock(open && modal)

    // Título é requisito de acessibilidade, não sugestão — avisa em dev se faltar
    useEffect(() => {
      if (process.env.NODE_ENV === 'production' || !open) return
      if (!hasTitle) {
        console.warn(
          '[idris] <Dialog.Content> sem <Dialog.Title>. Leitores de tela vão anunciar o ' +
            'dialog sem nome. Use <VisuallyHidden> se o título não deve aparecer na tela.'
        )
      }
    }, [open, hasTitle])

    return (
      <FocusScope trapped={modal} autoFocus restoreFocus>
        <DismissableLayer
          ref={ref}
          role="dialog"
          aria-modal={modal || undefined}
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
          data-state={open ? 'open' : 'closed'}
          data-size={size}
          data-modal={modal || undefined}
          disableOutsidePointerDown={disableOutsideClose}
          onDismiss={() => setOpen(false)}
          className={content({ size, className })}
          {...props}
        >
          {children}
        </DismissableLayer>
      </FocusScope>
    )
  }
)

DialogContent.displayName = 'Dialog.Content'
```

> **Ordem importa:** `FocusScope` por fora, `DismissableLayer` por dentro. Se fosse ao contrário, o nó que o `DismissableLayer` usa pra decidir "clicou dentro ou fora" seria o wrapper do FocusScope, e um clique na área do FocusScope que não é o dialog contaria como "dentro". Com essa ordem, o nó de referência é a caixa de verdade.

**`parts/Title.tsx`**:

```tsx
import { forwardRef, useEffect, type HTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useDialogContext } from '../Dialog.context'
import { title } from '../Dialog.styles'

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Troca o nível do heading conforme a hierarquia da página. */
  asChild?: boolean
}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, asChild, children, ...props }, ref) => {
    const { titleId, registerTitle } = useDialogContext('Title')

    useEffect(() => registerTitle(), [registerTitle])

    const sharedProps = { id: titleId, className: title({ className }) }

    if (asChild) {
      return (
        <Slot ref={ref} {...sharedProps} {...props}>
          {children as ReactElement<Record<string, unknown>>}
        </Slot>
      )
    }

    return (
      <h2 ref={ref} {...sharedProps} {...props}>
        {children}
      </h2>
    )
  }
)

DialogTitle.displayName = 'Dialog.Title'
```

**`parts/Description.tsx`**:

```tsx
import { forwardRef, useEffect, type HTMLAttributes } from 'react'
import { useDialogContext } from '../Dialog.context'
import { description } from '../Dialog.styles'

export const DialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { descriptionId, registerDescription } = useDialogContext('Description')

    useEffect(() => registerDescription(), [registerDescription])

    return <p ref={ref} id={descriptionId} className={description({ className })} {...props} />
  }
)

DialogDescription.displayName = 'Dialog.Description'
```

**`parts/Close.tsx`**:

```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useDialogContext } from '../Dialog.context'

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild, onClick, children, ...props }, ref) => {
    const { setOpen } = useDialogContext('Close')

    const sharedProps = {
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(false)
      },
    }

    if (asChild) {
      return (
        <Slot ref={ref} {...sharedProps} {...props}>
          {children as ReactElement<Record<string, unknown>>}
        </Slot>
      )
    }

    return (
      <button ref={ref} type="button" {...sharedProps} {...props}>
        {children}
      </button>
    )
  }
)

DialogClose.displayName = 'Dialog.Close'
```

**`index.ts`** — objeto de partes, igual ao Input e ao RadioGroup:

```ts
export { DialogRoot as Root } from './Dialog.Root'
export { DialogTrigger as Trigger } from './parts/Trigger'
export { DialogPortal as Portal } from './parts/Portal'
export { DialogOverlay as Overlay } from './parts/Overlay'
export { DialogContent as Content } from './parts/Content'
export { DialogTitle as Title } from './parts/Title'
export { DialogDescription as Description } from './parts/Description'
export { DialogClose as Close } from './parts/Close'

export {
  header as HeaderStyles,
  body as BodyStyles,
  footer as FooterStyles,
  close as CloseStyles,
} from './Dialog.styles'

export type { DialogRootProps } from './Dialog.Root'
export type { DialogContentProps } from './parts/Content'
export type { DialogSize } from './Dialog.context'
```

---

## 10. Por que Title e Description se registram, em vez de terem id fixo

O `Content` precisa de `aria-labelledby={titleId}`. Se o id fosse sempre declarado, um dialog sem `Dialog.Title` apontaria pra um elemento inexistente — e um `aria-labelledby` quebrado é **pior** que nenhum: alguns leitores de tela anunciam o dialog sem nome nenhum em vez de cair pro comportamento padrão.

Por isso as duas partes avisam o Root ao montar (`useEffect` + callback), e o `Content` só declara os atributos quando as partes realmente existem. É o mesmo padrão que `Input.Hint`/`Input.Error` já usam pra montar o `aria-describedby`, aplicado ao caso inverso.

---

## 11. Simplificação deliberada: animação de saída

O `Dialog.Portal` desmonta o conteúdo assim que `open` vira `false`. Resultado: a **entrada** pode ser animada (o elemento monta e a transição roda), mas a **saída** é instantânea — não dá pra animar algo que já saiu do DOM.

Resolver isso direito exige um `usePresence`: manter o elemento montado até a transição terminar, escutando `animationend`/`transitionend`. O `forceMount` no `Portal` já deixa a porta aberta pra isso (quem usa pode manter montado e controlar a visibilidade na mão). Fica documentado como próxima melhoria, junto com o `usePresence` que Popover e Select também vão querer — quando aparecer, é um hook novo em `hooks/`, não uma mudança nesse componente.

Mesmo espírito das simplificações da seção 3 de [`idris-componente-tooltip.md`](./idris-componente-tooltip.md): documentado, não esquecido.

---

## 12. Uso

```jsx
import * as Dialog from '@/components/Dialog'

// Não-controlado — nenhum useState na aplicação
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button variant="primary"><Button.Label>Editar perfil</Button.Label></Button>
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content size="md">
      <div className={Dialog.HeaderStyles()}>
        <Dialog.Title>Editar perfil</Dialog.Title>
        <Dialog.Description>Suas mudanças aparecem imediatamente.</Dialog.Description>
      </div>

      <div className={Dialog.BodyStyles()}>
        <Input.Root>
          <Input.Label>Nome</Input.Label>
          <Input.Field defaultValue="Ka" />
        </Input.Root>
      </div>

      <div className={Dialog.FooterStyles()}>
        <Dialog.Close asChild>
          <Button variant="ghost" size="sm"><Button.Label>Cancelar</Button.Label></Button>
        </Dialog.Close>
        <Button variant="primary" size="sm"><Button.Label>Salvar</Button.Label></Button>
      </div>

      <Dialog.Close className={Dialog.CloseStyles()} aria-label="Fechar">
        <CloseIcon />
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// Controlado — abrir a partir de outro fluxo (resposta de API, atalho de teclado)
<Dialog.Root open={aberto} onOpenChange={setAberto}>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content size="sm">
      <div className={Dialog.HeaderStyles()}>
        <Dialog.Title>Sessão expirada</Dialog.Title>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// Confirmação destrutiva — não fecha por clique fora (base do futuro AlertDialog)
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button variant="destructive" size="sm"><Button.Label>Excluir conta</Button.Label></Button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content size="sm" disableOutsideClose>
      <div className={Dialog.HeaderStyles()}>
        <Dialog.Title>Excluir conta?</Dialog.Title>
        <Dialog.Description>Essa ação é permanente.</Dialog.Description>
      </div>
      <div className={Dialog.FooterStyles()}>
        <Dialog.Close asChild>
          <Button variant="secondary" size="sm"><Button.Label>Cancelar</Button.Label></Button>
        </Dialog.Close>
        <Button variant="destructive" size="sm"><Button.Label>Excluir</Button.Label></Button>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// Sem título visível — o VisuallyHidden mantém a acessibilidade
<Dialog.Content size="full">
  <VisuallyHidden>
    <Dialog.Title>Galeria de imagens</Dialog.Title>
  </VisuallyHidden>
  <img src="/foto.jpg" alt="" />
</Dialog.Content>
```

---

## 13. Acessibilidade

- `role="dialog"` + `aria-modal="true"` quando modal
- `aria-labelledby` e `aria-describedby` só quando as partes correspondentes existem (seção 10), com aviso em dev quando o título falta
- `Escape` fecha, respeitando a pilha de camadas — um Select aberto dentro do Dialog fecha primeiro
- Foco entra no primeiro elemento focável ao abrir e volta pro `Trigger` ao fechar
- `Tab` circula dentro do dialog (só no modo modal)
- Overlay é `aria-hidden` — é decoração
- O botão de fechar em `X` precisa de `aria-label`, porque só tem ícone
- **Limite conhecido:** sem `inert` no resto da página (ver seção 6.3 de `idris-primitivas-overlay.md`) — o `aria-modal` cobre o caso principal, mas navegação livre de leitor de tela ainda alcança o fundo

---

## 14. Teste (`specs/Dialog.test.tsx`)

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import * as Dialog from '../index'

function Setup(props: Dialog.DialogRootProps = {}) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger>Abrir</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Editar perfil</Dialog.Title>
          <Dialog.Description>Descrição do dialog</Dialog.Description>
          <button>campo</button>
          <Dialog.Close>Cancelar</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

describe('Dialog', () => {
  it('abre pelo Trigger e fecha pelo Close', async () => {
    render(<Setup />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Abrir'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('associa título e descrição via aria', async () => {
    render(<Setup defaultOpen />)
    const dialog = screen.getByRole('dialog')

    expect(dialog).toHaveAttribute('aria-labelledby', screen.getByText('Editar perfil').id)
    expect(dialog).toHaveAttribute('aria-describedby', screen.getByText('Descrição do dialog').id)
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('não declara aria-labelledby quando não há Title', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Content>sem título</Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )

    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby')
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('fecha no Escape', async () => {
    render(<Setup defaultOpen />)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('fecha no clique fora', async () => {
    render(<Setup defaultOpen />)
    await userEvent.click(document.body)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('não fecha no clique fora quando disableOutsideClose', async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Content disableOutsideClose>
            <Dialog.Title>Confirmar</Dialog.Title>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )

    await userEvent.click(document.body)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('devolve o foco pro trigger ao fechar', async () => {
    render(<Setup />)
    const trigger = screen.getByText('Abrir')

    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')

    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('no modo controlado, só avisa via onOpenChange', async () => {
    const onOpenChange = vi.fn()
    render(<Setup open={false} onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByText('Abrir'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('não renderiza overlay quando modal é false', () => {
    const { container } = render(<Setup defaultOpen modal={false} />)
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal')
    expect(container.querySelector('[data-state][aria-hidden]')).not.toBeInTheDocument()
  })

  it('lança erro se uma parte for usada fora do Root', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Dialog.Title>Solto</Dialog.Title>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { baseElement } = render(<Setup defaultOpen />)
    // baseElement e não container: o conteúdo vive no portal, fora do container
    expect(baseElement).toMatchSnapshot()
  })
})
```

---

## 15. Próximo componente natural: AlertDialog

Com o Dialog pronto, o `AlertDialog` é barato — mesma estrutura, com quatro diferenças:

1. `role="alertdialog"` em vez de `dialog`
2. `disableOutsideClose` sempre ligado (confirmação destrutiva não deve sumir por clique acidental)
3. `Escape` também desligado, pelo mesmo motivo
4. Partes `Action` e `Cancel` em vez de `Close` genérico, com o foco inicial no **Cancel** — o botão seguro, não o destrutivo

Vale um `idris-componente-alert-dialog.md` próprio (a API pública é diferente), mas reusando as partes internas do Dialog em vez de duplicá-las.
