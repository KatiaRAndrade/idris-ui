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
