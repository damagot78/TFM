import type {
  ExportedDiscountLine,
  ExportedExtraLine,
  ExportedMonthlyPremiumLine,
  ExportedQuote,
} from '../types/exportedQuote'

export const EXPORTED_QUOTES_STORAGE_KEY = 'agm.exportedQuotes'

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function sanitizeDiscountLine(value: unknown): ExportedDiscountLine | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }
  const { name, percentage, amount } = value as Record<string, unknown>
  if (typeof name !== 'string' || !isFiniteNumber(percentage) || !isFiniteNumber(amount)) {
    return null
  }
  return { name, percentage, amount }
}

function sanitizeExtraLine(value: unknown): ExportedExtraLine | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }
  const { name, price, includedFree } = value as Record<string, unknown>
  if (typeof name !== 'string' || !isFiniteNumber(price) || typeof includedFree !== 'boolean') {
    return null
  }
  return { name, price, includedFree }
}

function sanitizeMonthlyLine(value: unknown): ExportedMonthlyPremiumLine | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }
  const { month, rate, price, resolvedManually } = value as Record<string, unknown>
  if (
    !isFiniteNumber(month) ||
    (rate !== 'high' && rate !== 'standard') ||
    !isFiniteNumber(price) ||
    typeof resolvedManually !== 'boolean'
  ) {
    return null
  }
  return { month, rate, price, resolvedManually }
}

function sanitizeExportedQuote(value: unknown): ExportedQuote | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }
  const raw = value as Record<string, unknown>

  if (
    typeof raw.id !== 'string' ||
    typeof raw.agentName !== 'string' ||
    typeof raw.generatedAt !== 'string' ||
    typeof raw.subscriberName !== 'string' ||
    typeof raw.subscriberEmail !== 'string' ||
    (raw.age !== null && !isFiniteNumber(raw.age)) ||
    typeof raw.modalityName !== 'string' ||
    !Array.isArray(raw.discounts) ||
    !Array.isArray(raw.monthlyPremiumUnits) ||
    !Array.isArray(raw.extras) ||
    !isFiniteNumber(raw.total)
  ) {
    return null
  }

  return {
    id: raw.id,
    agentName: raw.agentName,
    generatedAt: raw.generatedAt,
    subscriberName: raw.subscriberName,
    subscriberEmail: raw.subscriberEmail,
    age: raw.age as number | null,
    modalityName: raw.modalityName,
    discounts: raw.discounts
      .map(sanitizeDiscountLine)
      .filter((line): line is ExportedDiscountLine => line !== null),
    monthlyPremiumUnits: raw.monthlyPremiumUnits
      .map(sanitizeMonthlyLine)
      .filter((line): line is ExportedMonthlyPremiumLine => line !== null),
    extras: raw.extras.map(sanitizeExtraLine).filter((line): line is ExportedExtraLine => line !== null),
    total: raw.total,
  }
}

/**
 * Único punto de acceso a las cotizaciones acumuladas para exportar
 * (patrón repositorio/adaptador, igual que `tariffOverridesRepository`):
 * valida la forma de lo leído de `localStorage` antes de confiar en ello.
 */
export function loadExportedQuotes(): ExportedQuote[] {
  try {
    const raw = localStorage.getItem(EXPORTED_QUOTES_STORAGE_KEY)
    if (raw === null) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.map(sanitizeExportedQuote).filter((quote): quote is ExportedQuote => quote !== null)
  } catch (error) {
    console.error('No se pudieron leer las cotizaciones exportadas de localStorage.', error)
    return []
  }
}

export function saveExportedQuotes(quotes: ExportedQuote[]): void {
  try {
    localStorage.setItem(EXPORTED_QUOTES_STORAGE_KEY, JSON.stringify(quotes))
  } catch (error) {
    console.error('No se pudieron guardar las cotizaciones exportadas en localStorage.', error)
  }
}

export function appendExportedQuote(quote: ExportedQuote): ExportedQuote[] {
  const next = [...loadExportedQuotes(), quote]
  saveExportedQuotes(next)
  return next
}

export function removeExportedQuote(id: string): ExportedQuote[] {
  const next = loadExportedQuotes().filter((quote) => quote.id !== id)
  saveExportedQuotes(next)
  return next
}

export function clearExportedQuotes(): void {
  try {
    localStorage.removeItem(EXPORTED_QUOTES_STORAGE_KEY)
  } catch (error) {
    console.error('No se pudieron borrar las cotizaciones exportadas de localStorage.', error)
  }
}
