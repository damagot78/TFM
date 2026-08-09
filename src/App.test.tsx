import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => {
  vi.unstubAllGlobals()
  sessionStorage.clear()
  localStorage.clear()
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

  it('el enlace "Tarifas" de la cabecera muestra el actualizador de tarifas en vez de la calculadora', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ valid: true, agentName: 'Agente 1' }) }),
    )

    render(<App />)
    identify()
    await waitFor(() => expect(screen.getByText('Agente 1')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Tarifas' }))

    expect(screen.getByRole('heading', { name: 'Actualizador de tarifas' })).toBeInTheDocument()
    expect(screen.queryByText('Datos del abonado')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Calculadora' }))

    expect(screen.getByText('Datos del abonado')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Actualizador de tarifas' })).not.toBeInTheDocument()
  })

  it('el enlace "Exportar" de la cabecera muestra la pantalla de exportación a Excel', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ valid: true, agentName: 'Agente 1' }) }),
    )

    render(<App />)
    identify()
    await waitFor(() => expect(screen.getByText('Agente 1')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }))

    expect(screen.getByRole('heading', { name: 'Exportar cotizaciones' })).toBeInTheDocument()
  })

  it('cambiar de pestaña y volver a Calculadora conserva los datos introducidos (regresión)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ valid: true, agentName: 'Agente 1' }) }),
    )

    render(<App />)
    identify()
    await waitFor(() => expect(screen.getByText('Agente 1')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Prueba Reset Bug' } })
    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'sm' } })

    fireEvent.click(screen.getByRole('button', { name: 'Tarifas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Calculadora' }))

    expect(screen.getByLabelText('Nombre')).toHaveValue('Prueba Reset Bug')
    expect(screen.getByLabelText('Modalidad')).toHaveValue('sm')
  })

  it('"Cerrar sesión" borra el borrador de cotización, para que el siguiente agente no vea datos ajenos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ valid: true, agentName: 'Agente 1' }) }),
    )

    render(<App />)
    identify()
    await waitFor(() => expect(screen.getByText('Agente 1')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Prueba Reset Bug' } })

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    identify()
    await waitFor(() => expect(screen.getByText('Agente 1')).toBeInTheDocument())

    expect(screen.getByLabelText('Nombre')).toHaveValue('')
  })
})
