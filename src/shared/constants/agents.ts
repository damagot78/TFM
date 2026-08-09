import type { Agent } from '../types/staff.js'

/**
 * Lista fija de agentes (nombres de marcador de posición — sustituir por el
 * personal real de Arabella Golf Mallorca antes de desplegar a producción).
 * El PIN de cada agente vive únicamente en variables de entorno del
 * servidor (`PIN_<ID EN MAYÚSCULAS>`), nunca en este archivo ni en el cliente.
 */
export const AGENTS: readonly Agent[] = [
  { id: 'agent_1', name: 'Agente 1' },
  { id: 'agent_2', name: 'Agente 2' },
  { id: 'agent_3', name: 'Agente 3' },
  { id: 'agent_4', name: 'Agente 4' },
]
