import { forwardRef, type ButtonHTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useDialogContext } from '../Dialog.context'

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild, onClick, children, ...props }, ref) => {
    const { open, setOpen } = useDialogContext('Trigger')

    const sharedProps = {
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': open,
      'data-state': open ? ('open' as const) : ('closed' as const),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(true)
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

DialogTrigger.displayName = 'Dialog.Trigger'
