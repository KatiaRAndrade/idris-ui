import { tv } from 'tailwind-variants'

export const alert = tv({
  base: 'flex gap-3 rounded-md border p-4 text-sm',
  variants: {
    variant: {
      info: 'border-info/30 bg-info-bg text-text-primary',
      success: 'border-success/30 bg-success-bg text-text-primary',
      warning: 'border-warning/30 bg-warning-bg text-text-primary',
      error: 'border-error/30 bg-error-bg text-text-primary',
      neutral: 'border-white/10 bg-surface-elevated text-text-primary',
    },
  },
  defaultVariants: { variant: 'neutral' },
})

export const icon = tv({
  // shrink-0 e mt-0.5: o ícone alinha com a primeira linha de texto,
  // não com o centro do bloco inteiro quando a descrição é longa
  base: 'shrink-0 mt-0.5',
  variants: {
    variant: {
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
      neutral: 'text-text-secondary',
    },
  },
})

export const body = tv({ base: 'flex min-w-0 flex-1 flex-col gap-1' })
export const title = tv({ base: 'font-sans font-medium text-text-primary' })
export const description = tv({ base: 'text-text-secondary [&_a]:underline' })

export const close = tv({
  base: [
    'shrink-0 -mr-1 -mt-1 inline-flex h-6 w-6 items-center justify-center',
    'rounded-sm text-text-secondary transition-colors duration-fast',
    'hover:text-text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
  ],
})
