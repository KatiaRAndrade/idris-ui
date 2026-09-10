import { cloneElement, forwardRef, isValidElement, type HTMLAttributes, type ReactElement } from 'react'
import { mergeRefs } from './mergeRefs'

function mergeProps(slotProps: Record<string, unknown>, childProps: Record<string, unknown>) {
  const merged: Record<string, unknown> = { ...slotProps, ...childProps }

  for (const key in childProps) {
    const slotValue = slotProps[key]
    const childValue = childProps[key]
    const isHandler = /^on[A-Z]/.test(key)

    if (isHandler && typeof slotValue === 'function' && typeof childValue === 'function') {
      merged[key] = (...args: unknown[]) => {
        childValue(...args)
        slotValue(...args)
      }
    } else if (key === 'className' && typeof slotValue === 'string' && typeof childValue === 'string') {
      merged[key] = `${slotValue} ${childValue}`.trim()
    } else if (key === 'style' && typeof slotValue === 'object' && typeof childValue === 'object') {
      merged[key] = { ...(slotValue as object), ...(childValue as object) }
    }
  }

  return merged
}

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children: ReactElement<Record<string, unknown>>
}

export const Slot = forwardRef<HTMLElement, SlotProps>(({ children, ...slotProps }, ref) => {
  if (!isValidElement(children)) return null

  const child = children as ReactElement<Record<string, unknown>> & { ref?: React.Ref<HTMLElement> }

  return cloneElement(child, {
    ...mergeProps(slotProps, child.props),
    ref: ref ? mergeRefs(ref, child.ref) : child.ref,
  })
})

Slot.displayName = 'Slot'
