import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from '../Checkbox'
import { Switch } from '../Switch'
import { Label } from './index'

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  args: { children: 'E-mail', size: 'md', required: false, disabled: false },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Label>

export const Default: Story = {}

export const Required: Story = {
  args: { required: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Small: Story = {
  args: { size: 'sm', children: 'Preferências avançadas' },
}

export const RotulandoCheckbox: Story = {
  name: 'Rotulando um Checkbox',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Checkbox id="termos">
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
      <Label htmlFor="termos">Li e aceito os termos</Label>
    </div>
  ),
}

export const RotulandoSwitch: Story = {
  name: 'Rotulando um Switch',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 260 }}>
      <Label htmlFor="notif">Notificações por e-mail</Label>
      <Switch id="notif" defaultChecked>
        <Switch.Thumb />
      </Switch>
    </div>
  ),
}

export const CampoObrigatorio: Story = {
  name: 'Campo obrigatório',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Label htmlFor="email" required>
        E-mail
      </Label>
      <input id="email" type="email" required style={{ padding: 8 }} />
    </div>
  ),
}

export const ControleDesabilitado: Story = {
  name: 'Acompanhando um controle desabilitado',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Checkbox id="cupom" disabled>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox>
      <Label htmlFor="cupom" disabled>
        Cupom
      </Label>
    </div>
  ),
}
