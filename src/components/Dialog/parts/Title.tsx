import { forwardRef, useEffect, type HTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useDialogContext } from '../Dialog.context'
import { title } from '../Dialog.styles'

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Troca o nível do heading conforme a hierarquia da página. */
  asChild?: boolean
}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, asChild, children, ...props }, ref) => {
    const { titleId, registerTitle } = useDialogContext('Title')

    useEffect(() => registerTitle(), [registerTitle])

    const sharedProps = { id: titleId, className: title({ className }) }

    if (asChild) {
      return (
        <Slot ref={ref} {...sharedProps} {...props}>
          {children as ReactElement<Record<string, unknown>>}
        </Slot>
      )
    }

    return (
      <h2 ref={ref} {...sharedProps} {...props}>
        {children}
      </h2>
    )
  }
)

DialogTitle.displayName = 'Dialog.Title'
