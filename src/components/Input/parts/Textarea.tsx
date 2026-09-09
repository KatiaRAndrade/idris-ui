import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactElement,
  type TextareaHTMLAttributes,
} from 'react'
import { Slot } from '../../../primitives/Slot'
import { useInputContext } from '../Input.context'
import { textarea } from '../Input.styles'

export interface InputTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  asChild?: boolean
  /** Cresce em altura conforme o conteúdo. Custa um reflow por digitação — ver seção 3. */
  autoResize?: boolean
  resize?: 'none' | 'vertical'
}

export const InputTextarea = forwardRef<HTMLTextAreaElement, InputTextareaProps>(
  (
    { className, asChild, autoResize = false, resize, rows = 3, disabled, onInput, ...props },
    forwardedRef
  ) => {
    const {
      id,
      size,
      disabled: rootDisabled,
      invalid,
      describedByIds,
    } = useInputContext('Textarea')

    const innerRef = useRef<HTMLTextAreaElement | null>(null)

    const adjustHeight = useCallback(() => {
      const el = innerRef.current
      if (!el || !autoResize) return
      // Zera antes de medir: senão scrollHeight nunca diminui ao apagar texto
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [autoResize])

    // useLayoutEffect e não useEffect: ajusta a altura antes do navegador pintar,
    // senão o campo aparece com a altura errada por um frame ao montar com valor inicial
    useLayoutEffect(adjustHeight, [adjustHeight, props.value, props.defaultValue])

    const sharedProps = {
      id,
      rows,
      'data-size': size,
      'data-invalid': invalid || undefined,
      disabled: disabled ?? rootDisabled,
      'aria-invalid': invalid || undefined,
      'aria-describedby': describedByIds.length ? describedByIds.join(' ') : undefined,
      className: textarea({ size, invalid, resize, autoResize, className }),
    }

    if (asChild) {
      const { children, ...rest } = props
      return (
        <Slot ref={forwardedRef} {...sharedProps} {...rest}>
          {children as ReactElement<Record<string, unknown>>}
        </Slot>
      )
    }

    return (
      <textarea
        ref={(node) => {
          innerRef.current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) forwardedRef.current = node
        }}
        onInput={(event) => {
          onInput?.(event)
          adjustHeight()
        }}
        {...sharedProps}
        {...props}
      />
    )
  }
)

InputTextarea.displayName = 'Input.Textarea'
