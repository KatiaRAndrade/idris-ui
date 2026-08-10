import { Button as Root } from './Button'
import { ButtonContent } from './parts/Content'
import { ButtonIcon } from './parts/Icon'
import { ButtonLabel } from './parts/Label'
import { button as buttonStyles } from './Button.styles'

export const Button = Object.assign(Root, {
  Content: ButtonContent,
  Icon: ButtonIcon,
  Label: ButtonLabel,
  Styles: buttonStyles,
})

export type { ButtonProps } from './Button'
