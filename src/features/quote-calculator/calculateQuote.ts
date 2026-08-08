import type { Discount, DiscountId, Modality, ModalityId } from '../../shared/types/catalog'
import { DISCOUNTS, MAX_SIMULTANEOUS_DISCOUNTS } from '../../shared/constants/discounts'
import { MODALITIES } from '../../shared/constants/modalities'
import { roundCurrency } from '../../shared/utils/money'

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

function getDiscountOrThrow(id: DiscountId): Discount {
  const discount = DISCOUNTS.find((d) => d.id === id)
  if (!discount) {
    throw new Error(`Descuento desconocido en el catálogo: ${id}`)
  }
  return discount
}

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
    if (discount.categoryRestriction === 'excludes-premium' && modality.category === 'premium') {
      errors.push(`"${discount.name}" no aplicable a la categoría Premium.`)
    }
    if (discount.categoryRestriction === 'premium-only' && modality.category !== 'premium') {
      errors.push(`"${discount.name}" solo aplicable a la categoría Premium.`)
    }
    const incompatible = discount.incompatibleWith.filter((other) => discountIds.includes(other))
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
  const modality = MODALITIES.find((m) => m.id === modalityId)
  if (!modality) {
    const error = `Modalidad desconocida: ${modalityId}`
    console.error(error)
    return { success: false, errors: [error] }
  }

  if (modality.price === null) {
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

  const basePrice = modality.price
  let remaining = basePrice
  const steps: CascadeStep[] = []

  for (const discount of orderedDiscounts) {
    const base = discount.id === 'referral' ? (options.referralAmount as number) : remaining
    const amount = roundCurrency(base * (discount.percentage / 100))
    remaining = roundCurrency(remaining - amount)
    steps.push({ discountId: discount.id, percentage: discount.percentage, base, amount, remaining })
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
