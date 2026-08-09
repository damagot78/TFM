import { timingSafeEqual } from 'node:crypto'
import { AGENTS } from '../../src/shared/constants/agents.js'

/** Valor de relleno con la misma longitud que un PIN real, para comparar en tiempo constante aunque el agente no exista. */
const DUMMY_PIN = '0000'

function getConfiguredPin(agentId: string): string | undefined {
  const isKnownAgent = AGENTS.some((agent) => agent.id === agentId)
  if (!isKnownAgent) {
    return undefined
  }
  return process.env[`PIN_${agentId.toUpperCase()}`]
}

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) {
    return false
  }
  return timingSafeEqual(bufferA, bufferB)
}

/**
 * Compara el PIN recibido con el configurado para ese agente en variables de
 * entorno del servidor, con `timingSafeEqual` (nunca `===`). Siempre ejecuta
 * la comparación —incluso si el `agentId` no existe o no tiene PIN
 * configurado, contra un valor dummy— para que el tiempo de respuesta no
 * revele si el `agentId` es válido (regla de seguridad §6 de
 * `docs/reglas-de-negocio.md`, punto 4).
 */
export function isPinValid(agentId: string, pin: string): boolean {
  const configuredPin = getConfiguredPin(agentId)
  const matches = safeCompare(pin, configuredPin ?? DUMMY_PIN)
  return configuredPin !== undefined && matches
}
