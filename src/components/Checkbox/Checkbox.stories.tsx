import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from './index'
import type { CheckedState } from './Checkbox.context'

const CheckIcon = (props: { width?: number; height?: number }) => (
  <svg viewBox="0 0 16 16" fill="none" width={12} height={12} {...props}>
    <path
      d="M13 4.5 6.5 11 3 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const MinusIcon = (props: { width?: number; height?: number }) => (
  <svg viewBox="0 0 16 16" fill="none" width={12} height={12} {...props}>
    <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { size: 'md', invalid: false, disabled: false },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Checkbox>

export const Padrao: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Checkbox {...args} id="termos" aria-label="Aceitar os termos">
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox>
      <label htmlFor="termos" style={{ fontSize: 14 }}>
        Li e aceito os termos
      </label>
    </div>
  ),
}

export const Marcado: Story = {
  args: { defaultChecked: true },
  render: (args) => (
    <Checkbox {...args} aria-label="Marcado">
      <Checkbox.Indicator>
        <CheckIcon />
      </Checkbox.Indicator>
    </Checkbox>
  ),
}

export const Indeterminado: Story = {
  args: { defaultChecked: 'indeterminate' },
  render: (args) => (
    <Checkbox {...args} aria-label="Parcial">
      <Checkbox.Indicator indeterminate={<MinusIcon />}>
        <CheckIcon />
      </Checkbox.Indicator>
    </Checkbox>
  ),
}

export const Tamanhos: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Checkbox key={size} {...args} size={size} defaultChecked aria-label={size}>
          <Checkbox.Indicator>
            <CheckIcon />
          </Checkbox.Indicator>
        </Checkbox>
      ))}
    </div>
  ),
}

export const Estados: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Checkbox {...args} invalid aria-label="Inválido">
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox>
      <Checkbox {...args} disabled aria-label="Desabilitado">
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox>
      <Checkbox {...args} disabled defaultChecked aria-label="Desabilitado marcado">
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox>
    </div>
  ),
}

export const Controlado: Story = {
  render: (args) => {
    const [checked, setChecked] = useState<CheckedState>(false)
    return (
      <Checkbox {...args} checked={checked} onCheckedChange={setChecked} aria-label="Controlado">
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox>
    )
  },
}
