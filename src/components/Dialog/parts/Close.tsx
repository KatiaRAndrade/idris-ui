import { forwardRef, type ButtonHTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useDialogContext } from '../Dialog.context'

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild, onClick, children, ...props }, ref) => {
    const { setOpen } = useDialogContext('Close')

    const sharedProps = {
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(false)
      },
    }

    if (asChild) {
      return (
        <Slot ref={ref} {...sharedProps} {...props}>
          {children as ReactElement<Record<string, unknown>>}
        </Slot>
      )
    }

    return (
      <button ref={ref} type="button" {...sharedProps} {...props}>
        {children}
      </button>
    )
  }
)

DialogClose.displayName = 'Dialog.Close'
