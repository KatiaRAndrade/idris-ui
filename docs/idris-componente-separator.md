# Idris — Componente: Separator

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato dos demais `idris-componente-*.md`.

---

## 1. Root implícito, sem `parts/`

Sequência de decisão da seção 8 de `idris-estrutura-componentes.md`:

1. **Elemento DOM único, sem portal/posicionamento?** Sim, um `<div>` de uma linha. → root implícito.
2. **Quais partes variam?** Nenhuma — um separador não tem conteúdo. → **sem `parts/`**, sem `.context.ts`, igual a `Heading`/`Text` (ver seção 1 de [`idris-componente-typography.md`](./idris-componente-typography.md)).

É o componente mais simples do sistema. O motivo de ele existir mesmo assim está na próxima seção.

## 2. Por que não é só uma `<div className="border-t">`

Duas coisas que uma div solta não resolve:

**Semântica.** Um separador que divide seções de conteúdo é informação: `role="separator"` faz o leitor de tela anunciar a quebra. Um separador que é só respiro visual (uma linha entre dois botões numa toolbar) é ruído: precisa sair da árvore de acessibilidade. A prop `decorative` é o que decide entre os dois, e é a razão principal do componente existir.

**Consistência.** Hoje o `Card.Footer` desenha o próprio separador com `border-t border-white/10` inline. Toda vez que alguém precisa de uma linha, reescreve esse par de classes — e uma hora escreve `white/20` sem querer. Centralizar num componente é o princípio 1 da seção 1 de `design-system-fundacao.md` aplicado ao caso mais banal possível.

> **Nota de refatoração:** depois que o Separator existir, `Card.Footer` pode consumi-lo em vez de desenhar a borda na mão. Não é obrigatório (o footer precisa da borda colada no padding, o que é mais direto com `border-t`), mas vale registrar a duplicação pra decidir conscientemente.

## 3. Props

| Prop | Valores | Default | Papel |
|---|---|---|---|
| `orientation` | `horizontal` · `vertical` | `horizontal` | Direção da linha |
| `decorative` | `boolean` | `false` | `true` = puramente visual, sai da árvore de acessibilidade |

Sem `size` e sem variantes de cor. Espessura é sempre `border-thin` (1px) — um separador "grosso" ou colorido já não é um separador, é uma decoração, e deve ser feito com classe direta em vez de virar variante aqui.

| Atributo | Valores |
|---|---|
| `data-orientation` | `horizontal` · `vertical` |

## 4. `decorative` e a árvore de acessibilidade

| `decorative` | `role` | Efeito |
|---|---|---|
| `false` (padrão) | `separator` + `aria-orientation` | Anunciado como divisor de seções |
| `true` | `none` + `aria-hidden` | Invisível pro leitor de tela |

O padrão é `false` porque o caso mais comum é dividir conteúdo de verdade — e errar pro lado de "anunciar demais" é menos grave que esconder uma quebra estrutural real de quem navega por leitor de tela.

**Detalhe do ARIA:** `aria-orientation` só é declarado quando `decorative` é `false`. O valor padrão implícito de `aria-orientation` num `role="separator"` já é `horizontal`, mas declarar explicitamente evita depender de default de spec.

## 5. Tokens usados

`border-thin` (1px) e a mesma borda sutil de 10% branco que Card, Input e Badge já usam pra elevação (seção 2.4 de `design-system-fundacao.md`). Nenhum token novo.

---

## 6. Estrutura de pastas

```
src/components/Separator/
├── Separator.tsx
├── Separator.styles.ts
├── Separator.stories.tsx
├── index.ts
└── specs/
    ├── Separator.test.tsx
    └── __snapshots__/
```

Sem `parts/` e sem `.context.ts` — não há partes nem estado compartilhado.

---

## 7. Código

**`Separator.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const separator = tv({
  base: 'shrink-0 bg-white/10',
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
})
```

> Usa `bg-white/10` + `h-px` em vez de `border-t`. A diferença importa: `border` some quando o elemento tem `height: 0` em alguns contextos de flex, e a versão vertical exigiria `border-l` — duas classes diferentes pra mesma ideia. Como fundo de um elemento de 1px, as duas orientações são a mesma técnica, só trocando qual eixo é `px`.

**`Separator.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { separator } from './Separator.styles'

export type SeparatorOrientation = 'horizontal' | 'vertical'

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: SeparatorOrientation
  /** Puramente visual — sai da árvore de acessibilidade. */
  decorative?: boolean
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        // aria-orientation só faz sentido num separator de verdade
        aria-orientation={decorative ? undefined : orientation}
        aria-hidden={decorative || undefined}
        data-orientation={orientation}
        className={separator({ orientation, className })}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'
```

**`index.ts`**:

```ts
export { Separator } from './Separator'
export type { SeparatorProps, SeparatorOrientation } from './Separator'
```

Sem `Object.assign`: não há partes pra pendurar. É um export direto, igual a `Heading`/`Text`.

---

## 8. Uso

```jsx
// Dividindo seções de conteúdo — semântico, o padrão
<section>
  <Heading size="h3">Perfil</Heading>
  <Text>Seus dados pessoais.</Text>
</section>

<Separator className="my-6" />

<section>
  <Heading size="h3">Segurança</Heading>
</section>

// Divisor entre ações numa toolbar — decorativo, não é informação
<div className="flex h-8 items-center gap-3">
  <Button variant="ghost" size="sm"><Button.Label>Copiar</Button.Label></Button>
  <Separator orientation="vertical" decorative />
  <Button variant="ghost" size="sm"><Button.Label>Colar</Button.Label></Button>
</div>

// Dentro de um Card, separando conteúdo do rodapé
<Card>
  <Card.Content>Conteúdo</Card.Content>
  <Separator />
  <Card.Content>Mais conteúdo</Card.Content>
</Card>
```

> **Cuidado com o vertical:** `h-full` só funciona se o pai tiver altura definida (num `flex` com `items-center`, por exemplo, ou com `h-8` explícito como no exemplo da toolbar). Num pai sem altura, a linha vertical some — é o erro mais comum com esse componente, e vale um comentário na story.

---

## 9. Acessibilidade

- `role="separator"` sem `tabIndex` — o separador do Idris é **estático**. A spec do ARIA permite um separator focável e ajustável (divisor arrastável de painéis), mas isso é outro componente (`Splitter`/`Resizable`), não uma variação deste
- `aria-orientation` explícito quando semântico
- `role="none"` + `aria-hidden` quando decorativo — os dois juntos, porque `role="none"` sozinho remove a semântica mas mantém o nó acessível

---

## 10. Teste (`specs/Separator.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Separator } from '../index'

describe('Separator', () => {
  it('é anunciado como separator por padrão', () => {
    render(<Separator />)
    const el = screen.getByRole('separator')
    expect(el).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('sai da árvore de acessibilidade quando decorative', () => {
    const { container } = render(<Separator decorative />)
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('aplica a orientação vertical', () => {
    render(<Separator orientation="vertical" />)
    const el = screen.getByRole('separator')
    expect(el).toHaveAttribute('data-orientation', 'vertical')
    expect(el).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('aceita className extra sem perder as classes base', () => {
    render(<Separator className="my-6" />)
    expect(screen.getByRole('separator')).toHaveClass('my-6')
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(<Separator />)
    expect(container).toMatchSnapshot()
  })
})
```
