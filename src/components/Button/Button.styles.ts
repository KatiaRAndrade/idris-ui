import { tv } from 'tailwind-variants'

export const button = tv({
  base: [
    'relative inline-flex items-center justify-center font-sans font-medium',
    'rounded-md transition-colors duration-fast',
    'disabled:opacity-40 disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
    'data-[loading]:text-transparent data-[loading]:pointer-events-none',
  ],
  variants: {
    // `metallic`/`metallic-gold`: uso pontual (hero, CTA de destaque), não para botões padrão
    variant: {
      primary: 'bg-brand-500 text-text-primary hover:bg-brand-700',
      secondary: 'bg-surface-elevated text-text-primary border border-white/10 hover:bg-surface',
      ghost: 'bg-transparent text-text-primary hover:bg-surface',
      destructive: 'bg-error text-text-primary hover:bg-error-hover',
      metallic:
        'bg-[image:var(--gradient-accent-metallic)] text-text-primary hover:brightness-110',
      'metallic-gold':
        'bg-[image:var(--gradient-accent-metallic-gold)] text-text-primary hover:brightness-110',
    },
    size: {
      sm: 'px-3 py-2 text-sm gap-1.5',
      md: 'px-4 py-3 text-base gap-2',
      lg: 'px-5 py-4 text-lg gap-2.5',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})
