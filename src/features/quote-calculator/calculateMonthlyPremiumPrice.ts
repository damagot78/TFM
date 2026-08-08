import type { SeasonRate } from '../../shared/types/catalog'
import {
  MONTHLY_PREMIUM_HIGH_SEASON_MONTHS,
  MONTHLY_PREMIUM_RATES,
} from '../../shared/constants/monthlyPremium'
import { roundCurrency } from '../../shared/utils/money'

export interface MonthlyPremiumUnit {
  /** Posición del mes contratado (0 = primer mes desde la fecha de inicio). */
  index: number
  rate: SeasonRate
  price: number
  /** true si un cruce de temporada con tarifas distintas se resolvió con la elección del agente. */
  resolvedManually: boolean
}

/** Elección manual del agente por índice de mes, solo necesaria si ese mes cruza dos temporadas con tarifas distintas. */
export type MonthlyPremiumManualChoices = Partial<Record<number, SeasonRate>>

export type MonthlyPremiumPriceResult =
  | { success: true; units: MonthlyPremiumUnit[]; total: number }
  | { success: false; errors: string[] }

function rateForMonth(month: number): SeasonRate {
  const normalizedMonth = ((month - 1) % 12) + 1
  return MONTHLY_PREMIUM_HIGH_SEASON_MONTHS.includes(normalizedMonth) ? 'high' : 'standard'
}

export function calculateMonthlyPremiumPrice(
  startDate: Date,
  months: 1 | 2 | 3,
  manualChoices: MonthlyPremiumManualChoices = {},
): MonthlyPremiumPriceResult {
  const startMonth = startDate.getMonth() + 1
  const startsOnFirstOfMonth = startDate.getDate() === 1

  const errors: string[] = []
  const units: MonthlyPremiumUnit[] = []

  for (let index = 0; index < months; index++) {
    const monthA = startMonth + index

    if (startsOnFirstOfMonth) {
      const rate = rateForMonth(monthA)
      units.push({ index, rate, price: MONTHLY_PREMIUM_RATES[rate], resolvedManually: false })
      continue
    }

    const rateA = rateForMonth(monthA)
    const rateB = rateForMonth(monthA + 1)

    if (rateA === rateB) {
      units.push({ index, rate: rateA, price: MONTHLY_PREMIUM_RATES[rateA], resolvedManually: false })
      continue
    }

    const manualChoice = manualChoices[index]
    if (manualChoice !== undefined) {
      units.push({
        index,
        rate: manualChoice,
        price: MONTHLY_PREMIUM_RATES[manualChoice],
        resolvedManually: true,
      })
      continue
    }

    errors.push(
      `El mes contratado #${index + 1} cruza dos meses naturales con tarifas distintas ` +
        `(alta ${MONTHLY_PREMIUM_RATES.high} € / estándar ${MONTHLY_PREMIUM_RATES.standard} €); ` +
        'el agente debe elegir manualmente cuál aplicar.',
    )
  }

  if (errors.length > 0) {
    console.error(`Cálculo de Premium Mensual pendiente de decisión manual: ${errors.join(' | ')}`)
    return { success: false, errors }
  }

  const total = roundCurrency(units.reduce((sum, unit) => sum + unit.price, 0))

  return { success: true, units, total }
}
