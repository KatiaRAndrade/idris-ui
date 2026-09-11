import { tv } from 'tailwind-variants'

export const skeleton = tv({
  base: [
    'bg-surface-elevated',
    'animate-pulse',
    // Aqui a animação PARA em movimento reduzido — a forma já comunica.
    // Diferente do Spinner, onde parar destruiria a informação.
    'motion-reduce:animate-none',
  ],
  variants: {
    shape: {
      // h-[1em] acompanha o tamanho de fonte do contexto
      text: 'h-[1em] w-full rounded-sm',
      circle: 'aspect-square rounded-full',
      rect: 'rounded-md',
    },
  },
  defaultVariants: { shape: 'text' },
})
