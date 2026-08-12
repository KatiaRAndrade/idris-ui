import type { LabelHTMLAttributes } from 'react'
import { useInputContext } from '../Input.context'
import { label as labelStyles } from '../Input.styles'

export function InputLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  const { id } = useInputContext('Label')
  return <label htmlFor={id} className={labelStyles({ className })} {...props} />
}

InputLabel.displayName = 'Input.Label'
