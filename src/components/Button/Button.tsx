import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const button = tv({
  base: [
    'inline-flex items-center justify-center font-sans font-medium',
    'rounded-md transition-colors duration-fast',
    'disabled:opacity-40 disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
  ],
  variants: {
    variant: {
      primary: 'bg-brand-500 text-text-primary hover:bg-brand-700',
      secondary: 'bg-surface-elevated text-text-primary border border-white/10 hover:bg-surface',
      ghost: 'bg-transparent text-text-primary hover:bg-surface',
      destructive: 'bg-error text-text-primary hover:bg-error-hover',
    },
    size: {
      sm: 'px-3 py-2 text-sm gap-1.5',
      md: 'px-4 py-3 text-base gap-2',
      lg: 'px-5 py-4 text-lg gap-2.5',
    },
    loading: {
      true: 'relative text-transparent pointer-events-none',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={button({ variant, size, loading, className })}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-text-primary" />
          </span>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
