import { useCallback, useEffect, useRef, useState } from 'react'

export interface UsePresenceResult {
  /** O elemento ainda precisa estar montado? */
  isPresent: boolean
  /** Pendure no nó que carrega a transição de saída. */
  ref: (node: HTMLElement | null) => void
}

/**
 * Mantém o elemento montado até a animação de saída terminar.
 * O nó deve reagir ao `data-state` (open/closed) via CSS — ver seção 6.
 */
export function usePresence(present: boolean): UsePresenceResult {
  const [isPresent, setIsPresent] = useState(present)
  const nodeRef = useRef<HTMLElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const ref = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node
  }, [])

  useEffect(() => {
    if (present) {
      clearTimeout(timeoutRef.current)
      setIsPresent(true)
      return
    }

    const node = nodeRef.current
    if (!node) {
      setIsPresent(false)
      return
    }

    const styles = getComputedStyle(node)
    const duration = getLongestDuration(styles)

    // Sem transição declarada (ou prefers-reduced-motion zerando tudo):
    // não há o que esperar, desmonta agora
    if (duration === 0) {
      setIsPresent(false)
      return
    }

    const finish = () => {
      clearTimeout(timeoutRef.current)
      setIsPresent(false)
    }

    // Só reage ao evento do próprio nó — uma transição de um filho
    // (o thumb de um switch dentro do content, por exemplo) desmontaria cedo demais
    const handleEnd = (event: TransitionEvent | AnimationEvent) => {
      if (event.target === node) finish()
    }

    node.addEventListener('transitionend', handleEnd)
    node.addEventListener('animationend', handleEnd)

    // Rede de segurança: se o evento não chegar, desmonta assim mesmo.
    // Sem isso, um overlay invisível fica preso bloqueando a página inteira.
    timeoutRef.current = setTimeout(finish, duration + 50)

    return () => {
      node.removeEventListener('transitionend', handleEnd)
      node.removeEventListener('animationend', handleEnd)
      clearTimeout(timeoutRef.current)
    }
  }, [present])

  return { isPresent, ref }
}

/** Maior duração declarada, em ms, considerando transition e animation (+ delays). */
function getLongestDuration(styles: CSSStyleDeclaration): number {
  const toMs = (value: string) =>
    value
      .split(',')
      .map((v) => {
        const trimmed = v.trim()
        if (trimmed.endsWith('ms')) return parseFloat(trimmed)
        if (trimmed.endsWith('s')) return parseFloat(trimmed) * 1000
        return 0
      })
      .reduce((max, n) => Math.max(max, n), 0)

  const transition = toMs(styles.transitionDuration) + toMs(styles.transitionDelay)
  const animation =
    styles.animationName === 'none' ? 0 : toMs(styles.animationDuration) + toMs(styles.animationDelay)

  return Math.max(transition, animation)
}
