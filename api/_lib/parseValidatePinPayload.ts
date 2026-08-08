const PIN_PATTERN = /^\d{4}$/

export interface ValidatePinRequestBody {
  agentId: string
  pin: string
}

/**
 * Valida únicamente la FORMA del payload (tipos, longitud del PIN) — nunca
 * si el `agentId` corresponde a un agente real. Esa comprobación se hace más
 * tarde, junto con el PIN, para que un `agentId` inexistente y un PIN
 * incorrecto den la misma respuesta (401, mismo mensaje) y no se puedan
 * distinguir por el código de estado (regla de seguridad §6, punto 4).
 */
export function parseValidatePinPayload(body: unknown): ValidatePinRequestBody | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return null
  }

  const { agentId, pin } = body as Record<string, unknown>

  if (typeof agentId !== 'string' || agentId.length === 0) {
    return null
  }

  if (typeof pin !== 'string' || !PIN_PATTERN.test(pin)) {
    return null
  }

  return { agentId, pin }
}
