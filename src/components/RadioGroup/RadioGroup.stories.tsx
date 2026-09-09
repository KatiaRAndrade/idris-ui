import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import * as RadioGroup from './index'

const meta: Meta<typeof RadioGroup.Root> = {
  title: 'Components/RadioGroup',
  component: RadioGroup.Root,
  args: { size: 'md', orientation: 'vertical', disabled: false, invalid: false },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof RadioGroup.Root>

const OPCOES = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'anual', label: 'Anual' },
  { value: 'vitalicio', label: 'Vitalício' },
]

export const Padrao: Story = {
  render: (args) => (
    <RadioGroup.Root {...args} aria-label="Plano" defaultValue="mensal">
      {OPCOES.map(({ value, label }) => (
        <div key={value} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RadioGroup.Item value={value} id={`plano-${value}`}>
            <RadioGroup.Indicator />
          </RadioGroup.Item>
          <label htmlFor={`plano-${value}`} style={{ fontSize: 14 }}>
            {label}
          </label>
        </div>
      ))}
    </RadioGroup.Root>
  ),
}

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <RadioGroup.Root {...args} aria-label="Entrega" defaultValue="padrao">
      {['padrao', 'expressa'].map((value) => (
        <RadioGroup.Item key={value} value={value} aria-label={value}>
          <RadioGroup.Indicator />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  ),
}

export const Tamanhos: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <RadioGroup.Root key={size} {...args} size={size} aria-label={size} defaultValue="a">
          <RadioGroup.Item value="a" aria-label={`${size}-a`}>
            <RadioGroup.Indicator />
          </RadioGroup.Item>
          <RadioGroup.Item value="b" aria-label={`${size}-b`}>
            <RadioGroup.Indicator />
          </RadioGroup.Item>
        </RadioGroup.Root>
      ))}
    </div>
  ),
}

export const ComItemDesabilitado: Story = {
  render: (args) => (
    <RadioGroup.Root {...args} aria-label="Plano" defaultValue="basico">
      {[
        { value: 'basico', label: 'Básico' },
        { value: 'pro', label: 'Pro' },
        { value: 'enterprise', label: 'Enterprise', disabled: true },
      ].map(({ value, label, disabled }) => (
        <div key={value} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RadioGroup.Item value={value} id={`p-${value}`} disabled={disabled}>
            <RadioGroup.Indicator />
          </RadioGroup.Item>
          <label htmlFor={`p-${value}`} style={{ fontSize: 14 }}>
            {label}
          </label>
        </div>
      ))}
    </RadioGroup.Root>
  ),
}

export const Controlado: Story = {
  render: (args) => {
    const [value, setValue] = useState('mensal')
    return (
      <RadioGroup.Root {...args} aria-label="Plano" value={value} onValueChange={setValue}>
        {OPCOES.map(({ value: v, label }) => (
          <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RadioGroup.Item value={v} id={`c-${v}`}>
              <RadioGroup.Indicator />
            </RadioGroup.Item>
            <label htmlFor={`c-${v}`} style={{ fontSize: 14 }}>
              {label}
            </label>
          </div>
        ))}
      </RadioGroup.Root>
    )
  },
}
