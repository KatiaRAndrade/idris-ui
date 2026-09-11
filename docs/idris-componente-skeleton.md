# Idris — Componente: Skeleton

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato dos demais `idris-componente-*.md`. Fase 1 do [`idris-roadmap-componentes.md`](./idris-roadmap-componentes.md).

---

## 1. Root implícito, sem `parts/`

Elemento único (`<div>`), sem partes, sem contexto — componente-folha como Separator, Label e Spinner.

## 2. Skeleton ou Spinner?

Os dois comunicam carregamento, e escolher errado é comum. O critério:

| | Spinner | Skeleton |
|---|---|---|
| Você sabe o formato do que vem? | Não | Sim |
| A espera é longa? | Indiferente | Sim, ajuda mais |
| O layout vai mudar quando carregar? | Sim, o spinner some e o conteúdo entra | Não, o skeleton tem o tamanho do conteúdo |

O ganho real do skeleton não é estético — é **não deslocar o layout**. Um spinner de 16px que vira um card de 200px empurra tudo abaixo dele quando os dados chegam. Um skeleton com as dimensões do card já reserva o espaço.

Regra prática: se você consegue desenhar o esqueleto, use Skeleton. Se não consegue (porque o resultado pode ser uma lista, um erro ou nada), use Spinner.

## 3. Variantes de forma

`text` · `circle` · `rect`

Não são só três valores de `border-radius` — cada uma tem comportamento próprio:

| Forma | Radius | Dimensão padrão | Uso |
|---|---|---|---|
| `text` | `radius-sm` | altura de uma linha (`1em`), largura 100% | Linhas de texto |
| `circle` | `radius-full` | quadrado (aspect-square) | Avatar, ícone |
| `rect` | `radius-md` | nenhuma — quem usa define | Imagem, card, bloco |

A `text` tem um detalhe: a altura é `1em`, então ela acompanha o tamanho da fonte do contexto. Um skeleton de linha dentro de um `<Heading>` fica alto; dentro de um `<Text size="body-sm">` fica baixo. Sem isso, você teria que passar altura em toda ocorrência.

## 4. A animação: pulso, não brilho

Duas técnicas comuns:

**Pulso** — a opacidade oscila. Uma propriedade animada, composta pela GPU, funciona em qualquer fundo.

**Brilho (shimmer)** — um gradiente claro atravessa o elemento. Mais elaborado, e o efeito clássico depende de um gradiente branco semitransparente passando sobre cinza claro.

**Escolhi pulso**, e o motivo é a paleta. O Idris é dark por padrão, com `surface-elevated` em `#2A2521` sobre um `background` `#171310`. Um shimmer branco sobre esse fundo escuro ou fica invisível (se for sutil) ou parece um flash (se for forte) — e teria que ser calibrado separadamente pro light mode, virando duas animações pra manter.

O pulso funciona igual nos dois temas, porque o que oscila é a opacidade de um token que já muda com o tema.

Com `prefers-reduced-motion`, o pulso **para completamente** — diferente do Spinner. Aqui a forma e a posição já comunicam "conteúdo vindo"; a animação é reforço, não informação.

## 5. Acessibilidade: o skeleton é sempre invisível pro leitor de tela

Um skeleton é forma sem conteúdo. Anunciar "grupo, grupo, grupo" enquanto a página carrega é ruído puro. Por isso o componente é **sempre** `aria-hidden`, sem prop pra mudar isso.

Quem comunica o carregamento é o container:

```jsx
<div aria-busy="true" aria-live="polite">
  {carregando ? <SkeletonDoCard /> : <Card>…</Card>}
</div>
```

Isso é responsabilidade de quem usa, não do componente — o skeleton não sabe qual região ele representa. Vale um aviso na story e na doc, porque é o erro mais comum: encher a tela de skeletons e deixar quem usa leitor de tela sem nenhuma indicação de que algo está acontecendo.

## 6. Tokens usados

`surface-elevated` (a mesma superfície de elementos flutuantes — funciona nos dois temas), `radius-sm`/`radius-md`/`radius-full`, `duration-slow` como base do ciclo de pulso. Nenhum token novo.

---

## 7. Estrutura de pastas

```
src/components/Skeleton/
├── Skeleton.tsx
├── Skeleton.styles.ts
├── Skeleton.stories.tsx
├── index.ts
└── specs/
    ├── Skeleton.test.tsx
    └── __snapshots__/
```

---

## 8. Código

**`Skeleton.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const skeleton = tv({
  base: [
    'bg-surface-elevated',
    'animate-pulse',
    // Aqui a animação PARA em movimento reduzido — a forma já comunica.
    // Diferente do Spinner, onde parar destruiria a informação.
    'motion-reduce:animate-none',
  ],
  variants: {
    shape: {
      // h-[1em] acompanha o tamanho de fonte do contexto
      text: 'h-[1em] w-full rounded-sm',
      circle: 'aspect-square rounded-full',
      rect: 'rounded-md',
    },
  },
  defaultVariants: { shape: 'text' },
})
```

**`Skeleton.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { skeleton } from './Skeleton.styles'

export type SkeletonShape = 'text' | 'circle' | 'rect'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shape = 'text', ...props }, ref) => {
    return (
      <div
        ref={ref}
        // Sempre escondido do leitor de tela — ver seção 5.
        // Quem anuncia o carregamento é o container, com aria-busy.
        aria-hidden
        data-shape={shape}
        className={skeleton({ shape, className })}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'
```

**`index.ts`**:

```ts
export { Skeleton } from './Skeleton'
export type { SkeletonProps, SkeletonShape } from './Skeleton'
```

---

## 9. Por que não tem prop `lines`

A tentação é `<Skeleton shape="text" lines={3} />`. Rejeitado pelo mesmo argumento da seção 1 de `idris-estrutura-componentes.md`, que fez o Button ser composto em vez de receber props:

```jsx
// Com prop, a próxima necessidade é sempre uma prop nova:
<Skeleton lines={3} lastLineWidth="60%" gap="tight" />

// Composto, tudo isso já existe de graça:
<div className="flex flex-col gap-2">
  <Skeleton />
  <Skeleton />
  <Skeleton className="w-3/5" />
</div>
```

Três linhas de JSX contra uma prop que cresce sem parar. E a versão composta deixa visível o que está sendo simulado.

---

## 10. Uso

```jsx
// Linhas de texto — a última mais curta, como texto real
<div className="flex flex-col gap-2">
  <Skeleton />
  <Skeleton />
  <Skeleton className="w-3/5" />
</div>

// Esqueleto de um card, espelhando o layout real
<Card aria-busy="true">
  <Card.Header>
    <Skeleton shape="rect" className="h-6 w-40" />
    <Skeleton className="w-2/3" />
  </Card.Header>
  <Card.Content>
    <Skeleton shape="rect" className="h-32 w-full" />
  </Card.Content>
</Card>

// Linha de lista com avatar
<div className="flex items-center gap-3">
  <Skeleton shape="circle" className="h-10" />
  <div className="flex flex-1 flex-col gap-1.5">
    <Skeleton className="w-1/3" />
    <Skeleton className="w-1/2" />
  </div>
</div>

// A forma text acompanha a fonte do contexto
<div className="text-2xl">
  <Skeleton />  {/* alto, do tamanho de um título */}
</div>

// Container comunicando o estado — responsabilidade de quem usa
<section aria-busy={carregando} aria-live="polite">
  {carregando ? <EsqueletoDaLista /> : <Lista itens={itens} />}
</section>
```

---

## 11. Acessibilidade

- Sempre `aria-hidden`, sem exceção configurável (seção 5)
- Quem anuncia é o container, com `aria-busy` e `aria-live="polite"`
- A animação para em `prefers-reduced-motion` — forma e posição já comunicam
- **Contraste não se aplica:** o skeleton não tem texto nem função interativa. O que importa é ele ser distinguível do fundo, e `surface-elevated` sobre `background` já cumpre isso nos dois temas

---

## 12. Teste (`specs/Skeleton.test.tsx`)

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from '../index'

describe('Skeleton', () => {
  it('é sempre escondido do leitor de tela', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('ignora aria-hidden false vindo de fora', () => {
    // @ts-expect-error -- passar aria-hidden é justamente o que não deve funcionar
    const { container } = render(<Skeleton aria-hidden={false} />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('usa a forma text por padrão', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('data-shape', 'text')
  })

  it('aplica a forma circle', () => {
    const { container } = render(<Skeleton shape="circle" />)
    expect(container.firstChild).toHaveAttribute('data-shape', 'circle')
    expect(container.firstChild).toHaveClass('rounded-full')
  })

  it('aceita className extra sem perder as classes base', () => {
    const { container } = render(<Skeleton className="w-3/5" />)
    expect(container.firstChild).toHaveClass('w-3/5')
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(<Skeleton shape="rect" className="h-32" />)
    expect(container).toMatchSnapshot()
  })
})
```

> O segundo teste depende da ordem das props no componente: `aria-hidden` aparece **antes** do spread de `...props`, então tecnicamente um `aria-hidden={false}` de fora sobrescreveria. Se o teste falhar, mova o `aria-hidden` pra depois do spread — é o comportamento que a seção 5 exige.
