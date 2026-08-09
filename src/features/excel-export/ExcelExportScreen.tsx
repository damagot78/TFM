import { useState } from 'react'
import type { ExportedQuote } from '../../shared/types/exportedQuote'
import {
  clearExportedQuotes,
  loadExportedQuotes,
  removeExportedQuote,
} from '../../shared/utils/exportedQuotesRepository'
import { generateQuotesWorkbook } from './generateQuotesWorkbook'

function formatEuros(value: number): string {
  return `${value.toFixed(2)} €`
}

function downloadWorkbook(buffer: ArrayBuffer): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cotizaciones-agm-${new Date().toISOString().slice(0, 10)}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}

export function ExcelExportScreen() {
  const [quotes, setQuotes] = useState<ExportedQuote[]>(() => loadExportedQuotes())
  const [isGenerating, setIsGenerating] = useState(false)

  function handleRemove(id: string) {
    setQuotes(removeExportedQuote(id))
  }

  function handleClear() {
    clearExportedQuotes()
    setQuotes([])
  }

  async function handleDownload() {
    setIsGenerating(true)
    try {
      const buffer = await generateQuotesWorkbook(quotes)
      downloadWorkbook(buffer)
    } catch (error) {
      console.error('No se pudo generar el archivo Excel.', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-xl font-semibold text-gray-900">Exportar cotizaciones</h1>

      {quotes.length === 0 ? (
        <p className="text-sm text-gray-500">
          No hay cotizaciones añadidas todavía. Añádelas desde el resumen de la calculadora.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Agente</th>
                  <th className="px-4 py-2">Abonado</th>
                  <th className="px-4 py-2">Modalidad</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2">{quote.agentName}</td>
                    <td className="px-4 py-2">{quote.subscriberName || '—'}</td>
                    <td className="px-4 py-2">{quote.modalityName}</td>
                    <td className="px-4 py-2">{formatEuros(quote.total)}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(quote.id)}
                        className="text-xs text-gray-500 underline"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isGenerating ? 'Generando…' : 'Descargar Excel'}
            </button>
            <button type="button" onClick={handleClear} className="text-sm text-gray-500 underline">
              Vaciar lista
            </button>
          </div>
        </>
      )}
    </main>
  )
}
