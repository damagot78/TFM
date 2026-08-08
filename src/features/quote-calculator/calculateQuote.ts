import type { DiscountId, Modality, ModalityId } from '../../shared/types/catalog'
import type { TariffOverrides } from '../../shared/types/tariffOverrides'
import { MAX_SIMULTANEOUS_DISCOUNTS } from '../../shared/constants/discounts'
import { MODALITIES } from '../../shared/constants/modalities'
import { EMPTY_TARIFF_OVERRIDES } from '../../shared/constants/tariffOverrides'
import { roundCurrency } from '../../shared/utils/money'
import { resolveDiscountPercentage, resolveModalityPrice } from '../../shared/utils/tariffResolvers'
import { getBlockingSelections, getDiscountOrThrow, isDiscountAllowedForCategory } from './discountCatalog'

export interface CascadeStep {
  discountId: DiscountId
  percentage: number
  base: number
  amount: number
  remaining: number
}

export interface QuoteCalculationOptions {
  /** Importe contratado por el abonado referido, requerido para aplicar el descuento `referral`. */
  referralAmount?: number
  /** Precios/porcentajes editados por el personal autorizado (capítulo 6). Si se omite, se usa el catálogo fijo. */
  overrides?: TariffOverrides
}

export type QuoteCalculationResult =
  | {
      success: true
      modalityId: ModalityId
      basePrice: number
      steps: CascadeStep[]
      total: number
      savings: number
    }
  | { success: false; errors: string[] }

function validateDiscountSelection(
  modality: Modality,
  discountIds: DiscountId[],
  options: QuoteCalculationOptions,
): string[] {
  const errors: string[] = []

  if (discountIds.length > MAX_SIMULTANEOUS_DISCOUNTS) {
    errors.push(`Máximo ${MAX_SIMULTANEOUS_DISCOUNTS} descuentos simultáneos.`)
  }

  for (const id of discountIds) {
    const discount = getDiscountOrThrow(id)
    if (!isDiscountAllowedForCategory(discount, modality.category)) {
      const reason =
        discount.categoryRestriction === 'premium-only'
          ? 'solo aplicable a la categoría Premium'
          : 'no aplicable a la categoría Premium'
      errors.push(`"${discount.name}" ${reason}.`)
    }
    const incompatible = getBlockingSelections(id, discountIds)
    if (incompatible.length > 0) {
      errors.push(`"${discount.name}" es incompatible con: ${incompatible.join(', ')}.`)
    }
  }

  if (discountIds.includes('referral')) {
    if (options.referralAmount === undefined) {
      errors.push('No se puede aplicar el descuento Referral sin indicar el importe del referido.')
    } else if (options.referralAmount <= 0) {
      errors.push('El importe del referido debe ser mayor que 0.')
    }
  }

  return errors
}

export function calculateQuote(
  modalityId: ModalityId,
  discountIds: DiscountId[],
  options: QuoteCalculationOptions = {},
): QuoteCalculationResult {
  const overrides = options.overrides ?? EMPTY_TARIFF_OVERRIDES

  const modality = MODALITIES.find((m) => m.id === modalityId)
  if (!modality) {
    const error = `Modalidad desconocida: ${modalityId}`
    console.error(error)
    return { success: false, errors: [error] }
  }

  const basePrice = resolveModalityPrice(modality, overrides)
  if (basePrice === null) {
    const error = `La modalidad "${modality.id}" no tiene precio fijo; usa calculateMonthlyPremiumPrice.`
    console.error(error)
    return { success: false, errors: [error] }
  }

  const errors = validateDiscountSelection(modality, discountIds, options)
  if (errors.length > 0) {
    console.error(`Cálculo de cuota rechazado (${modality.id}): ${errors.join(' | ')}`)
    return { success: false, errors }
  }

  const orderedDiscounts = [...discountIds]
    .map((id) => getDiscountOrThrow(id))
    .sort((a, b) => a.order - b.order)

  let remaining = basePrice
  const steps: CascadeStep[] = []

  for (const discount of orderedDiscounts) {
    const percentage = resolveDiscountPercentage(discount, overrides)
    const base = discount.id === 'referral' ? (options.referralAmount as number) : remaining
    const amount = roundCurrency(base * (percentage / 100))
    remaining = roundCurrency(remaining - amount)
    steps.push({ discountId: discount.id, percentage, base, amount, remaining })
  }

  return {
    success: true,
    modalityId: modality.id,
    basePrice,
    steps,
    total: remaining,
    savings: roundCurrency(basePrice - remaining),
  }
}
