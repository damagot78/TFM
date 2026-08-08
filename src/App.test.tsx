import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => {
  vi.unstubAllGlobals()
  sessionStorage.clear()
})

function identify() {
  fireEvent.change(screen.getByLabelText('Agente'), { target: { value: 'agent_1' } })
  fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '1234' } })
  fireEvent.click(screen.getByRole('button', { name: /Entrar/ }))
}

describe('App', () => {
  it('sin agente identificado, muestra la pantalla de identificación en vez de la calculadora', () => {
    render(<App />)

    expect(screen.getByText('Identificación de personal')).toBeInTheDocument()
    expect(screen.queryByText('Calculadora de Cuotas — Arabella Golf Mallorca')).not.toBeInTheDocument()
  })

  it('tras identificarse, muestra la calculadora con el nombre del agente en la cabecera', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ valid: true, agentName: 'Agente 1' }) }),
    )

    render(<App />)
    identify()

    await waitFor(() =>
      expect(screen.getByText('Calculadora de Cuotas — Arabella Golf Mallorca')).toBeInTheDocument(),
    )
    expect(screen.getByText('Agente 1')).toBeInTheDocument()
  })

  it('"Cerrar sesión" vuelve a mostrar la pantalla de identificación', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ valid: true, agentName: 'Agente 1' }) }),
    )

    render(<App />)
    identify()
    await waitFor(() => expect(screen.getByText('Agente 1')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(screen.getByText('Identificación de personal')).toBeInTheDocument()
  })
})
