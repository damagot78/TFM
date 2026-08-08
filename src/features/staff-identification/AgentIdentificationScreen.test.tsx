import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgentIdentificationScreen } from './AgentIdentificationScreen'

afterEach(() => {
  vi.unstubAllGlobals()
})

function fillAndSubmit(agentId: string, pin: string) {
  fireEvent.change(screen.getByLabelText('Agente'), { target: { value: agentId } })
  fireEvent.change(screen.getByLabelText('PIN'), { target: { value: pin } })
  fireEvent.click(screen.getByRole('button', { name: /Entrar/ }))
}

describe('AgentIdentificationScreen', () => {
  it('muestra los 4 agentes del catálogo y un campo de PIN enmascarado', () => {
    render(<AgentIdentificationScreen onIdentified={vi.fn()} />)

    expect(screen.getByRole('option', { name: 'Agente 1' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Agente 4' })).toBeInTheDocument()
    expect(screen.getByLabelText('PIN')).toHaveAttribute('type', 'password')
  })

  it('el botón de entrar está deshabilitado hasta elegir agente y escribir un PIN de 4 dígitos', () => {
    render(<AgentIdentificationScreen onIdentified={vi.fn()} />)

    expect(screen.getByRole('button', { name: /Entrar/ })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Agente'), { target: { value: 'agent_1' } })
    expect(screen.getByRole('button', { name: /Entrar/ })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '1234' } })
    expect(screen.getByRole('button', { name: /Entrar/ })).not.toBeDisabled()
  })

  it('con credenciales correctas, llama a onIdentified con el nombre del agente devuelto por el servidor', async () => {
    const onIdentified = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ valid: true, agentName: 'Agente 1' }),
      }),
    )

    render(<AgentIdentificationScreen onIdentified={onIdentified} />)
    fillAndSubmit('agent_1', '1234')

    await waitFor(() => expect(onIdentified).toHaveBeenCalledWith('Agente 1'))
  })

  it('envía la petición al endpoint con el método y el cuerpo correctos', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ valid: true, agentName: 'Agente 1' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<AgentIdentificationScreen onIdentified={vi.fn()} />)
    fillAndSubmit('agent_1', '1234')

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/validate-pin',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ agentId: 'agent_1', pin: '1234' }),
      }),
    )
  })

  it('con credenciales incorrectas, muestra un mensaje de error genérico y no identifica al agente', async () => {
    const onIdentified = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))

    render(<AgentIdentificationScreen onIdentified={onIdentified} />)
    fillAndSubmit('agent_1', '0000')

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(onIdentified).not.toHaveBeenCalled()
  })

  it('si falla la conexión con el servidor, muestra un mensaje distinto de error de red', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    render(<AgentIdentificationScreen onIdentified={vi.fn()} />)
    fillAndSubmit('agent_1', '1234')

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/conexión/i))
  })
})
