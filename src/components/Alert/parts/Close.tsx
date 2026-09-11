import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { useAlertContext } from '../Alert.context'
import { close } from '../Alert.styles'

export const AlertClose = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, 'aria-label': ariaLabel = 'Fechar aviso', ...props }, ref) => {
    const { onClose } = useAlertContext('Close')

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        className={close({ className })}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) onClose?.()
        }}
        {...props}
      />
    )
  }
)

AlertClose.displayName = 'Alert.Close'
