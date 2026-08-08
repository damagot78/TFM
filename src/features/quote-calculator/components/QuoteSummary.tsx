import type { ExtrasCalculationResult } from '../calculateExtras'
import type { QuoteState } from '../useQuoteForm'
import { getDiscountOrThrow } from '../discountCatalog'
import { getExtraOrThrow } from '../extrasCatalog'

interface QuoteSummaryProps {
  quote: QuoteState
  extras: ExtrasCalculationResult
  grandTotal: number
}

function formatEuros(value: number): string {
  return `${value.toFixed(2)} €`
}

export function QuoteSummary({ quote, extras, grandTotal }: QuoteSummaryProps) {
  return (
    <aside className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Resumen</h2>

      {quote.kind === 'none' && (
        <p className="text-sm text-gray-500">Selecciona una modalidad para ver el resumen.</p>
      )}

      {quote.kind === 'cascade' && quote.result.success && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Precio base</span>
            <span>{formatEuros(quote.result.basePrice)}</span>
          </div>
          {quote.result.steps.length > 0 && (
            <ul className="space-y-1 border-t border-gray-100 pt-2">
              {quote.result.steps.map((step) => (
                <li key={step.discountId} className="flex justify-between text-gray-600">
                  <span>
                    {getDiscountOrThrow(step.discountId).name} ({step.percentage}% sobre {formatEuros(step.base)})
                  </span>
                  <span>−{formatEuros(step.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between border-t border-gray-100 pt-2 font-medium text-gray-900">
            <span>Subtotal cuota</span>
            <span>{formatEuros(quote.result.total)}</span>
          </div>
        </div>
      )}

      {quote.kind === 'cascade' && !quote.result.success && (
        <ul className="space-y-1 text-sm text-red-700">
          {quote.result.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      {quote.kind === 'monthly' && quote.result.success && (
        <div className="space-y-2 text-sm">
          <ul className="space-y-1">
            {quote.result.units.map((unit) => (
              <li key={unit.index} className="flex justify-between text-gray-600">
                <span>
                  Mes {unit.index + 1}
                  {unit.resolvedManually ? ' (elegido manualmente)' : ''}
                </span>
                <span>{formatEuros(unit.price)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-gray-100 pt-2 font-medium text-gray-900">
            <span>Subtotal cuota</span>
            <span>{formatEuros(quote.result.total)}</span>
          </div>
        </div>
      )}

      {quote.kind === 'monthly' && !quote.result.success && (
        <ul className="space-y-1 text-sm text-amber-700">
          {quote.result.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      {extras.success && extras.items.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
          {extras.items.map((item) => (
            <li key={item.extraId} className="flex justify-between text-gray-600">
              <span>{getExtraOrThrow(item.extraId).name}</span>
              <span>{item.includedFree ? 'incluido' : formatEuros(item.price)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
        <span>Total</span>
        <span>{formatEuros(grandTotal)}</span>
      </div>
    </aside>
  )
}
