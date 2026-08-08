import { useContext } from 'react'
import { AgentSessionContext, type AgentSessionContextValue } from './AgentSessionContextValue'

/** Agente identificado en la sesión actual del navegador. Nunca guarda el PIN, solo el nombre ya validado por el servidor. */
export function useAgentSession(): AgentSessionContextValue {
  const context = useContext(AgentSessionContext)
  if (!context) {
    throw new Error('useAgentSession debe usarse dentro de <AgentSessionProvider>.')
  }
  return context
}
