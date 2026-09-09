import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react'
import { tooltip } from './Tooltip.styles'
import { TooltipContext, type TooltipSide, type TooltipSize } from './Tooltip.context'

export interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
  side?: TooltipSide
  size?: TooltipSize
  delay?: number
  defaultOpen?: boolean
}

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
      className,
      side = 'top',
      size = 'md',
      delay = 200,
      defaultOpen = false,
      children,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(defaultOpen)
    const contentId = useId()
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

    const show = useCallback(() => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setOpen(true), delay)
    }, [delay])

    const hide = useCallback(() => {
      clearTimeout(timer.current)
      setOpen(false)
    }, [])

    useEffect(() => () => clearTimeout(timer.current), [])

    return (
      <TooltipContext.Provider value={{ open, contentId, side, size, show, hide }}>
        <span
          ref={ref}
          data-side={side}
          data-size={size}
          data-state={open ? 'open' : 'closed'}
          className={tooltip({ className })}
          onMouseEnter={(e) => {
            show()
            onMouseEnter?.(e)
          }}
          onMouseLeave={(e) => {
            hide()
            onMouseLeave?.(e)
          }}
          onFocus={(e) => {
            show()
            onFocus?.(e)
          }}
          onBlur={(e) => {
            hide()
            onBlur?.(e)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') hide()
            onKeyDown?.(e)
          }}
          {...props}
        >
          {children}
        </span>
      </TooltipContext.Provider>
    )
  }
)

Tooltip.displayName = 'Tooltip'
