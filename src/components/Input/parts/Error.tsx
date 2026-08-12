import { useEffect, useId, type HTMLAttributes } from 'react'
import { useInputContext } from '../Input.context'
import { error as errorStyles } from '../Input.styles'

export function InputError({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { invalid, registerDescribedBy } = useInputContext('Error')
  const errorId = useId()

  useEffect(() => {
    if (!invalid) return
    return registerDescribedBy(errorId)
  }, [invalid, errorId, registerDescribedBy])

  if (!invalid) return null

  return <p id={errorId} role="alert" className={errorStyles({ className })} {...props} />
}

InputError.displayName = 'Input.Error'
