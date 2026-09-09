import type { InputHTMLAttributes } from 'react'

export interface BubbleInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'type'> {
  type: 'checkbox' | 'radio'
  checked: boolean
}

/**
 * Input nativo escondido que espelha o estado do componente estilizado,
 * pra que o valor entre no FormData de um <form> nativo.
 * Fica fora da árvore de acessibilidade — quem é anunciado é o botão com role.
 */
export function BubbleInput({ type, checked, ...props }: BubbleInputProps) {
  return (
    <input
      type={type}
      checked={checked}
      // O estado real mora no componente pai; esse input só reflete.
      // `readOnly` evita o warning do React sobre input controlado sem onChange.
      readOnly
      tabIndex={-1}
      aria-hidden
      className="absolute h-0 w-0 opacity-0 pointer-events-none"
      {...props}
    />
  )
}

BubbleInput.displayName = 'BubbleInput'
