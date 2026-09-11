import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Spinner, type SpinnerSize } from '../Spinner'
import { button } from './Button.styles'
import { ButtonContext, type ButtonVariant, type ButtonSize } from './Button.context'

const SPINNER_SIZE: Record<ButtonSize, SpinnerSize> = { sm: 'sm', md: 'md', lg: 'lg' }

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    return (
      <ButtonContext.Provider value={{ variant, size }}>
        <button
          ref={ref}
          data-variant={variant}
          data-size={size}
          data-loading={loading || undefined}
          disabled={disabled || loading}
          aria-busy={loading || undefined}
          className={button({ variant, size, className })}
          {...props}
        >
          {loading ? (
            <span
              className="absolute inset-0 flex items-center justify-center text-text-primary"
              aria-hidden
            >
              <Spinner size={SPINNER_SIZE[size]} />
            </span>
          ) : null}
          {children}
        </button>
      </ButtonContext.Provider>
    )
  }
)

Button.displayName = 'Button'
