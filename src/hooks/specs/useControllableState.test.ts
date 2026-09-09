import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useControllableState } from '../useControllableState'

describe('useControllableState', () => {
  it('atualiza o estado interno quando não-controlado', () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: false }))

    act(() => result.current[1](true))
    expect(result.current[0]).toBe(true)
  })

  it('não atualiza sozinho quando controlado — só avisa via onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useControllableState({ value: false, defaultValue: false, onChange })
    )

    act(() => result.current[1](true))
    expect(result.current[0]).toBe(false) // o consumidor manda no valor
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('aceita função updater', () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 1 }))

    act(() => result.current[1]((prev) => prev + 1))
    expect(result.current[0]).toBe(2)
  })

  it('não dispara onChange quando o valor é o mesmo', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: true, onChange })
    )

    act(() => result.current[1](true))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('avisa ao alternar entre controlado e não-controlado', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = renderHook(
      ({ value }: { value?: boolean }) => useControllableState({ value, defaultValue: false }),
      { initialProps: { value: true as boolean | undefined } }
    )

    rerender({ value: undefined })
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
