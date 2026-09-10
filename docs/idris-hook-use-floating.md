# Idris — Hook: `useFloating` (posicionamento flutuante)

> Infraestrutura P2 do [`idris-roadmap-componentes.md`](./idris-roadmap-componentes.md). Implementação **própria**, sem dependência externa — decisão registrada em [`idris-decisao-posicionamento.md`](./idris-decisao-posicionamento.md), Opção A.
>
> Destrava: Popover · HoverCard · Select · DropdownMenu · ContextMenu · Menubar · NavigationMenu + o retrofit de collision detection do Tooltip.

---

## 1. A decisão de arquitetura que muda tudo: geometria pura

A tentação é escrever um hook que lê o DOM, calcula e aplica estilo — tudo junto. É o caminho mais curto e o mais difícil de testar, porque o jsdom não calcula layout: `getBoundingClientRect()` devolve zeros, e nenhuma asserção sobre posição significa nada.

A saída é separar em duas camadas:

| Camada | Arquivo | O que faz | Testável? |
|---|---|---|---|
| **Geometria** | `computePosition.ts` | Função pura: recebe retângulos e opções, devolve coordenadas | ✅ Totalmente |
| **DOM** | `useFloating.ts` | Lê os rects, chama a função, aplica estilo, escuta scroll/resize | Parcialmente |

Toda a lógica difícil — flip, shift, alinhamento, posição da seta — vive na camada pura. Ela não conhece React nem DOM: entra `{ x, y, width, height }`, sai `{ x, y, side, align }`. Isso significa que **flip e shift são testáveis com retângulos falsos**, sem navegador.

Essa é a principal vantagem prática de escrever do zero em vez de adotar biblioteca: a matemática é sua, então ela pode ser desenhada pra ser testável. O que sobra pra validação manual no Storybook é só a camada fina de DOM.

## 2. Escopo da v1

**Dentro:**

| Recurso | O que faz |
|---|---|
| `side` / `align` | Posição preferida e alinhamento no eixo cruzado |
| `offset` | Distância entre gatilho e conteúdo |
| **Flip** | Vira pro lado oposto quando não cabe |
| **Shift** | Desliza no eixo cruzado pra caber na viewport |
| **Arrow** | Seta apontando pro gatilho, presa dentro do conteúdo |
| **constrainSize** | Devolve altura/largura disponível, pra lista longa rolar internamente |
| Rastreamento | Recalcula em scroll e resize enquanto aberto |

**Fora (limites conhecidos, documentados):**

1. **Recorte por containers roláveis.** Só a viewport é considerada como fronteira. Um gatilho dentro de um `div` com `overflow: auto` pode ter o conteúdo posicionado sobre a borda desse container. Na prática raro, porque o conteúdo flutuante vive num Portal no `<body>` — mas é real.
2. **Ancoragem em ponto do mouse** (ContextMenu, Fase 5). A API recebe um elemento, não coordenadas. Suportar isso é aceitar um `Rect` sintético de tamanho zero — pequena adição futura.
3. **Posicionamento de submenu** (engine de menu, P4). Submenu tem regras próprias: preferir o mesmo lado do menu pai, alinhar pelo item.
4. **Ancestral com `transform`.** Ver seção 8.

---

## 3. Por que `position: fixed`

O conteúdo flutuante é posicionado com `position: fixed` e coordenadas de viewport, não `absolute` com coordenadas de documento.

Com `absolute`, as coordenadas são relativas ao *offset parent* mais próximo — que pode ser qualquer ancestral com `position: relative`. Descobrir qual é, e converter as coordenadas, é uma fonte de bug constante, especialmente dentro de containers roláveis aninhados.

Com `fixed`, a referência é sempre a viewport — que é exatamente o que `getBoundingClientRect()` já devolve. A conta fica direta: pega o rect do gatilho, calcula, aplica. O custo é ter que recalcular quando a página rola (o gatilho se move em relação à viewport), e é por isso que o rastreamento de scroll da seção 6 existe.

---

## 4. Estrutura de pastas

```
src/hooks/useFloating/
├── computePosition.ts      # geometria pura — nenhum import de react ou dom
├── index.ts                 # o hook
└── specs/
    └── computePosition.test.ts
```

Primeira pasta dentro de `hooks/` (os outros são arquivos soltos). Justificado: são dois arquivos com papéis distintos, e a separação é a decisão de arquitetura da seção 1 — deixá-la visível na estrutura tem valor.

Interno, não exportado no barrel público.

---

## 5. Código — geometria pura

**`src/hooks/useFloating/computePosition.ts`**:

```ts
export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface ComputePositionParams {
  anchor: Rect
  floating: Rect
  viewport: { width: number; height: number }
  side?: Side
  align?: Align
  offset?: number
  flip?: boolean
  shift?: boolean
  /** Respiro mínimo até a borda da viewport. */
  padding?: number
  /** Quando informado, calcula a posição da seta. */
  arrow?: { size: number; padding: number }
  /** Calcula o espaço disponível no eixo principal. */
  constrainSize?: boolean
}

export interface ComputePositionResult {
  x: number
  y: number
  /** Lado REAL depois do flip — vira data-side no componente. */
  side: Side
  align: Align
  /** Deslocamento da seta no eixo cruzado, em px, relativo ao flutuante. */
  arrow?: { x?: number; y?: number }
  /** Espaço disponível — só quando constrainSize. */
  available?: { width: number; height: number }
}

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

const isVertical = (side: Side) => side === 'top' || side === 'bottom'

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max))

/** Posição bruta pro lado/alinhamento pedidos, sem considerar bordas. */
function place(anchor: Rect, floating: Rect, side: Side, align: Align, offset: number) {
  if (isVertical(side)) {
    const y =
      side === 'bottom'
        ? anchor.y + anchor.height + offset
        : anchor.y - floating.height - offset

    const x =
      align === 'start'
        ? anchor.x
        : align === 'end'
          ? anchor.x + anchor.width - floating.width
          : anchor.x + anchor.width / 2 - floating.width / 2

    return { x, y }
  }

  const x =
    side === 'right' ? anchor.x + anchor.width + offset : anchor.x - floating.width - offset

  const y =
    align === 'start'
      ? anchor.y
      : align === 'end'
        ? anchor.y + anchor.height - floating.height
        : anchor.y + anchor.height / 2 - floating.height / 2

  return { x, y }
}

/** Quanto o flutuante estoura a viewport no eixo principal do lado escolhido. */
function mainAxisOverflow(
  pos: { x: number; y: number },
  floating: Rect,
  viewport: { width: number; height: number },
  side: Side,
  padding: number
): number {
  switch (side) {
    case 'top':
      return padding - pos.y
    case 'bottom':
      return pos.y + floating.height - (viewport.height - padding)
    case 'left':
      return padding - pos.x
    case 'right':
      return pos.x + floating.width - (viewport.width - padding)
  }
}

/** Espaço livre entre o gatilho e a borda da viewport, num dado lado. */
function availableSpace(
  anchor: Rect,
  viewport: { width: number; height: number },
  side: Side,
  offset: number,
  padding: number
): number {
  switch (side) {
    case 'top':
      return anchor.y - offset - padding
    case 'bottom':
      return viewport.height - (anchor.y + anchor.height) - offset - padding
    case 'left':
      return anchor.x - offset - padding
    case 'right':
      return viewport.width - (anchor.x + anchor.width) - offset - padding
  }
}

export function computePosition({
  anchor,
  floating,
  viewport,
  side: preferredSide = 'bottom',
  align = 'center',
  offset = 8,
  flip = true,
  shift = true,
  padding = 8,
  arrow,
  constrainSize = false,
}: ComputePositionParams): ComputePositionResult {
  let side = preferredSide
  let pos = place(anchor, floating, side, align, offset)

  // ── Flip ──────────────────────────────────────────────────────────
  // Só vira se o lado oposto estourar MENOS. Sem essa comparação,
  // um flutuante maior que a viewport ficaria alternando entre os dois lados.
  if (flip) {
    const overflow = mainAxisOverflow(pos, floating, viewport, side, padding)

    if (overflow > 0) {
      const opposite = OPPOSITE[side]
      const oppositePos = place(anchor, floating, opposite, align, offset)
      const oppositeOverflow = mainAxisOverflow(oppositePos, floating, viewport, opposite, padding)

      if (oppositeOverflow < overflow) {
        side = opposite
        pos = oppositePos
      }
    }
  }

  // ── Shift ─────────────────────────────────────────────────────────
  // Desliza no eixo cruzado pra caber. Se o flutuante for maior que a
  // viewport, o clamp encosta na borda inicial — melhor que centralizar
  // e estourar dos dois lados.
  if (shift) {
    if (isVertical(side)) {
      pos.x = clamp(pos.x, padding, viewport.width - padding - floating.width)
    } else {
      pos.y = clamp(pos.y, padding, viewport.height - padding - floating.height)
    }
  }

  const result: ComputePositionResult = { x: pos.x, y: pos.y, side, align }

  // ── Seta ──────────────────────────────────────────────────────────
  // Aponta pro centro do gatilho, mas presa dentro do flutuante com um
  // respiro nos cantos — senão ela vaza no canto arredondado.
  if (arrow) {
    if (isVertical(side)) {
      const anchorCenter = anchor.x + anchor.width / 2
      const raw = anchorCenter - pos.x - arrow.size / 2
      result.arrow = {
        x: clamp(raw, arrow.padding, floating.width - arrow.size - arrow.padding),
      }
    } else {
      const anchorCenter = anchor.y + anchor.height / 2
      const raw = anchorCenter - pos.y - arrow.size / 2
      result.arrow = {
        y: clamp(raw, arrow.padding, floating.height - arrow.size - arrow.padding),
      }
    }
  }

  // ── Tamanho disponível ────────────────────────────────────────────
  if (constrainSize) {
    const space = availableSpace(anchor, viewport, side, offset, padding)
    result.available = isVertical(side)
      ? { width: viewport.width - padding * 2, height: Math.max(space, 0) }
      : { width: Math.max(space, 0), height: viewport.height - padding * 2 }
  }

  return result
}
```

> **Detalhe do flip que quase todo mundo erra na primeira versão:** virar assim que houver qualquer estouro. Se o flutuante for mais alto que a viewport, ele estoura dos dois lados — e o código fica alternando a cada recálculo, produzindo tremulação. Comparar as duas magnitudes e só virar quando o oposto for melhor resolve isso em três linhas.

---

## 6. Código — camada React

**`src/hooks/useFloating/index.ts`**:

```ts
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { computePosition, type Align, type Side } from './computePosition'

export type { Side, Align } from './computePosition'

export interface UseFloatingOptions {
  side?: Side
  align?: Align
  /** Distância entre gatilho e conteúdo. Default: 8 (space-2) */
  offset?: number
  flip?: boolean
  shift?: boolean
  /** Respiro até a borda da viewport. Default: 8 */
  padding?: number
  /** Tamanho da seta em px. Só informe se houver seta. */
  arrowSize?: number
  /** Respiro da seta nos cantos. Default: 8 (evita vazar no radius) */
  arrowPadding?: number
  /** Expõe altura/largura disponível como CSS variables. Default: false */
  constrainSize?: boolean
  /** Recalcula em scroll e resize. Default: true */
  trackAnchor?: boolean
}

export interface UseFloatingResult {
  anchorRef: (node: HTMLElement | null) => void
  floatingRef: (node: HTMLElement | null) => void
  arrowRef: (node: HTMLElement | null) => void
  floatingStyles: React.CSSProperties
  arrowStyles: React.CSSProperties
  resolvedSide: Side
  resolvedAlign: Align
  /** False até a primeira medição — use pra esconder e evitar o "pulo". */
  isPositioned: boolean
}

export function useFloating(open: boolean, options: UseFloatingOptions = {}): UseFloatingResult {
  const {
    side = 'bottom',
    align = 'center',
    offset = 8,
    flip = true,
    shift = true,
    padding = 8,
    arrowSize,
    arrowPadding = 8,
    constrainSize = false,
    trackAnchor = true,
  } = options

  const anchorNode = useRef<HTMLElement | null>(null)
  const floatingNode = useRef<HTMLElement | null>(null)
  const arrowNode = useRef<HTMLElement | null>(null)

  const [state, setState] = useState({
    x: 0,
    y: 0,
    side,
    align,
    arrowX: undefined as number | undefined,
    arrowY: undefined as number | undefined,
    availableWidth: undefined as number | undefined,
    availableHeight: undefined as number | undefined,
    isPositioned: false,
  })

  const update = useCallback(() => {
    const anchor = anchorNode.current
    const floating = floatingNode.current
    if (!anchor || !floating) return

    const anchorRect = anchor.getBoundingClientRect()
    const floatingRect = floating.getBoundingClientRect()

    const result = computePosition({
      anchor: {
        x: anchorRect.x,
        y: anchorRect.y,
        width: anchorRect.width,
        height: anchorRect.height,
      },
      floating: { x: 0, y: 0, width: floatingRect.width, height: floatingRect.height },
      viewport: {
        // clientWidth do documento e não innerWidth: exclui a barra de rolagem
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      },
      side,
      align,
      offset,
      flip,
      shift,
      padding,
      arrow: arrowSize ? { size: arrowSize, padding: arrowPadding } : undefined,
      constrainSize,
    })

    // Arredonda pro pixel do dispositivo — sem isso, coordenadas fracionadas
    // deixam o texto borrado em telas sem retina
    const dpr = window.devicePixelRatio || 1
    const round = (n: number) => Math.round(n * dpr) / dpr

    setState({
      x: round(result.x),
      y: round(result.y),
      side: result.side,
      align: result.align,
      arrowX: result.arrow?.x,
      arrowY: result.arrow?.y,
      availableWidth: result.available?.width,
      availableHeight: result.available?.height,
      isPositioned: true,
    })
  }, [side, align, offset, flip, shift, padding, arrowSize, arrowPadding, constrainSize])

  // useLayoutEffect: posiciona antes do navegador pintar, senão o conteúdo
  // aparece no canto por um frame e "pula" pro lugar
  useLayoutEffect(() => {
    if (!open) {
      setState((prev) => ({ ...prev, isPositioned: false }))
      return
    }

    update()

    if (!trackAnchor) return

    // capture: true pega scroll de QUALQUER container, não só da janela.
    // passive: true avisa o navegador que não vamos chamar preventDefault.
    const onScrollOrResize = () => update()
    window.addEventListener('scroll', onScrollOrResize, { capture: true, passive: true })
    window.addEventListener('resize', onScrollOrResize, { passive: true })

    // O conteúdo pode mudar de tamanho depois de aberto (imagem carregou,
    // lista filtrou) e o gatilho pode mudar com o layout responsivo
    const observer = new ResizeObserver(() => update())
    if (anchorNode.current) observer.observe(anchorNode.current)
    if (floatingNode.current) observer.observe(floatingNode.current)

    return () => {
      window.removeEventListener('scroll', onScrollOrResize, { capture: true })
      window.removeEventListener('resize', onScrollOrResize)
      observer.disconnect()
    }
  }, [open, update, trackAnchor])

  const anchorRef = useCallback((node: HTMLElement | null) => {
    anchorNode.current = node
  }, [])

  const floatingRef = useCallback((node: HTMLElement | null) => {
    floatingNode.current = node
  }, [])

  const arrowRef = useCallback((node: HTMLElement | null) => {
    arrowNode.current = node
  }, [])

  const floatingStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    // translate3d em vez de top/left: o navegador promove a camada e
    // reposicionar durante o scroll não custa reflow
    transform: `translate3d(${state.x}px, ${state.y}px, 0)`,
    // Escondido até medir — evita o flash no canto superior esquerdo
    visibility: state.isPositioned ? 'visible' : 'hidden',
    ...(constrainSize && {
      '--idris-available-width': `${state.availableWidth}px`,
      '--idris-available-height': `${state.availableHeight}px`,
    }),
  } as React.CSSProperties

  const arrowStyles: React.CSSProperties = {
    position: 'absolute',
    ...(state.arrowX !== undefined && { left: `${state.arrowX}px` }),
    ...(state.arrowY !== undefined && { top: `${state.arrowY}px` }),
  }

  return {
    anchorRef,
    floatingRef,
    arrowRef,
    floatingStyles,
    arrowStyles,
    resolvedSide: state.side,
    resolvedAlign: state.align,
    isPositioned: state.isPositioned,
  }
}
```

---

## 7. O contrato com o `.styles.ts`

`resolvedSide` e `resolvedAlign` são o lado **real** depois do flip. Eles viram `data-side`/`data-align` no componente, e o estilo reage — nenhuma lógica condicional de className dentro do `.tsx`, princípio 2 da arquitetura preservado:

```ts
export const content = tv({
  base: [
    'z-50 rounded-md border border-white/10 bg-surface-elevated',
    'transition-opacity duration-fast',
    // A animação de entrada nasce do lado certo
    'data-[side=top]:origin-bottom',
    'data-[side=bottom]:origin-top',
    'data-[side=left]:origin-right',
    'data-[side=right]:origin-left',
    // Lista longa rola internamente em vez de estourar a tela
    'max-h-[var(--idris-available-height)] overflow-y-auto',
  ],
})

export const arrow = tv({
  base: [
    'h-2 w-2 rotate-45 bg-surface-elevated border border-white/10',
    // A seta encosta na borda oposta ao lado resolvido
    'data-[side=bottom]:-top-1 data-[side=bottom]:border-b-0 data-[side=bottom]:border-r-0',
    'data-[side=top]:-bottom-1 data-[side=top]:border-t-0 data-[side=top]:border-l-0',
    'data-[side=right]:-left-1 data-[side=right]:border-r-0 data-[side=right]:border-t-0',
    'data-[side=left]:-right-1 data-[side=left]:border-l-0 data-[side=left]:border-b-0',
  ],
})
```

---

## 8. Limite conhecido: ancestral com `transform`

`position: fixed` deixa de ser relativo à viewport quando algum ancestral tem `transform`, `filter`, `perspective`, `backdrop-filter` ou `will-change` nessas propriedades — esses valores criam um *containing block* novo, e o `fixed` passa a se posicionar em relação a ele. Toda a matemática, que assume coordenadas de viewport, sai errada.

**Na prática o Idris já está protegido:** todo conteúdo flutuante vive num `Portal` renderizado no `<body>`, então não tem ancestral nenhum além do body. O caso quebra se alguém passar `container` pro Portal apontando pra um elemento transformado.

**Registrado como limite, não corrigido.** Detectar isso exige subir a árvore lendo `getComputedStyle` de cada ancestral a cada recálculo — caro, e pra um caso que a arquitetura já evita. Se aparecer na prática, vale um aviso em dev em vez de tratamento automático.

---

## 9. Retrofit do Tooltip

Fecha a pendência da seção 3 de [`idris-componente-tooltip.md`](./idris-componente-tooltip.md). O que muda:

**`Tooltip.Root`** — deixa de ser `relative inline-flex` com o conteúdo posicionado por CSS. Passa a chamar o hook e repassar os refs pelo contexto:

```tsx
const floating = useFloating(open, { side, align, offset: 8, arrowSize: 8 })
```

O contexto ganha `floatingStyles`, `arrowStyles`, `anchorRef`, `floatingRef`, `arrowRef`, `resolvedSide`.

**`Tooltip.Trigger`** — recebe o `anchorRef`.

**`Tooltip.Content`** — aplica `floatingStyles` e `data-side={resolvedSide}`. As classes de posicionamento fixo (`absolute top-full left-1/2 -translate-x-1/2 mt-2`) saem do `.styles.ts`, porque quem posiciona agora é o hook.

**`Tooltip.Arrow`** — aplica `arrowStyles` e `data-side`.

**Novas props no `Root`:** `side` e `align`.

Os testes existentes continuam valendo — nenhum deles verifica posição (não daria pra verificar no jsdom), só comportamento de abrir/fechar.

> O Tooltip também passa a precisar de `Portal` pra escapar de `overflow: hidden`. Como o `Portal` já existe, é só envolver o `Content`. Isso muda a API pública — `Tooltip.Portal` vira uma parte nova. Vale decidir se entra agora ou junto com a v2 do Tooltip.

---

## 10. Testes

**`specs/computePosition.test.ts`** — a parte que importa, e que só existe porque a geometria é pura:

```ts
import { describe, expect, it } from 'vitest'
import { computePosition, type Rect } from '../computePosition'

const viewport = { width: 1000, height: 800 }
const floating: Rect = { x: 0, y: 0, width: 200, height: 100 }

/** Gatilho de 50×20 centralizado, por padrão. */
const anchorAt = (x: number, y: number): Rect => ({ x, y, width: 50, height: 20 })

describe('computePosition — posicionamento base', () => {
  it('posiciona abaixo e centralizado por padrão', () => {
    const r = computePosition({ anchor: anchorAt(475, 400), floating, viewport })

    expect(r.side).toBe('bottom')
    expect(r.y).toBe(428) // 400 + 20 + 8 de offset
    expect(r.x).toBe(400) // centro do gatilho (500) − metade do flutuante (100)
  })

  it('align start encosta o flutuante no início do gatilho', () => {
    const r = computePosition({ anchor: anchorAt(475, 400), floating, viewport, align: 'start' })
    expect(r.x).toBe(475)
  })

  it('align end encosta o flutuante no fim do gatilho', () => {
    const r = computePosition({ anchor: anchorAt(475, 400), floating, viewport, align: 'end' })
    expect(r.x).toBe(325) // 475 + 50 − 200
  })

  it('posiciona à direita quando side é right', () => {
    const r = computePosition({ anchor: anchorAt(400, 400), floating, viewport, side: 'right' })
    expect(r.x).toBe(458) // 400 + 50 + 8
    expect(r.y).toBe(360) // centro vertical
  })
})

describe('computePosition — flip', () => {
  it('vira pra cima quando não cabe embaixo', () => {
    const r = computePosition({ anchor: anchorAt(475, 750), floating, viewport })

    expect(r.side).toBe('top')
    expect(r.y).toBe(642) // 750 − 100 − 8
  })

  it('não vira quando cabe', () => {
    const r = computePosition({ anchor: anchorAt(475, 100), floating, viewport })
    expect(r.side).toBe('bottom')
  })

  it('não vira quando o lado oposto estoura mais', () => {
    // Flutuante mais alto que a viewport: estoura dos dois lados.
    // Deve ficar onde estava em vez de alternar.
    const gigante: Rect = { x: 0, y: 0, width: 200, height: 900 }
    const r = computePosition({ anchor: anchorAt(475, 400), floating: gigante, viewport })

    expect(r.side).toBe('bottom')
  })

  it('respeita flip: false', () => {
    const r = computePosition({ anchor: anchorAt(475, 750), floating, viewport, flip: false })
    expect(r.side).toBe('bottom')
  })
})

describe('computePosition — shift', () => {
  it('desliza pra dentro quando estoura à direita', () => {
    const r = computePosition({ anchor: anchorAt(960, 400), floating, viewport })

    // Centralizado daria x = 785, o que colocaria a borda em 985 (> 1000 − 8)
    expect(r.x).toBe(792) // 1000 − 8 de padding − 200 de largura
  })

  it('desliza pra dentro quando estoura à esquerda', () => {
    const r = computePosition({ anchor: anchorAt(0, 400), floating, viewport })
    expect(r.x).toBe(8) // encosta no padding
  })

  it('respeita shift: false', () => {
    const r = computePosition({ anchor: anchorAt(960, 400), floating, viewport, shift: false })
    expect(r.x).toBe(885) // centralizado, estourando de propósito
  })
})

describe('computePosition — seta', () => {
  const arrow = { size: 8, padding: 8 }

  it('centraliza a seta no gatilho', () => {
    const r = computePosition({ anchor: anchorAt(475, 400), floating, viewport, arrow })
    expect(r.arrow?.x).toBe(96) // centro do gatilho (500) − x (400) − metade da seta (4)
  })

  it('prende a seta dentro do flutuante depois do shift', () => {
    const r = computePosition({ anchor: anchorAt(0, 400), floating, viewport, arrow })

    // O gatilho é estreito e está na borda: sem clamp, a seta ficaria antes do canto
    expect(r.arrow!.x).toBeGreaterThanOrEqual(8)
    expect(r.arrow!.x).toBeLessThanOrEqual(184) // 200 − 8 − 8
  })

  it('usa o eixo vertical quando o lado é lateral', () => {
    const r = computePosition({ anchor: anchorAt(400, 400), floating, viewport, side: 'right', arrow })

    expect(r.arrow?.y).toBeDefined()
    expect(r.arrow?.x).toBeUndefined()
  })
})

describe('computePosition — constrainSize', () => {
  it('devolve o espaço disponível abaixo do gatilho', () => {
    const r = computePosition({
      anchor: anchorAt(475, 400),
      floating,
      viewport,
      constrainSize: true,
    })

    expect(r.available?.height).toBe(372) // 800 − 420 − 8 de offset − 8 de padding
  })

  it('nunca devolve espaço negativo', () => {
    const r = computePosition({
      anchor: anchorAt(475, 795),
      floating,
      viewport,
      flip: false,
      constrainSize: true,
    })

    expect(r.available?.height).toBe(0)
  })
})
```

**Sobre a camada React:** os testes possíveis ali são rasos (os refs chegam nos nós certos, o `data-side` aparece, os listeners são removidos ao fechar). O jsdom devolve rects zerados, então a integração real fica pro Storybook.

---

## 11. Story de validação (obrigatória antes do primeiro componente)

O que os testes não cobrem precisa ser verificável em dez segundos. A story:

- Gatilho arrastável, ou uma grade de 9 gatilhos (cantos, bordas, centro)
- Controles pra `side`, `align`, `offset`, `flip`, `shift`
- Um flutuante de conteúdo variável (curto, longo, mais largo que a tela)
- Um gatilho dentro de um container com `overflow: auto`, pra ver o limite da seção 2
- Um gatilho dentro de um Dialog aberto

Essa story vira o teste de regressão visual dos sete componentes flutuantes. Vale escrevê-la **antes** do Popover, não depois.

---

## 12. Checklist

- [x] `computePosition.ts` criado, 16 testes passando (dois valores dos exemplos originais do doc estavam com erro aritmético — corrigidos nos testes, com o motivo comentado ali)
- [x] `useFloating/index.ts` criado
- [x] Story de validação de bordas no Storybook (`BordasDaViewport` e `DentroDeContainerComScroll`, em `Tooltip.stories.tsx`)
- [x] Retrofit do Tooltip (`side`/`align`/flip/arrow) — decidido: **sem** `Tooltip.Portal` por enquanto, pra não misturar duas mudanças de API na mesma leva (registrado como limite conhecido na seção 3 do doc do componente)
- [x] Seção 3 de `idris-componente-tooltip.md` atualizada: a simplificação de posicionamento deixou de existir
- [x] `idris-decisao-posicionamento.md` marcado como decidido (Opção A)
- [x] Seção 3 de `design-system-fundacao.md`: linha nova na tabela de arquitetura técnica — "Posicionamento flutuante: implementação própria (`useFloating`)"
- [ ] Só depois disso: Popover → HoverCard → Select
