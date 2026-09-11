import { cloneElement, isValidElement, type ReactElement } from 'react'
import { useAlertContext } from '../Alert.context'
import { icon } from '../Alert.styles'

// Não existe um conjunto de ícones no projeto ainda (ver seção 6 do doc) —
// por isso, ao contrário do que a spec original previa, não há ícone padrão
// por variante. Alert.Icon segue o mesmo contrato do Badge.Icon: exige filho.
export interface AlertIconProps {
  children: ReactElement<{ width?: number; height?: number; 'aria-hidden'?: boolean }>
}

export function AlertIcon({ children }: AlertIconProps) {
  const { variant } = useAlertContext('Icon')
  if (!isValidElement(children)) return null

  return (
    <span className={icon({ variant })}>
      {cloneElement(children, {
        width: 16,
        height: 16,
        // Decoração: a variante já é comunicada pelo texto e pelo role
        'aria-hidden': true,
      })}
    </span>
  )
}

AlertIcon.displayName = 'Alert.Icon'
