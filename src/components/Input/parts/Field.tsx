import { forwardRef, type InputHTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useInputContext } from '../Input.context'
import { field } from '../Input.styles'

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, asChild, disabled, ...props }, ref) => {
    const { id, size, disabled: rootDisabled, invalid, describedByIds } = useInputContext('Field')
    const sharedProps = {
      id,
      'data-size': size,
      'data-invalid': invalid || undefined,
      disabled: disabled ?? rootDisabled,
      'aria-invalid': invalid || undefined,
      'aria-describedby': describedByIds.length ? describedByIds.join(' ') : undefined,
      className: field({ size, invalid, className }),
    }

    if (asChild) {
      const { children, ...rest } = props
      return (
        <Slot ref={ref} {...sharedProps} {...rest}>
          {children as ReactElement<Record<string, unknown>>}
        </Slot>
      )
    }

    return <input ref={ref} {...sharedProps} {...props} />
  }
)

InputField.displayName = 'Input.Field'
