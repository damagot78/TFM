import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AgentSessionProvider } from './AgentSessionContext'
import { useAgentSession } from './useAgentSession'

afterEach(() => {
  sessionStorage.clear()
})

describe('AgentSessionContext', () => {
  it('empieza sin agente identificado si sessionStorage está vacío', () => {
    const { result } = renderHook(() => useAgentSession(), { wrapper: AgentSessionProvider })

    expect(result.current.agentName).toBeNull()
  })

  it('identify() guarda el nombre del agente en el estado y en sessionStorage', () => {
    const { result } = renderHook(() => useAgentSession(), { wrapper: AgentSessionProvider })

    act(() => result.current.identify('Agente 1'))

    expect(result.current.agentName).toBe('Agente 1')
    expect(sessionStorage.getItem('agm.agentName')).toBe('Agente 1')
  })

  it('al montar de nuevo, restaura el agente ya identificado desde sessionStorage', () => {
    sessionStorage.setItem('agm.agentName', 'Agente 2')

    const { result } = renderHook(() => useAgentSession(), { wrapper: AgentSessionProvider })

    expect(result.current.agentName).toBe('Agente 2')
  })

  it('signOut() limpia el estado y sessionStorage', () => {
    const { result } = renderHook(() => useAgentSession(), { wrapper: AgentSessionProvider })

    act(() => result.current.identify('Agente 1'))
    act(() => result.current.signOut())

    expect(result.current.agentName).toBeNull()
    expect(sessionStorage.getItem('agm.agentName')).toBeNull()
  })

  it('useAgentSession lanza un error si se usa fuera de AgentSessionProvider', () => {
    expect(() => renderHook(() => useAgentSession())).toThrow()
  })
})
