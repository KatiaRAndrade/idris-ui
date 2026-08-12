import { useEffect, useId, type HTMLAttributes } from 'react'
import { useInputContext } from '../Input.context'
import { hint } from '../Input.styles'

export function InputHint({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { invalid, registerDescribedBy } = useInputContext('Hint')
  const hintId = useId()

  useEffect(() => {
    if (invalid) return
    return registerDescribedBy(hintId)
  }, [invalid, hintId, registerDescribedBy])

  if (invalid) return null

  return <p id={hintId} className={hint({ className })} {...props} />
}

InputHint.displayName = 'Input.Hint'
