import { Checkbox as Root } from './Checkbox'
import { CheckboxIndicator } from './parts/Indicator'
import { checkbox as checkboxStyles } from './Checkbox.styles'

export const Checkbox = Object.assign(Root, {
  Indicator: CheckboxIndicator,
  Styles: checkboxStyles,
})

export type { CheckboxProps } from './Checkbox'
export type { CheckboxIndicatorProps } from './parts/Indicator'
export type { CheckedState, CheckboxSize } from './Checkbox.context'
