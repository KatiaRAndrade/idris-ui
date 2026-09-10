import { forwardRef, useEffect, useRef, type HTMLAttributes } from 'react'
import { mergeRefs } from './mergeRefs'

interface Layer {
  id: symbol
  node: () => HTMLElement | null
}

/** Camadas abertas. O "topo" é decidido por aninhamento de DOM — ver isTopLayer. */
const layerStack: Layer[] = []

/** Alguma outra camada ativa está aninhada dentro do nó desta? */
function hasNestedLayer(node: HTMLElement | null) {
  if (!node) return false
  return layerStack.some((other) => {
    const on = other.node()
    return on && node !== on && node.contains(on)
  })
}

export interface DismissableLayerProps extends HTMLAttributes<HTMLDivElement> {
  /** Chamado no Escape ou no clique fora. Chame preventDefault no evento pra cancelar. */
  onDismiss?: () => void
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
  /** Desliga o fechamento por clique fora (ex: AlertDialog). */
  disableOutsidePointerDown?: boolean
}

export const DismissableLayer = forwardRef<HTMLDivElement, DismissableLayerProps>(
  (
    {
      onDismiss,
      onEscapeKeyDown,
      onPointerDownOutside,
      disableOutsidePointerDown = false,
      children,
      ...props
    },
    forwardedRef
  ) => {
    const nodeRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      const layerId = Symbol('idris-layer')
      layerStack.push({ id: layerId, node: () => nodeRef.current })

      // "Topo" = uma camada-folha (sem outra camada aninhada dentro dela) e, entre
      // as folhas, a última registrada. Cobre camadas aninhadas na mesma árvore
      // (a de dentro vence, mesmo montando junto) e irmãs em portais (a última vence).
      const isTopLayer = () => {
        const node = nodeRef.current
        if (hasNestedLayer(node)) return false
        const leaves = layerStack.filter((l) => !hasNestedLayer(l.node()))
        return leaves[leaves.length - 1]?.id === layerId
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || !isTopLayer()) return
        onEscapeKeyDown?.(event)
        if (!event.defaultPrevented) onDismiss?.()
      }

      const handlePointerDown = (event: PointerEvent) => {
        if (disableOutsidePointerDown || !isTopLayer()) return
        const node = nodeRef.current
        if (!node || node.contains(event.target as Node)) return
        onPointerDownOutside?.(event)
        if (!event.defaultPrevented) onDismiss?.()
      }

      // `pointerdown` e não `click`: se o clique fora abrir um menu ou mover
      // o conteúdo, o `click` pode acabar disparando sobre outro elemento.
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('pointerdown', handlePointerDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('pointerdown', handlePointerDown)
        const index = layerStack.findIndex((l) => l.id === layerId)
        if (index !== -1) layerStack.splice(index, 1)
      }
    }, [onDismiss, onEscapeKeyDown, onPointerDownOutside, disableOutsidePointerDown])

    return (
      <div ref={mergeRefs(nodeRef, forwardedRef)} {...props}>
        {children}
      </div>
    )
  }
)

DismissableLayer.displayName = 'DismissableLayer'
