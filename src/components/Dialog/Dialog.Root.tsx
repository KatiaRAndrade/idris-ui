import { useCallback, useId, useMemo, useState, type ReactNode } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { DialogContext } from './Dialog.context'

export interface DialogRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Trava o scroll, prende o foco e escurece o fundo. Default: true */
  modal?: boolean
  children?: ReactNode
}

export function DialogRoot({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  children,
}: DialogRootProps) {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  const baseId = useId()
  const [hasTitle, setHasTitle] = useState(false)
  const [hasDescription, setHasDescription] = useState(false)

  const registerTitle = useCallback(() => {
    setHasTitle(true)
    return () => setHasTitle(false)
  }, [])

  const registerDescription = useCallback(() => {
    setHasDescription(true)
    return () => setHasDescription(false)
  }, [])

  const [presentCount, setPresentCount] = useState(0)
  const registerPresence = useCallback(() => {
    setPresentCount((n) => n + 1)
    return () => setPresentCount((n) => n - 1)
  }, [])

  const value = useMemo(
    () => ({
      open,
      setOpen: setOpen as (o: boolean) => void,
      modal,
      titleId: `${baseId}-title`,
      descriptionId: `${baseId}-description`,
      hasTitle,
      hasDescription,
      registerTitle,
      registerDescription,
      presentCount,
      registerPresence,
    }),
    [
      open,
      setOpen,
      modal,
      baseId,
      hasTitle,
      hasDescription,
      registerTitle,
      registerDescription,
      presentCount,
      registerPresence,
    ]
  )

  // O Root não renderiza DOM nenhum — é só o nó de estado, igual ao Popover.Root do Radix
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
}

DialogRoot.displayName = 'Dialog.Root'
