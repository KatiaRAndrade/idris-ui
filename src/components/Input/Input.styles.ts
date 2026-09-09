import { tv } from 'tailwind-variants'

export const root = tv({
  base: 'flex flex-col gap-1.5',
})

export const label = tv({
  base: 'font-sans text-sm font-medium text-text-primary',
})

export const field = tv({
  base: [
    'w-full rounded-md border border-white/10 bg-surface text-text-primary font-sans',
    'placeholder:text-text-secondary transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
    'disabled:opacity-40 disabled:pointer-events-none',
  ],
  variants: {
    size: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    },
    invalid: {
      true: 'border-error focus-visible:ring-error',
    },
  },
  defaultVariants: { size: 'md' },
})

export const textarea = tv({
  extend: field,
  base: 'min-h-[80px] overflow-y-auto',
  variants: {
    resize: {
      none: 'resize-none',
      vertical: 'resize-y',
    },
    autoResize: {
      // Com altura automática, o handle de resize manual não faz sentido:
      // a altura seria sobrescrita na próxima tecla digitada.
      true: 'resize-none overflow-hidden',
    },
  },
  defaultVariants: { resize: 'vertical' },
})

export const hint = tv({
  base: 'text-sm text-text-secondary',
})

export const error = tv({
  base: 'text-sm text-error',
})
