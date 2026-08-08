import type { SeasonRate } from '../../shared/types/catalog'
import type { TariffOverrides } from '../../shared/types/tariffOverrides'
import { MONTHLY_PREMIUM_HIGH_SEASON_MONTHS } from '../../shared/constants/monthlyPremium'
import { EMPTY_TARIFF_OVERRIDES } from '../../shared/constants/tariffOverrides'
import { roundCurrency } from '../../shared/utils/money'
import { resolveMonthlyPremiumRate } from '../../shared/utils/tariffResolvers'

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

export type MonthlyPremiumUnitPreview =
  | { index: number; status: 'automatic'; rate: SeasonRate; price: number }
  | { index: number; status: 'pending'; options: [SeasonRate, SeasonRate] }

type UnitClassification =
  | { index: number; status: 'automatic'; rate: SeasonRate }
  | { index: number; status: 'pending'; options: [SeasonRate, SeasonRate] }

function rateForMonth(month: number): SeasonRate {
  const normalizedMonth = ((month - 1) % 12) + 1
  return MONTHLY_PREMIUM_HIGH_SEASON_MONTHS.includes(normalizedMonth) ? 'high' : 'standard'
}

/**
 * Clasifica cada mes contratado según si cae limpio en un único mes natural,
 * o cruza dos meses naturales (con la misma tarifa, o con tarifas distintas
 * pendientes de elección manual). Es la base tanto del cálculo final como de
 * la vista previa que usa la UI para pedir la elección al agente.
 */
function classifyUnits(startDate: Date, months: 1 | 2 | 3): UnitClassification[] {
  const startMonth = startDate.getMonth() + 1
  const startsOnFirstOfMonth = startDate.getDate() === 1

  const units: UnitClassification[] = []

  for (let index = 0; index < months; index++) {
    const monthA = startMonth + index

    if (startsOnFirstOfMonth) {
      units.push({ index, status: 'automatic', rate: rateForMonth(monthA) })
      continue
    }

    const rateA = rateForMonth(monthA)
    const rateB = rateForMonth(monthA + 1)

    if (rateA === rateB) {
      units.push({ index, status: 'automatic', rate: rateA })
    } else {
      units.push({ index, status: 'pending', options: [rateA, rateB] })
    }
  }

  return units
}

/** Vista previa de cómo se tarifica cada mes contratado, sin resolver los cruces de temporada pendientes. */
export function previewMonthlyPremiumUnits(
  startDate: Date,
  months: 1 | 2 | 3,
  overrides: TariffOverrides = EMPTY_TARIFF_OVERRIDES,
): MonthlyPremiumUnitPreview[] {
  return classifyUnits(startDate, months).map((unit) =>
    unit.status === 'automatic'
      ? { index: unit.index, status: 'automatic', rate: unit.rate, price: resolveMonthlyPremiumRate(unit.rate, overrides) }
      : unit,
  )
}

export function calculateMonthlyPremiumPrice(
  startDate: Date,
  months: 1 | 2 | 3,
  manualChoices: MonthlyPremiumManualChoices = {},
  overrides: TariffOverrides = EMPTY_TARIFF_OVERRIDES,
): MonthlyPremiumPriceResult {
  const errors: string[] = []
  const units: MonthlyPremiumUnit[] = []

  for (const unit of classifyUnits(startDate, months)) {
    if (unit.status === 'automatic') {
      units.push({
        index: unit.index,
        rate: unit.rate,
        price: resolveMonthlyPremiumRate(unit.rate, overrides),
        resolvedManually: false,
      })
      continue
    }

    const manualChoice = manualChoices[unit.index]
    if (manualChoice !== undefined) {
      units.push({
        index: unit.index,
        rate: manualChoice,
        price: resolveMonthlyPremiumRate(manualChoice, overrides),
        resolvedManually: true,
      })
      continue
    }

    const highRate = resolveMonthlyPremiumRate('high', overrides)
    const standardRate = resolveMonthlyPremiumRate('standard', overrides)
    errors.push(
      `El mes contratado #${unit.index + 1} cruza dos meses naturales con tarifas distintas ` +
        `(alta ${highRate} € / estándar ${standardRate} €); ` +
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
