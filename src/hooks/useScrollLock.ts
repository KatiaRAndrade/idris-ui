import { useLayoutEffect } from 'react'

/** Quantos overlays estão travando o scroll agora — evita destravar cedo demais. */
let lockCount = 0
let originalOverflow = ''
let originalPaddingRight = ''

export function useScrollLock(enabled = true) {
  useLayoutEffect(() => {
    if (!enabled) return

    lockCount += 1

    if (lockCount === 1) {
      const { body } = document
      originalOverflow = body.style.overflow
      originalPaddingRight = body.style.paddingRight

      // Compensa a largura da barra de rolagem que vai sumir —
      // sem isso a página inteira "pula" pra direita ao abrir o modal
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      const current = parseInt(window.getComputedStyle(body).paddingRight, 10) || 0

      body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) body.style.paddingRight = `${current + scrollbarWidth}px`
    }

    return () => {
      lockCount -= 1
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [enabled])
}
