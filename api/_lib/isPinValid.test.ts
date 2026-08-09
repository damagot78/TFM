import { afterEach, describe, expect, it, vi } from 'vitest'
import { isPinValid } from './isPinValid.js'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('isPinValid', () => {
  it('devuelve true si el PIN coincide con el configurado para ese agente', () => {
    vi.stubEnv('PIN_AGENT_1', '4321')

    expect(isPinValid('agent_1', '4321')).toBe(true)
  })

  it('devuelve false si el PIN no coincide', () => {
    vi.stubEnv('PIN_AGENT_1', '4321')

    expect(isPinValid('agent_1', '0000')).toBe(false)
  })

  it('devuelve false si el agente no tiene PIN configurado, aunque el PIN "adivine" el valor dummy interno', () => {
    // No se configura PIN_AGENT_2 a propósito.
    expect(isPinValid('agent_2', '0000')).toBe(false)
  })

  it('devuelve false para un agentId que no existe en el catálogo, sin lanzar', () => {
    expect(isPinValid('not-an-agent', '0000')).toBe(false)
  })

  it('el PIN de un agente no sirve para identificar a otro', () => {
    vi.stubEnv('PIN_AGENT_1', '4321')
    vi.stubEnv('PIN_AGENT_2', '1111')

    expect(isPinValid('agent_2', '4321')).toBe(false)
  })
})
