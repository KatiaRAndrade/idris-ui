import { tv } from 'tailwind-variants'

export const badge = tv({
  base: 'inline-flex items-center gap-1 rounded-full font-sans font-medium whitespace-nowrap',
  variants: {
    variant: {
      neutral: 'bg-surface-elevated text-text-secondary border border-white/10',
      brand: 'bg-brand-500/15 text-brand-400',
      accent: 'bg-accent-500/15 text-accent-400',
      success: 'bg-success-bg text-success',
      warning: 'bg-warning-bg text-warning',
      error: 'bg-error-bg text-error',
      info: 'bg-info-bg text-info',
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    },
  },
  defaultVariants: { variant: 'neutral', size: 'md' },
})
