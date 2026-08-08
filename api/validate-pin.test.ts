import { afterEach, describe, expect, it, vi } from 'vitest'
import handler from './validate-pin'

function postRequest(body: unknown): Request {
  return new Request('http://localhost/api/validate-pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('POST /api/validate-pin', () => {
  it('rechaza métodos que no sean POST con 405 y cabecera Allow', async () => {
    const request = new Request('http://localhost/api/validate-pin', { method: 'GET' })

    const response = await handler(request)

    expect(response.status).toBe(405)
    expect(response.headers.get('Allow')).toBe('POST')
  })

  it('rechaza un cuerpo que no es JSON válido con 400', async () => {
    const request = new Request('http://localhost/api/validate-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ esto no es json',
    })

    const response = await handler(request)

    expect(response.status).toBe(400)
  })

  it('rechaza un payload con forma inválida con 400', async () => {
    const response = await handler(postRequest({ agentId: 'agent_1' })) // falta pin

    expect(response.status).toBe(400)
  })

  it('con agente y PIN correctos, responde 200 con valid:true y el nombre del agente', async () => {
    vi.stubEnv('PIN_AGENT_1', '4321')

    const response = await handler(postRequest({ agentId: 'agent_1', pin: '4321' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ valid: true, agentName: 'Agente 1' })
  })

  it('con PIN incorrecto para un agente real, responde 401 con mensaje genérico', async () => {
    vi.stubEnv('PIN_AGENT_1', '4321')

    const response = await handler(postRequest({ agentId: 'agent_1', pin: '0000' }))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'PIN inválido' })
  })

  it('con un agentId que no existe (pero con forma válida), responde 401 con el MISMO mensaje que un PIN incorrecto', async () => {
    const response = await handler(postRequest({ agentId: 'agent_99', pin: '0000' }))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'PIN inválido' })
  })

  it('la respuesta nunca incluye el PIN recibido', async () => {
    vi.stubEnv('PIN_AGENT_1', '4321')

    const response = await handler(postRequest({ agentId: 'agent_1', pin: '0000' }))
    const text = await response.text()

    expect(text).not.toContain('0000')
  })

  it('registra en consola el intento fallido sin incluir el PIN', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await handler(postRequest({ agentId: 'agent_1', pin: '9999' }))

    expect(warnSpy).toHaveBeenCalled()
    const loggedMessages = warnSpy.mock.calls.map((call) => call.join(' ')).join(' ')
    expect(loggedMessages).not.toContain('9999')
  })

  it('fail secure: un fallo inesperado nunca deja pasar la petición (500, no 200)', async () => {
    vi.stubEnv('PIN_AGENT_1', '4321')
    // Solo la primera respuesta (la del éxito) falla; la del catch (500) usa la implementación real.
    vi.spyOn(Response, 'json').mockImplementationOnce(() => {
      throw new Error('fallo inesperado simulado')
    })

    const response = await handler(postRequest({ agentId: 'agent_1', pin: '4321' }))

    expect(response.status).toBe(500)
  })
})
