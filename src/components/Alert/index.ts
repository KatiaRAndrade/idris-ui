import { Alert as Root } from './Alert'
import { AlertIcon } from './parts/Icon'
import { AlertTitle } from './parts/Title'
import { AlertDescription } from './parts/Description'
import { AlertClose } from './parts/Close'
import { alert as alertStyles } from './Alert.styles'

export const Alert = Object.assign(Root, {
  Icon: AlertIcon,
  Title: AlertTitle,
  Description: AlertDescription,
  Close: AlertClose,
  Styles: alertStyles,
})

export type { AlertProps } from './Alert'
export type { AlertVariant, AlertLive } from './Alert.context'
