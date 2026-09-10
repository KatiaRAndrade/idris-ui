import { useCallback } from 'react'
import type { KeyboardEvent } from 'react'

export type RovingOrientation = 'horizontal' | 'vertical' | 'both'

const NEXT_KEYS: Record<RovingOrientation, string[]> = {
  horizontal: ['ArrowRight'],
  vertical: ['ArrowDown'],
  both: ['ArrowRight', 'ArrowDown'],
}

const PREV_KEYS: Record<RovingOrientation, string[]> = {
  horizontal: ['ArrowLeft'],
  vertical: ['ArrowUp'],
  both: ['ArrowLeft', 'ArrowUp'],
}

export interface UseRovingFocusOptions {
  /** Seletor do container, usado com closest() a partir do item. Ex: '[role="radiogroup"]' */
  containerSelector: string
  /** Seletor dos itens navegáveis. Desabilitados já saem daqui. */
  itemSelector?: string
  orientation?: RovingOrientation
  /** Do último volta pro primeiro. Default: true */
  loop?: boolean
  /** Dispara click() no item ao navegar — comportamento nativo de radio. Default: false */
  activateOnNavigate?: boolean
  /** Gancho pra quem precisa reagir sem ativar (ex: Tabs com ativação manual). */
  onNavigate?: (item: HTMLElement) => void
}

/**
 * Devolve um handler de teclado pra pendurar em cada item navegável.
 * Os irmãos são descobertos por query no DOM a partir do container — ver seção 8.
 */
export function useRovingFocus({
  containerSelector,
  itemSelector = '[data-roving-item]:not([disabled])',
  orientation = 'both',
  loop = true,
  activateOnNavigate = false,
  onNavigate,
}: UseRovingFocusOptions) {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const { key } = event
      const isNext = NEXT_KEYS[orientation].includes(key)
      const isPrev = PREV_KEYS[orientation].includes(key)
      const isHome = key === 'Home'
      const isEnd = key === 'End'
      if (!isNext && !isPrev && !isHome && !isEnd) return

      const container = event.currentTarget.closest(containerSelector)
      if (!container) return

      const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector))
      if (items.length === 0) return

      const current = items.indexOf(event.currentTarget)
      if (current === -1) return

      let nextIndex: number
      if (isHome) {
        nextIndex = 0
      } else if (isEnd) {
        nextIndex = items.length - 1
      } else if (isNext) {
        nextIndex = loop ? (current + 1) % items.length : Math.min(current + 1, items.length - 1)
      } else {
        nextIndex = loop ? (current - 1 + items.length) % items.length : Math.max(current - 1, 0)
      }

      const target = items[nextIndex]
      if (!target || target === event.currentTarget) return

      // Impede a página de rolar junto com as setas
      event.preventDefault()
      target.focus()
      onNavigate?.(target)
      if (activateOnNavigate) target.click()
    },
    [containerSelector, itemSelector, orientation, loop, activateOnNavigate, onNavigate]
  )
}

export interface ResolveRovingTabIndexParams {
  /** Este item é o ativo (selecionado, ou o último focado)? */
  isActive: boolean
  /** Existe algum item ativo no grupo? */
  hasActive: boolean
  /** Este é o primeiro item habilitado do grupo? */
  isFirst: boolean
}

/**
 * Exatamente um item do grupo recebe 0. O ativo, ou — se não houver ativo —
 * o primeiro habilitado, pra que o grupo continue alcançável por Tab.
 */
export function resolveRovingTabIndex({
  isActive,
  hasActive,
  isFirst,
}: ResolveRovingTabIndexParams): 0 | -1 {
  if (isActive) return 0
  if (!hasActive && isFirst) return 0
  return -1
}
