import { useState, type FormEvent } from 'react'
import type { AgentId } from '../../shared/types/staff'
import { AGENTS } from '../../shared/constants/agents'

const GENERIC_ERROR_MESSAGE = 'Agente o PIN incorrectos.'
const NETWORK_ERROR_MESSAGE = 'Error de conexión. Inténtalo de nuevo.'
const PIN_LENGTH = 4

interface ValidatePinSuccessBody {
  valid: true
  agentName: string
}

interface AgentIdentificationScreenProps {
  onIdentified: (agentName: string) => void
}

export function AgentIdentificationScreen({ onIdentified }: AgentIdentificationScreenProps) {
  const [agentId, setAgentId] = useState<AgentId | ''>('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/validate-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, pin }),
      })

      if (!response.ok) {
        setError(GENERIC_ERROR_MESSAGE)
        return
      }

      const data = (await response.json()) as ValidatePinSuccessBody
      onIdentified(data.agentName)
    } catch (error) {
      console.error('Error al validar el PIN de personal', error)
      setError(NETWORK_ERROR_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = agentId !== '' && pin.length === PIN_LENGTH && !isSubmitting

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <h1 className="text-lg font-semibold text-gray-900">Identificación de personal</h1>

        <div className="flex flex-col gap-1">
          <label htmlFor="agent-select" className="text-sm font-medium text-gray-700">
            Agente
          </label>
          <select
            id="agent-select"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={agentId}
            onChange={(event) => setAgentId(event.target.value as AgentId)}
          >
            <option value="" disabled>
              Selecciona tu nombre…
            </option>
            {AGENTS.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="agent-pin" className="text-sm font-medium text-gray-700">
            PIN
          </label>
          <input
            id="agent-pin"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={PIN_LENGTH}
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Comprobando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
