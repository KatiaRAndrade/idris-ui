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
