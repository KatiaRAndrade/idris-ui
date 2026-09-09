import { createContext, useContext } from 'react'

export type DialogSize = 'sm' | 'md' | 'lg' | 'full'

export interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  modal: boolean
  titleId: string
  descriptionId: string
  /** Title e Description avisam que existem — ver seção 10. */
  hasTitle: boolean
  hasDescription: boolean
  registerTitle: () => () => void
  registerDescription: () => () => void
}

export const DialogContext = createContext<DialogContextValue | null>(null)

export function useDialogContext(part: string) {
  const ctx = useContext(DialogContext)
  if (!ctx) {
    throw new Error(`<Dialog.${part} /> precisa estar dentro de <Dialog.Root>`)
  }
  return ctx
}
