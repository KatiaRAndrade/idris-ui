import { forwardRef, useEffect, type HTMLAttributes } from 'react'
import { DismissableLayer } from '../../../primitives/DismissableLayer'
import { FocusScope } from '../../../primitives/FocusScope'
import { mergeRefs } from '../../../primitives/mergeRefs'
import { usePresence } from '../../../hooks/usePresence'
import { useScrollLock } from '../../../hooks/useScrollLock'
import { useDialogContext, type DialogSize } from '../Dialog.context'
import { content } from '../Dialog.styles'

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  size?: DialogSize
  /** Desliga o fechamento por clique fora (base do AlertDialog). */
  disableOutsideClose?: boolean
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, size = 'md', disableOutsideClose = false, children, ...props }, forwardedRef) => {
    const {
      open,
      setOpen,
      modal,
      titleId,
      descriptionId,
      hasTitle,
      hasDescription,
      registerPresence,
    } = useDialogContext('Content')

    const { isPresent, ref: presenceRef } = usePresence(open)

    useEffect(() => {
      if (!isPresent) return
      return registerPresence()
    }, [isPresent, registerPresence])

    useScrollLock(open && modal)

    // Título é requisito de acessibilidade, não sugestão — avisa em dev se faltar
    useEffect(() => {
      if (process.env.NODE_ENV === 'production' || !open) return
      if (!hasTitle) {
        console.warn(
          '[idris] <Dialog.Content> sem <Dialog.Title>. Leitores de tela vão anunciar o ' +
            'dialog sem nome. Use <VisuallyHidden> se o título não deve aparecer na tela.'
        )
      }
    }, [open, hasTitle])

    if (!isPresent) return null

    return (
      <FocusScope trapped={modal} autoFocus restoreFocus>
        <DismissableLayer
          ref={mergeRefs(forwardedRef, presenceRef)}
          role="dialog"
          aria-modal={modal || undefined}
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
          data-state={open ? 'open' : 'closed'}
          data-size={size}
          data-modal={modal || undefined}
          disableOutsidePointerDown={disableOutsideClose}
          onDismiss={() => setOpen(false)}
          className={content({ size, className })}
          {...props}
        >
          {children}
        </DismissableLayer>
      </FocusScope>
    )
  }
)

DialogContent.displayName = 'Dialog.Content'
