import type { ReactNode } from 'react'
import { Portal } from '../../../primitives/Portal'
import { useDialogContext } from '../Dialog.context'

export interface DialogPortalProps {
  children: ReactNode
  container?: Element | null
  /** Mantém no DOM mesmo fechado (útil pra animação de saída — ver seção 11). */
  forceMount?: boolean
}

export function DialogPortal({ children, container, forceMount }: DialogPortalProps) {
  const { open } = useDialogContext('Portal')
  if (!open && !forceMount) return null
  return <Portal container={container}>{children}</Portal>
}

DialogPortal.displayName = 'Dialog.Portal'
