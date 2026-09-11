import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert } from './index'

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  args: { variant: 'neutral', live: 'off' },
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'error', 'neutral'] },
    live: { control: 'select', options: ['off', 'polite', 'assertive'] },
  },
}
export default meta

type Story = StoryObj<typeof Alert>

// Placeholder — não existe um conjunto de ícones no projeto ainda (seção 6 do doc)
const DotIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="6" />
  </svg>
)

export const Estatico: Story = {
  name: 'Aviso estático (padrão)',
  render: (args) => (
    <Alert {...args} variant="warning" style={{ maxWidth: 380 }}>
      <Alert.Icon>
        <DotIcon />
      </Alert.Icon>
      <div className="flex flex-col gap-1">
        <Alert.Title>Sua assinatura vence em 3 dias</Alert.Title>
        <Alert.Description>
          Renove pra não perder acesso. <a href="/planos">Ver planos</a>
        </Alert.Description>
      </div>
    </Alert>
  ),
}

export const ErroAssertivo: Story = {
  name: 'Erro de validação (assertive)',
  render: () => (
    <Alert variant="error" live="assertive" style={{ maxWidth: 380 }}>
      <Alert.Icon>
        <DotIcon />
      </Alert.Icon>
      <div className="flex flex-col gap-1">
        <Alert.Title>Não foi possível salvar</Alert.Title>
        <Alert.Description>
          <ul className="list-disc pl-4">
            <li>O e-mail já está em uso</li>
            <li>A senha precisa ter 8 caracteres</li>
          </ul>
        </Alert.Description>
      </div>
    </Alert>
  ),
}

export const ConfirmacaoPolite: Story = {
  name: 'Confirmação (polite)',
  render: () => (
    <Alert variant="success" live="polite" style={{ maxWidth: 380 }}>
      <Alert.Icon>
        <DotIcon />
      </Alert.Icon>
      <Alert.Title>Alterações salvas</Alert.Title>
    </Alert>
  ),
}

export const Dispensavel: Story = {
  render: function Render() {
    return (
      <Alert variant="info" onClose={() => alert('Fechou')} style={{ maxWidth: 380 }}>
        <Alert.Icon>
          <DotIcon />
        </Alert.Icon>
        <div className="flex flex-col gap-1">
          <Alert.Title>Novidade: temas claro e escuro</Alert.Title>
          <Alert.Description>Alterne nas configurações da conta.</Alert.Description>
        </div>
        <Alert.Close>×</Alert.Close>
      </Alert>
    )
  },
}

export const Variantes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 380 }}>
      {(['info', 'success', 'warning', 'error', 'neutral'] as const).map((variant) => (
        <Alert key={variant} variant={variant}>
          <Alert.Icon>
            <DotIcon />
          </Alert.Icon>
          <Alert.Title>Variante {variant}</Alert.Title>
        </Alert>
      ))}
    </div>
  ),
}

export const SoTitulo: Story = {
  name: 'Só título, sem ícone',
  render: () => (
    <Alert variant="error" style={{ maxWidth: 380 }}>
      <Alert.Title>Campo obrigatório</Alert.Title>
    </Alert>
  ),
}
