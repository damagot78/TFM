import { describe, expect, it } from 'vitest'
import { parseValidatePinPayload } from './parseValidatePinPayload.js'

describe('parseValidatePinPayload', () => {
  it('acepta un payload válido: agentId conocido y PIN de 4 dígitos', () => {
    expect(parseValidatePinPayload({ agentId: 'agent_1', pin: '1234' })).toEqual({
      agentId: 'agent_1',
      pin: '1234',
    })
  })

  it('acepta un agentId con forma válida aunque no exista en el catálogo (esa comprobación es responsabilidad de isPinValid, no de esta función — ver §6 regla 4)', () => {
    expect(parseValidatePinPayload({ agentId: 'not-an-agent', pin: '1234' })).toEqual({
      agentId: 'not-an-agent',
      pin: '1234',
    })
  })

  it('rechaza un agentId vacío', () => {
    expect(parseValidatePinPayload({ agentId: '', pin: '1234' })).toBeNull()
  })

  it('rechaza un PIN que no tiene exactamente 4 dígitos', () => {
    expect(parseValidatePinPayload({ agentId: 'agent_1', pin: '123' })).toBeNull()
    expect(parseValidatePinPayload({ agentId: 'agent_1', pin: '12345' })).toBeNull()
    expect(parseValidatePinPayload({ agentId: 'agent_1', pin: 'abcd' })).toBeNull()
  })

  it('rechaza si falta agentId o pin', () => {
    expect(parseValidatePinPayload({ pin: '1234' })).toBeNull()
    expect(parseValidatePinPayload({ agentId: 'agent_1' })).toBeNull()
  })

  it('rechaza tipos incorrectos (no strings)', () => {
    expect(parseValidatePinPayload({ agentId: 1, pin: '1234' })).toBeNull()
    expect(parseValidatePinPayload({ agentId: 'agent_1', pin: 1234 })).toBeNull()
  })

  it('rechaza cuerpos que no son un objeto', () => {
    expect(parseValidatePinPayload(null)).toBeNull()
    expect(parseValidatePinPayload(undefined)).toBeNull()
    expect(parseValidatePinPayload('agent_1')).toBeNull()
    expect(parseValidatePinPayload(['agent_1', '1234'])).toBeNull()
  })
})
