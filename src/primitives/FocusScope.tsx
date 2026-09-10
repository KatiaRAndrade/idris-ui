import { forwardRef, useEffect, useRef, type HTMLAttributes } from 'react'
import { mergeRefs } from './mergeRefs'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

// Sobe a árvore procurando `display:none`/`visibility:hidden`. Preferido a
// `offsetParent`, que depende de layout — algo que ambientes de teste sem
// motor de renderização (jsdom) não calculam, marcando tudo como escondido.
function isVisible(el: HTMLElement) {
  let node: HTMLElement | null = el
  while (node) {
    const style = getComputedStyle(node)
    if (style.display === 'none' || style.visibility === 'hidden') return false
    node = node.parentElement
  }
  return true
}

function getFocusable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => isVisible(el) || el === document.activeElement
  )
}

export interface FocusScopeProps extends HTMLAttributes<HTMLDivElement> {
  /** Prende o Tab dentro do escopo. */
  trapped?: boolean
  /** Foca o primeiro elemento focável ao montar. */
  autoFocus?: boolean
  /** Devolve o foco ao elemento anterior ao desmontar. */
  restoreFocus?: boolean
}

export const FocusScope = forwardRef<HTMLDivElement, FocusScopeProps>(
  (
    { trapped = true, autoFocus = true, restoreFocus = true, children, tabIndex, ...props },
    forwardedRef
  ) => {
    const nodeRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      const node = nodeRef.current
      if (!node) return

      const previouslyFocused = document.activeElement as HTMLElement | null

      if (autoFocus) {
        const [first] = getFocusable(node)
        // Se não há nada focável dentro, foca o container (por isso o tabIndex -1 abaixo)
        ;(first ?? node).focus()
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (!trapped || event.key !== 'Tab') return

        const focusable = getFocusable(node)
        if (focusable.length === 0) {
          event.preventDefault()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement

        if (event.shiftKey && active === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }

      node.addEventListener('keydown', handleKeyDown)

      return () => {
        node.removeEventListener('keydown', handleKeyDown)
        // Devolve o foco só se o elemento ainda existir no documento —
        // ele pode ter sido removido junto com o que abriu o modal
        if (restoreFocus && previouslyFocused?.isConnected) previouslyFocused.focus()
      }
    }, [trapped, autoFocus, restoreFocus])

    return (
      <div ref={mergeRefs(nodeRef, forwardedRef)} tabIndex={tabIndex ?? -1} {...props}>
        {children}
      </div>
    )
  }
)

FocusScope.displayName = 'FocusScope'
