import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import * as Dialog from '../index'

function Setup(props: Dialog.DialogRootProps = {}) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger>Abrir</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Editar perfil</Dialog.Title>
          <Dialog.Description>Descrição do dialog</Dialog.Description>
          <button>campo</button>
          <Dialog.Close>Cancelar</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

describe('Dialog', () => {
  it('abre pelo Trigger e fecha pelo Close', async () => {
    render(<Setup />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Abrir'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('associa título e descrição via aria', async () => {
    render(<Setup defaultOpen />)
    const dialog = screen.getByRole('dialog')

    expect(dialog).toHaveAttribute('aria-labelledby', screen.getByText('Editar perfil').id)
    expect(dialog).toHaveAttribute('aria-describedby', screen.getByText('Descrição do dialog').id)
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('não declara aria-labelledby quando não há Title', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Content>sem título</Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )

    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby')
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('fecha no Escape', async () => {
    render(<Setup defaultOpen />)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('fecha no clique fora', async () => {
    render(<Setup defaultOpen />)
    await userEvent.click(document.body)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('não fecha no clique fora quando disableOutsideClose', async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Content disableOutsideClose>
            <Dialog.Title>Confirmar</Dialog.Title>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )

    await userEvent.click(document.body)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('devolve o foco pro trigger ao fechar', async () => {
    render(<Setup />)
    const trigger = screen.getByText('Abrir')

    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')

    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('no modo controlado, só avisa via onOpenChange', async () => {
    const onOpenChange = vi.fn()
    render(<Setup open={false} onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByText('Abrir'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('não renderiza overlay quando modal é false', () => {
    const { container } = render(<Setup defaultOpen modal={false} />)
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal')
    expect(container.querySelector('[data-state][aria-hidden]')).not.toBeInTheDocument()
  })

  it('lança erro se uma parte for usada fora do Root', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Dialog.Title>Solto</Dialog.Title>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { baseElement } = render(<Setup defaultOpen />)
    // baseElement e não container: o conteúdo vive no portal, fora do container
    expect(baseElement).toMatchSnapshot()
  })
})
