import { tv } from 'tailwind-variants'

export const label = tv({
  base: [
    'inline-flex items-center gap-1 font-sans text-text-primary',
    // Sem isso, o duplo clique no rótulo seleciona o texto em vez de
    // ativar o controle duas vezes — atrito pequeno e constante
    'select-none',
    'data-[disabled]:text-text-secondary data-[disabled]:cursor-not-allowed',
  ],
  variants: {
    size: {
      sm: 'text-xs font-medium uppercase tracking-wide',
      md: 'text-sm font-medium',
    },
  },
  defaultVariants: { size: 'md' },
})

export const requiredMark = tv({
  base: 'text-error',
})
