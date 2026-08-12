import { forwardRef, useCallback, useId, useMemo, useState, type HTMLAttributes } from 'react'
import { InputContext, type InputSize } from './Input.context'
import { root } from './Input.styles'

export interface InputRootProps extends HTMLAttributes<HTMLDivElement> {
  size?: InputSize
  disabled?: boolean
  invalid?: boolean
}

export const InputRoot = forwardRef<HTMLDivElement, InputRootProps>(
  ({ className, size = 'md', disabled = false, invalid = false, children, ...props }, ref) => {
    const id = useId()
    const [describedByIds, setDescribedByIds] = useState<string[]>([])

    const registerDescribedBy = useCallback((descId: string) => {
      setDescribedByIds((prev) => (prev.includes(descId) ? prev : [...prev, descId]))
      return () => setDescribedByIds((prev) => prev.filter((i) => i !== descId))
    }, [])

    const value = useMemo(
      () => ({ id, size, disabled, invalid, describedByIds, registerDescribedBy }),
      [id, size, disabled, invalid, describedByIds, registerDescribedBy]
    )

    return (
      <InputContext.Provider value={value}>
        <div
          ref={ref}
          data-size={size}
          data-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          className={root({ className })}
          {...props}
        >
          {children}
        </div>
      </InputContext.Provider>
    )
  }
)

InputRoot.displayName = 'Input.Root'
