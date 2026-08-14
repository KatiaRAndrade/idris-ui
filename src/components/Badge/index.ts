import { Badge as Root } from './Badge'
import { BadgeIcon } from './parts/Icon'
import { BadgeLabel } from './parts/Label'
import { badge as badgeStyles } from './Badge.styles'

export const Badge = Object.assign(Root, {
  Icon: BadgeIcon,
  Label: BadgeLabel,
  Styles: badgeStyles,
})

export type { BadgeProps } from './Badge'
export type { BadgeIconProps } from './parts/Icon'
export type { BadgeVariant, BadgeSize } from './Badge.context'
