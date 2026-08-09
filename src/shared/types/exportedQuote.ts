import type { SeasonRate } from './catalog'

export interface ExportedDiscountLine {
  name: string
  percentage: number
  amount: number
}

export interface ExportedExtraLine {
  name: string
  price: number
  includedFree: boolean
}

export interface ExportedMonthlyPremiumLine {
  /** Posición del mes contratado, 1 = primero. */
  month: number
  rate: SeasonRate
  price: number
  resolvedManually: boolean
}

/**
 * Snapshot de una cotización ya calculada con éxito, lista para añadir a la
 * exportación a Excel (capítulo 7). Se congela en el momento en que se añade
 * — no se recalcula si el catálogo o las tarifas cambian después.
 */
export interface ExportedQuote {
  id: string
  agentName: string
  /** ISO 8601. */
  generatedAt: string
  subscriberName: string
  subscriberEmail: string
  age: number | null
  modalityName: string
  /** Vacío para monthly_premium (usa monthlyPremiumUnits en su lugar). */
  discounts: ExportedDiscountLine[]
  /** Vacío salvo para monthly_premium. */
  monthlyPremiumUnits: ExportedMonthlyPremiumLine[]
  extras: ExportedExtraLine[]
  total: number
}
