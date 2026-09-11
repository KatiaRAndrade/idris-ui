import { forwardRef, type HTMLAttributes } from 'react'
import { useAlertContext } from '../Alert.context'
import { title } from '../Alert.styles'

export const AlertTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    useAlertContext('Title')
    return <p ref={ref} className={title({ className })} {...props} />
  }
)

AlertTitle.displayName = 'Alert.Title'
