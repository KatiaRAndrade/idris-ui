import type { Meta, StoryObj } from '@storybook/react-vite'
import * as Input from './index'

const meta: Meta<typeof Input.Root> = {
  title: 'Components/Input',
  component: Input.Root,
  args: { size: 'md' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Input.Root>

export const WithHint: Story = {
  render: (args) => (
    <Input.Root {...args}>
      <Input.Label>E-mail</Input.Label>
      <Input.Field type="email" placeholder="voce@exemplo.com" />
      <Input.Hint>Usamos isso só pra recuperação de conta.</Input.Hint>
    </Input.Root>
  ),
}

export const Invalid: Story = {
  args: { invalid: true, size: 'sm' },
  render: (args) => (
    <Input.Root {...args}>
      <Input.Label>Senha</Input.Label>
      <Input.Field type="password" />
      <Input.Error>A senha precisa ter no mínimo 8 caracteres.</Input.Error>
    </Input.Root>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Input.Root {...args}>
      <Input.Label>Cupom</Input.Label>
      <Input.Field value="EXPIRADO10" readOnly />
    </Input.Root>
  ),
}

export const Textarea: Story = {
  render: (args) => (
    <Input.Root {...args}>
      <Input.Label>Descrição</Input.Label>
      <Input.Textarea rows={4} placeholder="Conte um pouco sobre o projeto…" />
      <Input.Hint>Aparece na listagem pública.</Input.Hint>
    </Input.Root>
  ),
}

export const TextareaAutoResize: Story = {
  name: 'Textarea (autoResize)',
  render: (args) => (
    <Input.Root {...args} size="sm">
      <Input.Label>Comentário</Input.Label>
      <Input.Textarea autoResize rows={1} className="max-h-40" />
    </Input.Root>
  ),
}

export const TextareaInvalid: Story = {
  name: 'Textarea (inválido)',
  args: { invalid: true },
  render: (args) => (
    <Input.Root {...args}>
      <Input.Label>Motivo do cancelamento</Input.Label>
      <Input.Textarea />
      <Input.Error>Explique em pelo menos 20 caracteres.</Input.Error>
    </Input.Root>
  ),
}
