import { createContext, useContext } from 'react'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral'
export type AlertLive = 'off' | 'polite' | 'assertive'

export interface AlertContextValue {
  variant: AlertVariant
  onClose?: () => void
}

export const AlertContext = createContext<AlertContextValue | null>(null)

export function useAlertContext(part: string) {
  const ctx = useContext(AlertContext)
  if (!ctx) {
    throw new Error(`<Alert.${part} /> precisa estar dentro de <Alert>`)
  }
  return ctx
}

/** role e aria-live derivados da prop `live` — ver seção 4 do doc. */
export function liveAttributes(live: AlertLive) {
  if (live === 'assertive') return { role: 'alert' as const }
  if (live === 'polite') return { role: 'status' as const }
  return {}
}
