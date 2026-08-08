import type { Discount, Extra, Modality, SeasonRate } from '../types/catalog'
import type { TariffOverrides } from '../types/tariffOverrides'
import { MONTHLY_PREMIUM_RATES } from '../constants/monthlyPremium'

/** Precio efectivo de una modalidad: el editado si existe, si no el del catálogo. `null` se mantiene para modalidades sin precio fijo (monthly_premium). */
export function resolveModalityPrice(modality: Modality, overrides: TariffOverrides): number | null {
  if (modality.price === null) {
    return null
  }
  return overrides.modalityPrices[modality.id] ?? modality.price
}

/** Porcentaje efectivo de un descuento: el editado si existe, si no el del catálogo. */
export function resolveDiscountPercentage(discount: Discount, overrides: TariffOverrides): number {
  return overrides.discountPercentages[discount.id] ?? discount.percentage
}

/** Precio efectivo de un extra: el editado si existe, si no el del catálogo. */
export function resolveExtraPrice(extra: Extra, overrides: TariffOverrides): number {
  return overrides.extraPrices[extra.id] ?? extra.price
}

/** Tarifa mensual efectiva (alta/estándar) de monthly_premium: la editada si existe, si no la del catálogo. */
export function resolveMonthlyPremiumRate(rate: SeasonRate, overrides: TariffOverrides): number {
  return overrides.monthlyPremiumRates[rate] ?? MONTHLY_PREMIUM_RATES[rate]
}
