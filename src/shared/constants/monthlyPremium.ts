import type { SeasonRate } from '../types/catalog'

export const MAX_MONTHLY_PREMIUM_MONTHS = 3

/** Meses (1 = enero .. 12 = diciembre) de tarifa alta para `monthly_premium`. */
export const MONTHLY_PREMIUM_HIGH_SEASON_MONTHS: readonly number[] = [1, 7, 8, 12]

export const MONTHLY_PREMIUM_RATES: Readonly<Record<SeasonRate, number>> = {
  high: 725,
  standard: 860,
}
