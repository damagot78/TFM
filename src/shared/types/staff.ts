export type AgentId = 'agent_1' | 'agent_2' | 'agent_3' | 'agent_4'

/** Información pública de un agente (nombre para mostrar en la UI). El PIN nunca vive aquí ni en el cliente. */
export interface Agent {
  id: AgentId
  name: string
}
