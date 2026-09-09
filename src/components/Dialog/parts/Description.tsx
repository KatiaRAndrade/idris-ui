import { forwardRef, useEffect, type HTMLAttributes } from 'react'
import { useDialogContext } from '../Dialog.context'
import { description } from '../Dialog.styles'

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { descriptionId, registerDescription } = useDialogContext('Description')

  useEffect(() => registerDescription(), [registerDescription])

  return <p ref={ref} id={descriptionId} className={description({ className })} {...props} />
})

DialogDescription.displayName = 'Dialog.Description'
