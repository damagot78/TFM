import type { ModalityId } from '../../shared/types/catalog'
import type { ExportedQuote } from '../../shared/types/exportedQuote'
import { MODALITIES } from '../../shared/constants/modalities'
import { getDiscountOrThrow } from './discountCatalog'
import { getExtraOrThrow } from './extrasCatalog'
import type { QuoteState } from './useQuoteForm'
import type { ExtrasCalculationResult } from './calculateExtras'

export interface ExportableQuoteSource {
  quote: QuoteState
  extras: ExtrasCalculationResult
  grandTotal: number
  modalityId: ModalityId | ''
  subscriberName: string
  email: string
  age: number | null
}

/**
 * Construye el snapshot para exportar a partir del estado actual del
 * formulario. Devuelve `null` si la cotización no está en un estado válido
 * para exportar (sin modalidad, cascada/extras rechazados, etc.) — no tiene
 * sentido añadir a la exportación algo que no se pudo calcular.
 */
export function buildExportedQuote(
  source: ExportableQuoteSource,
  agentName: string,
  now: Date = new Date(),
): ExportedQuote | null {
  if (source.quote.kind === 'none' || !source.extras.success) {
    return null
  }
  if (!source.quote.result.success) {
    return null
  }

  const modality = MODALITIES.find((m) => m.id === source.modalityId)
  if (!modality) {
    return null
  }

  const discounts =
    source.quote.kind === 'cascade'
      ? source.quote.result.steps.map((step) => ({
          name: getDiscountOrThrow(step.discountId).name,
          percentage: step.percentage,
          amount: step.amount,
        }))
      : []

  const monthlyPremiumUnits =
    source.quote.kind === 'monthly'
      ? source.quote.result.units.map((unit) => ({
          month: unit.index + 1,
          rate: unit.rate,
          price: unit.price,
          resolvedManually: unit.resolvedManually,
        }))
      : []

  const extras = source.extras.items.map((item) => ({
    name: getExtraOrThrow(item.extraId).name,
    price: item.price,
    includedFree: item.includedFree,
  }))

  return {
    id: crypto.randomUUID(),
    agentName,
    generatedAt: now.toISOString(),
    subscriberName: source.subscriberName,
    subscriberEmail: source.email,
    age: source.age,
    modalityName: modality.name,
    discounts,
    monthlyPremiumUnits,
    extras,
    total: source.grandTotal,
  }
}
