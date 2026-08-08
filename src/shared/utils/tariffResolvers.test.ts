import { describe, expect, it } from 'vitest'
import { MODALITIES } from '../constants/modalities'
import { DISCOUNTS } from '../constants/discounts'
import { EXTRAS } from '../constants/extras'
import { EMPTY_TARIFF_OVERRIDES } from '../constants/tariffOverrides'
import { MONTHLY_PREMIUM_RATES } from '../constants/monthlyPremium'
import {
  resolveDiscountPercentage,
  resolveExtraPrice,
  resolveModalityPrice,
  resolveMonthlyPremiumRate,
} from './tariffResolvers'

const sm = MODALITIES.find((m) => m.id === 'sm')!
const monthlyPremium = MODALITIES.find((m) => m.id === 'monthly_premium')!
const week = DISCOUNTS.find((d) => d.id === 'week')!
const locker = EXTRAS.find((e) => e.id === 'locker')!

describe('resolveModalityPrice', () => {
  it('sin override, devuelve el precio del catálogo', () => {
    expect(resolveModalityPrice(sm, EMPTY_TARIFF_OVERRIDES)).toBe(4400)
  })

  it('con override, devuelve el precio editado', () => {
    const overrides = { ...EMPTY_TARIFF_OVERRIDES, modalityPrices: { sm: 4500 } }
    expect(resolveModalityPrice(sm, overrides)).toBe(4500)
  })

  it('una modalidad sin precio fijo (monthly_premium) sigue devolviendo null aunque haya overrides de otras modalidades', () => {
    const overrides = { ...EMPTY_TARIFF_OVERRIDES, modalityPrices: { sm: 4500 } }
    expect(resolveModalityPrice(monthlyPremium, overrides)).toBeNull()
  })
})

describe('resolveDiscountPercentage', () => {
  it('sin override, devuelve el porcentaje del catálogo', () => {
    expect(resolveDiscountPercentage(week, EMPTY_TARIFF_OVERRIDES)).toBe(15)
  })

  it('con override, devuelve el porcentaje editado', () => {
    const overrides = { ...EMPTY_TARIFF_OVERRIDES, discountPercentages: { week: 20 } }
    expect(resolveDiscountPercentage(week, overrides)).toBe(20)
  })
})

describe('resolveExtraPrice', () => {
  it('sin override, devuelve el precio del catálogo', () => {
    expect(resolveExtraPrice(locker, EMPTY_TARIFF_OVERRIDES)).toBe(150)
  })

  it('con override, devuelve el precio editado', () => {
    const overrides = { ...EMPTY_TARIFF_OVERRIDES, extraPrices: { locker: 160 } }
    expect(resolveExtraPrice(locker, overrides)).toBe(160)
  })
})

describe('resolveMonthlyPremiumRate', () => {
  it('sin override, devuelve la tarifa del catálogo', () => {
    expect(resolveMonthlyPremiumRate('high', EMPTY_TARIFF_OVERRIDES)).toBe(MONTHLY_PREMIUM_RATES.high)
  })

  it('con override, devuelve la tarifa editada', () => {
    const overrides = { ...EMPTY_TARIFF_OVERRIDES, monthlyPremiumRates: { high: 750 } }
    expect(resolveMonthlyPremiumRate('high', overrides)).toBe(750)
  })
})
