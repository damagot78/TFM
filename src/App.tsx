import { AgentSessionProvider } from './context/AgentSessionContext'
import { useAgentSession } from './context/useAgentSession'
import { QuoteForm } from './features/quote-calculator/components/QuoteForm'
import { AgentIdentificationScreen } from './features/staff-identification/AgentIdentificationScreen'

function AppContent() {
  const { agentName, identify, signOut } = useAgentSession()

  if (!agentName) {
    return <AgentIdentificationScreen onIdentified={identify} />
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Calculadora de Cuotas — Arabella Golf Mallorca</h1>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{agentName}</span>
          <button type="button" onClick={signOut} className="text-gray-500 underline hover:text-gray-700">
            Cerrar sesión
          </button>
        </div>
      </header>
      <QuoteForm />
    </main>
  )
}

function App() {
  return (
    <AgentSessionProvider>
      <AppContent />
    </AgentSessionProvider>
  )
}

export default App
