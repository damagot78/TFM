import { useState, type ReactNode } from 'react'
import { AgentSessionContext } from './AgentSessionContextValue'

const SESSION_STORAGE_KEY = 'agm.agentName'

export function AgentSessionProvider({ children }: { children: ReactNode }) {
  const [agentName, setAgentName] = useState<string | null>(() =>
    sessionStorage.getItem(SESSION_STORAGE_KEY),
  )

  function identify(name: string) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, name)
    setAgentName(name)
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    setAgentName(null)
  }

  return (
    <AgentSessionContext.Provider value={{ agentName, identify, signOut }}>
      {children}
    </AgentSessionContext.Provider>
  )
}
