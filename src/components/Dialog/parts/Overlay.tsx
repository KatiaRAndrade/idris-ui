import { forwardRef, type HTMLAttributes } from 'react'
import { useDialogContext } from '../Dialog.context'
import { overlay } from '../Dialog.styles'

export const DialogOverlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open, modal } = useDialogContext('Overlay')
    // Sem overlay em dialog não-modal: escurecer o fundo comunica
    // "o resto está bloqueado", o que seria mentira aqui
    if (!modal) return null

    return (
      <div
        ref={ref}
        aria-hidden
        data-state={open ? 'open' : 'closed'}
        className={overlay({ className })}
        {...props}
      />
    )
  }
)

DialogOverlay.displayName = 'Dialog.Overlay'
