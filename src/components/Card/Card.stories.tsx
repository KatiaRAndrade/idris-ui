import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './index'
import { Button } from '../Button'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: { variant: 'default', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'elevated'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta

type Story = StoryObj<typeof Card>

export const Completo: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <Card.Header>
        <Card.Title>Plano Pro</Card.Title>
        <Card.Description>Pra quem já usa o Idris no dia a dia.</Card.Description>
      </Card.Header>
      <Card.Content>
        <p>Componentes ilimitados, temas dark/light, suporte a asChild em tudo.</p>
      </Card.Content>
      <Card.Footer>
        <Button variant="ghost" size="sm">
          <Button.Label>Cancelar</Button.Label>
        </Button>
        <Button variant="primary" size="sm">
          <Button.Label>Assinar</Button.Label>
        </Button>
      </Card.Footer>
    </Card>
  ),
}

export const Elevated: Story = {
  args: { variant: 'elevated' },
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <Card.Header>
        <Card.Title>Card elevado</Card.Title>
        <Card.Description>Fundo surface-elevated pra destacar sobre a seção.</Card.Description>
      </Card.Header>
      <Card.Content>
        <p>Use quando o card precisa saltar sobre outros cards.</p>
      </Card.Content>
    </Card>
  ),
}

export const Clicavel: Story = {
  args: { variant: 'elevated' },
  render: (args) => (
    <Card {...args} asChild style={{ maxWidth: 360 }}>
      <a href="#post">
        <Card.Header>
          <Card.Title asChild>
            <h2>Como construímos o Idris</h2>
          </Card.Title>
          <Card.Description>
            Um design system do zero, com tokens, Slot próprio e testes.
          </Card.Description>
        </Card.Header>
      </a>
    </Card>
  ),
}

export const SoConteudo: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <Card.Content>Aviso rápido, sem título.</Card.Content>
    </Card>
  ),
}
