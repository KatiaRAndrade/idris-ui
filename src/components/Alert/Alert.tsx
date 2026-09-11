import { forwardRef, useMemo, type HTMLAttributes } from 'react'
import { alert } from './Alert.styles'
import { AlertContext, liveAttributes, type AlertVariant, type AlertLive } from './Alert.context'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  /** Como leitores de tela anunciam este alerta — ver seção 4 do doc. Default: 'off' */
  live?: AlertLive
  /** Torna o alerta dispensável. Sem isso, Alert.Close não faz nada. */
  onClose?: () => void
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'neutral', live = 'off', onClose, children, ...props }, ref) => {
    const value = useMemo(() => ({ variant, onClose }), [variant, onClose])

    return (
      <AlertContext.Provider value={value}>
        <div
          ref={ref}
          {...liveAttributes(live)}
          data-variant={variant}
          data-live={live}
          className={alert({ variant, className })}
          {...props}
        >
          {children}
        </div>
      </AlertContext.Provider>
    )
  }
)

Alert.displayName = 'Alert'
