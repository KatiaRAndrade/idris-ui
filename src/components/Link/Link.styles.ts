import { tv } from 'tailwind-variants'

export const link = tv({
  base: [
    'inline-flex items-center gap-1 font-sans text-brand-400',
    'underline-offset-4 hover:underline',
    'transition-colors duration-fast rounded-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
    // :visited é pseudo-classe do navegador — não dá pra simular via data-*
    'visited:text-accent-400',
  ],
})
