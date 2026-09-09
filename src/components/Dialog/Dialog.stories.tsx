import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Dialog from './index'
import { Button } from '../Button'
import * as Input from '../Input'

const CloseIcon = (props: { width?: number; height?: number }) => (
  <svg viewBox="0 0 16 16" fill="none" width={16} height={16} {...props}>
    <path
      d="M12 4 4 12M4 4l8 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const meta: Meta<typeof Dialog.Content> = {
  title: 'Components/Dialog',
  component: Dialog.Content,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'full'] },
  },
}
export default meta

type Story = StoryObj<typeof Dialog.Content>

export const Padrao: Story = {
  args: { size: 'md' },
  render: (args) => (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="primary">
          <Button.Label>Editar perfil</Button.Label>
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content {...args}>
          <div className={Dialog.HeaderStyles()}>
            <Dialog.Title>Editar perfil</Dialog.Title>
            <Dialog.Description>Suas mudanças aparecem imediatamente.</Dialog.Description>
          </div>

          <div className={Dialog.BodyStyles()}>
            <Input.Root>
              <Input.Label>Nome</Input.Label>
              <Input.Field defaultValue="Ka" />
            </Input.Root>
          </div>

          <div className={Dialog.FooterStyles()}>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">
                <Button.Label>Cancelar</Button.Label>
              </Button>
            </Dialog.Close>
            <Button variant="primary" size="sm">
              <Button.Label>Salvar</Button.Label>
            </Button>
          </div>

          <Dialog.Close className={Dialog.CloseStyles()} aria-label="Fechar">
            <CloseIcon />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  ),
}

export const ConfirmacaoDestrutiva: Story = {
  name: 'Confirmação destrutiva',
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="destructive" size="sm">
          <Button.Label>Excluir conta</Button.Label>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content size="sm" disableOutsideClose>
          <div className={Dialog.HeaderStyles()}>
            <Dialog.Title>Excluir conta?</Dialog.Title>
            <Dialog.Description>Essa ação é permanente.</Dialog.Description>
          </div>
          <div className={Dialog.FooterStyles()}>
            <Dialog.Close asChild>
              <Button variant="secondary" size="sm">
                <Button.Label>Cancelar</Button.Label>
              </Button>
            </Dialog.Close>
            <Button variant="destructive" size="sm">
              <Button.Label>Excluir</Button.Label>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  ),
}
