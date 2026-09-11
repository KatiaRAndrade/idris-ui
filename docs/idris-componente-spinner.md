# Idris — Componente: Spinner

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato dos demais `idris-componente-*.md`. Fase 1 do [`idris-roadmap-componentes.md`](./idris-roadmap-componentes.md) — **extração**, não componente novo.

---

## 1. Root implícito, sem `parts/`

Elemento único (`<span>`), sem partes, sem contexto — componente-folha como Separator e Label.

## 2. Por que extrair agora

O spinner já existe, escondido dentro do `Button.tsx`:

```tsx
{loading && (
  <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  </span>
)}
```

Funciona, e quando o Button era o único componente com estado de carregamento isso estava certo — extrair antes de ter o segundo caso seria abstração prematura.

Os segundos casos chegaram: **Dialog** (botão de confirmar durante requisição), **Toast** (estado "enviando"), e mais à frente **Select** (carregando opções de forma assíncrona) e qualquer botão de formulário. Sem extrair, o mesmo par de classes seria copiado quatro vezes — e a terceira cópia escreveria `border-t-transparent` no lugar errado, produzindo um círculo que gira sem parecer girar.

O tamanho fixo `h-4 w-4` também é limitação: no `Button size="lg"` o spinner atual fica pequeno demais em relação ao texto.

## 3. Tamanhos

`sm` (12px) · `md` (16px) · `lg` (20px) · `xl` (32px)

Os três primeiros pareiam com os tamanhos de Button (o `md` é exatamente o `h-4 w-4` de hoje, então o retrofit não muda nada visualmente). O `xl` é pro caso que não existe hoje mas vai existir: carregamento de página ou de seção inteira, onde o spinner é o único elemento na tela.

A espessura do traço acompanha: `border-2` até `lg`, `border-[3px]` no `xl` — um traço de 2px num círculo de 32px fica anêmico.

## 4. Cor: `currentColor`, sempre

Nenhuma variante de cor. O spinner herda a cor do texto do contexto onde está — dentro de um Button `primary` ele é bege, dentro de um `ghost` ele é bege também, dentro de um card ele é `text-secondary` se o pai for.

É o mesmo raciocínio do `Button.Icon`, que se dimensiona pelo contexto em vez de receber prop. Um `<Spinner color="brand" />` dentro de um botão teal seria invisível, e ninguém que escreve isso percebe até ver em produção.

## 5. A decisão de acessibilidade

Um spinner pode ser duas coisas completamente diferentes, e a diferença importa pra quem usa leitor de tela:

**Decoração.** Dentro de um Button que já tem `aria-busy="true"`. O botão inteiro é anunciado como ocupado — se o spinner também se anunciasse, a pessoa ouviria a mesma informação duas vezes.

**Informação.** Sozinho no meio de uma seção que está carregando. Se não se anunciar, a região fica em silêncio: nada indica que algo está acontecendo.

A prop `label` decide entre as duas:

| `label` | Resultado |
|---|---|
| ausente (padrão) | `aria-hidden` — decoração |
| informado | `role="status"` + o texto em `VisuallyHidden` |

O padrão é decoração porque o caso mais comum é dentro de um controle que já comunica o estado. Quem precisa da versão que fala precisa dizer o que ela fala — o que é bom, porque "Carregando" e "Salvando alterações" não são a mesma mensagem.

## 6. Movimento reduzido

`prefers-reduced-motion` normalmente significa "não anime". Mas um spinner que não gira não comunica nada — ele deixa de ser spinner e vira um círculo quebrado na tela.

A saída é **desacelerar em vez de parar**: a rotação continua, com duração bem maior. Mantém a informação ("algo está acontecendo") e remove o que incomoda em movimento reduzido (a rotação rápida e repetitiva).

```
animate-spin                      → 1s por volta
motion-reduce:[animation-duration:2.5s]  → 2.5s por volta
```

## 7. Tokens usados

Nenhum token de cor (usa `currentColor`), `radius-full`, `border-thick` (2px). Nenhum token novo.

---

## 8. Estrutura de pastas

```
src/components/Spinner/
├── Spinner.tsx
├── Spinner.styles.ts
├── Spinner.stories.tsx
├── index.ts
└── specs/
    ├── Spinner.test.tsx
    └── __snapshots__/
```

---

## 9. Código

**`Spinner.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const spinner = tv({
  base: [
    'inline-block shrink-0 rounded-full',
    // A borda toda em currentColor menos o topo, que fica transparente:
    // é o "buraco" girando que dá a leitura de progresso
    'border-current border-t-transparent',
    'animate-spin',
    // Movimento reduzido desacelera, não para — ver seção 6
    'motion-reduce:[animation-duration:2.5s]',
  ],
  variants: {
    size: {
      sm: 'h-3 w-3 border-2',
      md: 'h-4 w-4 border-2',
      lg: 'h-5 w-5 border-2',
      xl: 'h-8 w-8 border-[3px]',
    },
  },
  defaultVariants: { size: 'md' },
})
```

**`Spinner.tsx`**:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { spinner } from './Spinner.styles'

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize
  /**
   * Texto anunciado por leitores de tela. Sem ele, o spinner é decoração
   * (`aria-hidden`) — o padrão, porque normalmente o controle em volta
   * já comunica o estado via `aria-busy`.
   */
  label?: string
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size = 'md', label, ...props }, ref) => {
    const circle = (
      <span
        ref={label ? undefined : ref}
        aria-hidden
        data-size={size}
        className={spinner({ size, className })}
        {...(label ? {} : props)}
      />
    )

    if (!label) return circle

    return (
      <span ref={ref} role="status" {...props}>
        {circle}
        <VisuallyHidden>{label}</VisuallyHidden>
      </span>
    )
  }
)

Spinner.displayName = 'Spinner'
```

> **Por que dois caminhos em vez de condicionar atributos num elemento só:** o `role="status"` precisa envolver o texto escondido pra que a região viva seja anunciada como uma coisa. Colocar `role="status"` no próprio círculo e o texto ao lado funciona em alguns leitores e falha em outros. Um wrapper explícito é previsível.

**`index.ts`**:

```ts
export { Spinner } from './Spinner'
export type { SpinnerProps, SpinnerSize } from './Spinner'
```

---

## 10. Retrofit do Button

O spinner do Button vira uma chamada ao componente. O tamanho passa a acompanhar o `size` do botão — correção de um problema real, não só reorganização.

**`Button.tsx`** — trocar o bloco inline:

```tsx
// antes
{loading && (
  <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  </span>
)}

// depois
{loading && (
  <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
    <Spinner size={SPINNER_SIZE[size]} />
  </span>
)}
```

Com o mapa junto das constantes do componente:

```tsx
const SPINNER_SIZE: Record<ButtonSize, SpinnerSize> = { sm: 'sm', md: 'md', lg: 'lg' }
```

**Sem `label`**, de propósito: o botão já tem `aria-busy="true"` e o `data-loading` que esconde o texto. Adicionar `role="status"` aqui faria o leitor anunciar duas vezes.

**O que muda visualmente:** `Button size="sm"` ganha um spinner de 12px (era 16px) e `size="lg"` ganha um de 20px. Os snapshots do Button vão precisar de `npm run test -- -u`, e essa é a única alteração esperada — se algum outro snapshot mudar, algo saiu errado.

**Os testes do Button continuam valendo sem alteração** — nenhum deles verifica o spinner, só `aria-busy` e `disabled`.

---

## 11. Uso

```jsx
// Decoração — dentro de algo que já comunica o estado
<Button loading><Button.Label>Salvar</Button.Label></Button>

// Informação — sozinho, carregando uma seção
<div className="flex items-center justify-center p-8">
  <Spinner size="xl" label="Carregando pedidos" />
</div>

// Ao lado de um texto que já explica — volta a ser decoração
<div className="flex items-center gap-2">
  <Spinner size="sm" />
  <Text size="body-sm" color="secondary">Sincronizando…</Text>
</div>

// Herdando a cor do contexto
<div className="text-text-secondary">
  <Spinner />  {/* bege dessaturado, sem prop de cor */}
</div>
```

---

## 12. Acessibilidade

- Sem `label`: `aria-hidden`. É a escolha certa dentro de Button, Dialog e qualquer controle com `aria-busy`
- Com `label`: `role="status"` (região viva educada — espera a pessoa terminar o que está ouvindo, ao contrário de `role="alert"`)
- Movimento reduzido desacelera em vez de parar (seção 6)
- **Um spinner nunca é o único indicador de estado num controle interativo.** O Button desabilita e marca `aria-busy`; o spinner é a camada visual disso. Se um dia algum componente usar só o spinner pra comunicar carregamento, é o componente que está errado

---

## 13. Teste (`specs/Spinner.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from '../index'

describe('Spinner', () => {
  it('é decoração por padrão', () => {
    const { container } = render(<Spinner />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('vira região viva quando recebe label', () => {
    render(<Spinner label="Carregando pedidos" />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Carregando pedidos')).toBeInTheDocument()
  })

  it('aplica o data-size', () => {
    const { container } = render(<Spinner size="xl" />)
    expect(container.querySelector('[data-size="xl"]')).toBeInTheDocument()
  })

  it('encaminha a ref pro wrapper quando há label', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<Spinner label="Carregando" ref={ref} />)

    expect(ref.current).toHaveAttribute('role', 'status')
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(<Spinner size="md" />)
    expect(container).toMatchSnapshot()
  })
})
```

---

## 14. Checklist

- [ ] `Spinner` criado, 5 testes passando
- [ ] `Button.tsx` consumindo o Spinner, com o mapa `SPINNER_SIZE`
- [ ] Snapshots do Button atualizados (`npm run test -- -u`) — e conferir que **só** os do Button mudaram
- [ ] Testes do Button passando sem alteração
- [ ] Seção 4.1 de `design-system-fundacao.md`: a linha do estado `loading` menciona "ícone de spinner" — atualizar pra apontar o componente
