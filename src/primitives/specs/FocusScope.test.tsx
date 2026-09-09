import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useState } from 'react'
import { FocusScope } from '../FocusScope'

describe('FocusScope', () => {
  it('foca o primeiro elemento focável ao montar', () => {
    render(
      <FocusScope>
        <button>primeiro</button>
        <button>segundo</button>
      </FocusScope>
    )
    expect(screen.getByText('primeiro')).toHaveFocus()
  })

  it('prende o Tab dentro do escopo', async () => {
    render(
      <FocusScope>
        <button>primeiro</button>
        <button>último</button>
      </FocusScope>
    )

    await userEvent.tab() // primeiro → último
    expect(screen.getByText('último')).toHaveFocus()

    await userEvent.tab() // último → dá a volta pro primeiro
    expect(screen.getByText('primeiro')).toHaveFocus()
  })

  it('volta pro último com Shift+Tab a partir do primeiro', async () => {
    render(
      <FocusScope>
        <button>primeiro</button>
        <button>último</button>
      </FocusScope>
    )

    await userEvent.tab({ shift: true })
    expect(screen.getByText('último')).toHaveFocus()
  })

  it('devolve o foco ao desmontar', async () => {
    function Exemplo() {
      const [aberto, setAberto] = useState(false)
      return (
        <>
          <button onClick={() => setAberto(true)}>abrir</button>
          {aberto && (
            <FocusScope>
              <button onClick={() => setAberto(false)}>fechar</button>
            </FocusScope>
          )}
        </>
      )
    }

    render(<Exemplo />)
    await userEvent.click(screen.getByText('abrir'))
    expect(screen.getByText('fechar')).toHaveFocus()

    await userEvent.click(screen.getByText('fechar'))
    expect(screen.getByText('abrir')).toHaveFocus()
  })

  it('não prende o Tab quando trapped é false', async () => {
    render(
      <>
        <FocusScope trapped={false}>
          <button>dentro</button>
        </FocusScope>
        <button>fora</button>
      </>
    )

    await userEvent.tab()
    expect(screen.getByText('fora')).toHaveFocus()
  })
})
