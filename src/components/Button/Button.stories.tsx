import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './index'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { variant: 'primary', size: 'md' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'metallic', 'metallic-gold'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { variant: 'primary' },
  render: (args) => (
    <Button {...args}>
      <Button.Label>Button</Button.Label>
    </Button>
  ),
}

export const Secondary: Story = {
  args: { variant: 'secondary' },
  render: (args) => (
    <Button {...args}>
      <Button.Label>Button</Button.Label>
    </Button>
  ),
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
  render: (args) => (
    <Button {...args}>
      <Button.Label>Button</Button.Label>
    </Button>
  ),
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <Button {...args}>
      <Button.Label>Button</Button.Label>
    </Button>
  ),
}

export const Metallic: Story = {
  args: { variant: 'metallic' },
  render: (args) => (
    <Button {...args}>
      <Button.Label>Button</Button.Label>
    </Button>
  ),
}

export const MetallicGold: Story = {
  args: { variant: 'metallic-gold' },
  render: (args) => (
    <Button {...args}>
      <Button.Label>Button</Button.Label>
    </Button>
  ),
}

export const Loading: Story = {
  args: { loading: true },
  render: (args) => (
    <Button {...args}>
      <Button.Label>Button</Button.Label>
    </Button>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Button {...args}>
      <Button.Label>Button</Button.Label>
    </Button>
  ),
}

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Button.Content>
        <Button.Icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button.Icon>
        <Button.Label>Adicionar item</Button.Label>
      </Button.Content>
    </Button>
  ),
}

export const IconOnly: Story = {
  args: { variant: 'ghost', size: 'sm' },
  render: (args) => (
    <Button {...args} aria-label="Fechar">
      <Button.Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button.Icon>
    </Button>
  ),
}
