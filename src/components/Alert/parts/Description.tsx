import { forwardRef, type HTMLAttributes } from 'react'
import { useAlertContext } from '../Alert.context'
import { description } from '../Alert.styles'

// <div> e não <p>: precisa aceitar listas e conteúdo rico — ver seção 3 do doc
export const AlertDescription = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    useAlertContext('Description')
    return <div ref={ref} className={description({ className })} {...props} />
  }
)

AlertDescription.displayName = 'Alert.Description'
