import { AGENTS } from '../src/shared/constants/agents.js'
import { isPinValid } from './_lib/isPinValid'
import { parseValidatePinPayload } from './_lib/parseValidatePinPayload'

const GENERIC_INVALID_MESSAGE = 'PIN inválido'

function jsonResponse(status: number, body: unknown, extraHeaders?: Record<string, string>): Response {
  return Response.json(body, { status, headers: extraHeaders })
}

/**
 * POST /api/validate-pin — valida el PIN de un agente sin exponer nunca si
 * el fallo fue un PIN incorrecto o un agente inexistente (mismo 401, mismo
 * mensaje). Especificación completa en `docs/reglas-de-negocio.md` §6.
 */
export default async function handler(request: Request): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return jsonResponse(405, { error: 'Método no permitido' }, { Allow: 'POST' })
    }

    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return jsonResponse(400, { error: 'Payload inválido' })
    }

    const payload = parseValidatePinPayload(rawBody)
    if (!payload) {
      return jsonResponse(400, { error: 'Payload inválido' })
    }

    if (!isPinValid(payload.agentId, payload.pin)) {
      console.warn(
        `[validate-pin] intento fallido — agentId=${payload.agentId} timestamp=${new Date().toISOString()}`,
      )
      return jsonResponse(401, { error: GENERIC_INVALID_MESSAGE })
    }

    const agent = AGENTS.find((a) => a.id === payload.agentId)
    if (!agent) {
      // No debería ocurrir: isPinValid ya exige que el agente exista para devolver true.
      // Se deniega igualmente (fail secure) en vez de asumir nada.
      return jsonResponse(401, { error: GENERIC_INVALID_MESSAGE })
    }

    return jsonResponse(200, { valid: true, agentName: agent.name })
  } catch (error) {
    console.error('[validate-pin] error inesperado', error)
    return jsonResponse(500, { error: 'Error interno' })
  }
}
