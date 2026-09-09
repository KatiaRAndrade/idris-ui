import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from './index'

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: { size: 'md', disabled: false },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Switch>

export const Padrao: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <label htmlFor="notif" style={{ fontSize: 14 }}>
        Notificações por e-mail
      </label>
      <Switch {...args} id="notif" defaultChecked>
        <Switch.Thumb />
      </Switch>
    </div>
  ),
}

export const Tamanhos: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Switch key={size} {...args} size={size} defaultChecked aria-label={size}>
          <Switch.Thumb />
        </Switch>
      ))}
    </div>
  ),
}

export const Estados: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Switch {...args} aria-label="Desligado">
        <Switch.Thumb />
      </Switch>
      <Switch {...args} defaultChecked aria-label="Ligado">
        <Switch.Thumb />
      </Switch>
      <Switch {...args} disabled aria-label="Desabilitado">
        <Switch.Thumb />
      </Switch>
      <Switch {...args} disabled defaultChecked aria-label="Desabilitado ligado">
        <Switch.Thumb />
      </Switch>
    </div>
  ),
}

export const Controlado: Story = {
  render: (args) => {
    const [ligado, setLigado] = useState(false)
    return (
      <Switch {...args} checked={ligado} onCheckedChange={setLigado} aria-label="Tema escuro">
        <Switch.Thumb />
      </Switch>
    )
  },
}
