import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './index'

const CheckIcon = (props: { width?: number; height?: number }) => (
  <svg viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M13 4.5 6.5 11 3 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CloseIcon = (props: { width?: number; height?: number }) => (
  <svg viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M12 4 4 12M4 4l8 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const VARIANTS = ['neutral', 'brand', 'accent', 'success', 'warning', 'error', 'info'] as const

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: { variant: 'neutral', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: ['sm', 'md'] },
  },
}
export default meta

type Story = StoryObj<typeof Badge>

export const Padrao: Story = {
  render: (args) => (
    <Badge {...args}>
      <Badge.Label>Novo</Badge.Label>
    </Badge>
  ),
}

export const ComIcone: Story = {
  args: { variant: 'success' },
  render: (args) => (
    <Badge {...args}>
      <Badge.Icon>
        <CheckIcon />
      </Badge.Icon>
      <Badge.Label>Ativo</Badge.Label>
    </Badge>
  ),
}

export const TodasAsVariantes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {VARIANTS.map((variant) => (
        <Badge key={variant} {...args} variant={variant}>
          <Badge.Label>{variant}</Badge.Label>
        </Badge>
      ))}
    </div>
  ),
}

export const Tamanhos: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Badge {...args} size="sm" variant="brand">
        <Badge.Label>sm</Badge.Label>
      </Badge>
      <Badge {...args} size="md" variant="brand">
        <Badge.Label>md</Badge.Label>
      </Badge>
    </div>
  ),
}

export const FiltroRemovivel: Story = {
  render: (args) => (
    <Badge {...args} asChild variant="neutral" size="sm">
      <button type="button" onClick={() => {}}>
        <Badge.Label>Categoria: Roupas</Badge.Label>
        <Badge.Icon>
          <CloseIcon />
        </Badge.Icon>
      </button>
    </Badge>
  ),
}
