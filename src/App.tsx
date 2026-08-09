import { useState } from 'react'
import { AgentSessionProvider } from './context/AgentSessionContext'
import { useAgentSession } from './context/useAgentSession'
import { QuoteForm } from './features/quote-calculator/components/QuoteForm'
import { AgentIdentificationScreen } from './features/staff-identification/AgentIdentificationScreen'
import { TariffAdminScreen } from './features/tariff-admin/TariffAdminScreen'
import { ExcelExportScreen } from './features/excel-export/ExcelExportScreen'

type View = 'quote' | 'tariffs' | 'export'

function AppContent() {
  const { agentName, identify, signOut } = useAgentSession()
  const [view, setView] = useState<View>('quote')

  if (!agentName) {
    return <AgentIdentificationScreen onIdentified={identify} />
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-gray-900">Calculadora de Cuotas — Arabella Golf Mallorca</h1>
          <nav className="flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => setView('quote')}
              className={view === 'quote' ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'}
            >
              Calculadora
            </button>
            <button
              type="button"
              onClick={() => setView('tariffs')}
              className={view === 'tariffs' ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'}
            >
              Tarifas
            </button>
            <button
              type="button"
              onClick={() => setView('export')}
              className={view === 'export' ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'}
            >
              Exportar
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{agentName}</span>
          <button type="button" onClick={signOut} className="text-gray-500 underline hover:text-gray-700">
            Cerrar sesión
          </button>
        </div>
      </header>
      {view === 'quote' && <QuoteForm agentName={agentName} />}
      {view === 'tariffs' && <TariffAdminScreen />}
      {view === 'export' && <ExcelExportScreen />}
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
