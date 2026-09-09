import { Switch as Root } from './Switch'
import { SwitchThumb } from './parts/Thumb'
import { root as switchStyles } from './Switch.styles'

export const Switch = Object.assign(Root, {
  Thumb: SwitchThumb,
  Styles: switchStyles,
})

export type { SwitchProps } from './Switch'
export type { SwitchSize } from './Switch.context'
