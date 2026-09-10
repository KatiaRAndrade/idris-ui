import type { MutableRefObject, Ref } from 'react'

/**
 * Combina múltiplos refs num só callback ref — cada um recebe o mesmo nó.
 * Extraído do `Slot`, onde apareceu pela primeira vez; hoje também usado por
 * `DismissableLayer`, `FocusScope` e `Input.Textarea` (quarta aparição do padrão).
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else (ref as MutableRefObject<T | null>).current = node
    }
  }
}
