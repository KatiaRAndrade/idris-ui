import { forwardRef, useMemo, useState, type HTMLAttributes } from 'react'
import { avatar } from './Avatar.styles'
import { AvatarContext, type AvatarSize, type AvatarStatus } from './Avatar.context'

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size = 'md', children, ...props }, ref) => {
    const [status, setStatus] = useState<AvatarStatus>('idle')

    const value = useMemo(() => ({ size, status, setStatus }), [size, status])

    return (
      <AvatarContext.Provider value={value}>
        <span
          ref={ref}
          data-size={size}
          data-state={status}
          className={avatar({ size, className })}
          {...props}
        >
          {children}
        </span>
      </AvatarContext.Provider>
    )
  }
)

Avatar.displayName = 'Avatar'
