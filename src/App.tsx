import { QuoteForm } from './features/quote-calculator/components/QuoteForm'

function App() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Calculadora de Cuotas — Arabella Golf Mallorca</h1>
      </header>
      <QuoteForm />
    </main>
  )
}

export default App
