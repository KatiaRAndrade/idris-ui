import { forwardRef, useEffect, type HTMLAttributes } from 'react'
import { usePresence } from '../../../hooks/usePresence'
import { mergeRefs } from '../../../primitives/mergeRefs'
import { useDialogContext } from '../Dialog.context'
import { overlay } from '../Dialog.styles'

export const DialogOverlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, forwardedRef) => {
    const { open, modal, registerPresence } = useDialogContext('Overlay')
    const { isPresent, ref: presenceRef } = usePresence(open)

    useEffect(() => {
      if (!isPresent) return
      return registerPresence()
    }, [isPresent, registerPresence])

    // Sem overlay em dialog não-modal: escurecer o fundo comunica
    // "o resto está bloqueado", o que seria mentira aqui
    if (!modal || !isPresent) return null

    return (
      <div
        ref={mergeRefs(forwardedRef, presenceRef)}
        aria-hidden
        data-state={open ? 'open' : 'closed'}
        className={overlay({ className })}
        {...props}
      />
    )
  }
)

DialogOverlay.displayName = 'Dialog.Overlay'
