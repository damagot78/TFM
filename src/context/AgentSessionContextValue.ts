import { createContext } from 'react'

export interface AgentSessionContextValue {
  agentName: string | null
  identify: (agentName: string) => void
  signOut: () => void
}

export const AgentSessionContext = createContext<AgentSessionContextValue | undefined>(undefined)
