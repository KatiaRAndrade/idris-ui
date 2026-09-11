import { Avatar as Root } from './Avatar'
import { AvatarImage } from './parts/Image'
import { AvatarFallback } from './parts/Fallback'
import { avatar as avatarStyles } from './Avatar.styles'

export const Avatar = Object.assign(Root, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
  Styles: avatarStyles,
})

export type { AvatarProps } from './Avatar'
export type { AvatarImageProps } from './parts/Image'
export type { AvatarFallbackProps } from './parts/Fallback'
export type { AvatarSize } from './Avatar.context'
