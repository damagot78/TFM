import { describe, expect, it, vi } from 'vitest'
import { calculateExtras } from './calculateExtras'

describe('calculateExtras', () => {
  it('sin extras seleccionados, el total es 0', () => {
    const result = calculateExtras('sm', [], { age: 30, activeDiscountIds: [] })

    expect(result).toEqual({ success: true, items: [], total: 0 })
  })

  it('un extra simple sin grupo se cobra a precio de catálogo', () => {
    const result = calculateExtras('sm', ['locker'], { age: 30, activeDiscountIds: [] })

    expect(result).toEqual({
      success: true,
      items: [{ extraId: 'locker', price: 150, includedFree: false }],
      total: 150,
    })
  })

  it('rechaza dos extras del mismo grupo "storage"', () => {
    const result = calculateExtras('sm', ['club_storage', 'storage_trolley'], {
      age: 30,
      activeDiscountIds: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('storage') || e.includes('Custodia'))).toBe(true)
    }
  })

  it('rechaza dos extras del mismo grupo "buggy"', () => {
    const result = calculateExtras('sm', ['buggy_monthly', 'buggy_annual'], {
      age: 30,
      activeDiscountIds: [],
    })

    expect(result.success).toBe(false)
  })

  it('rechaza extras de buggy en modalidades sin instalaciones (P&P)', () => {
    const result = calculateExtras('pp', ['buggy_annual'], { age: 30, activeDiscountIds: [] })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('instalaciones'))).toBe(true)
    }
  })

  it('permite extras de storage en modalidades sin instalaciones para buggy', () => {
    const result = calculateExtras('pp', ['locker'], { age: 30, activeDiscountIds: [] })

    expect(result.success).toBe(true)
  })

  it('rechaza extras de buggy para menores de 16 años', () => {
    const result = calculateExtras('sm', ['buggy_annual'], { age: 15, activeDiscountIds: [] })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('16'))).toBe(true)
    }
  })

  it('rechaza extras de buggy si la edad es desconocida', () => {
    const result = calculateExtras('sm', ['buggy_annual'], { age: null, activeDiscountIds: [] })

    expect(result.success).toBe(false)
  })

  it.each(['sm_buggy', 'premium_buggy', 'premium_spa_buggy'] as const)(
    'el Buggy anual viene incluido gratis en %s',
    (modalityId) => {
      const result = calculateExtras(modalityId, ['buggy_annual'], { age: 30, activeDiscountIds: [] })

      expect(result).toEqual({
        success: true,
        items: [{ extraId: 'buggy_annual', price: 0, includedFree: true }],
        total: 0,
      })
    },
  )

  it('el Buggy anual se cobra en modalidades que no lo incluyen gratis', () => {
    const result = calculateExtras('sm', ['buggy_annual'], { age: 30, activeDiscountIds: [] })

    expect(result).toEqual({
      success: true,
      items: [{ extraId: 'buggy_annual', price: 1400, includedFree: false }],
      total: 1400,
    })
  })

  it('el cargador eléctrico es gratis en Premium para un adulto', () => {
    const result = calculateExtras('premium', ['charger'], { age: 30, activeDiscountIds: [] })

    expect(result).toEqual({
      success: true,
      items: [{ extraId: 'charger', price: 0, includedFree: true }],
      total: 0,
    })
  })

  it('el cargador eléctrico se cobra en Premium si no es adulto (15 años, sin descuento infantil)', () => {
    const result = calculateExtras('premium', ['charger'], { age: 15, activeDiscountIds: [] })

    expect(result).toEqual({
      success: true,
      items: [{ extraId: 'charger', price: 150, includedFree: false }],
      total: 150,
    })
  })

  it('el cargador eléctrico se cobra fuera de Premium aunque sea adulto', () => {
    const result = calculateExtras('sm', ['charger'], { age: 30, activeDiscountIds: [] })

    expect(result).toEqual({
      success: true,
      items: [{ extraId: 'charger', price: 150, includedFree: false }],
      total: 150,
    })
  })

  it('el seguro de licencia RFEG siempre se cobra a precio de catálogo', () => {
    const result = calculateExtras('premium', ['license_insurance'], { age: 10, activeDiscountIds: [] })

    expect(result).toEqual({
      success: true,
      items: [{ extraId: 'license_insurance', price: 144, includedFree: false }],
      total: 144,
    })
  })

  it('combina varios extras válidos y suma sus precios', () => {
    const result = calculateExtras('sm', ['locker', 'club_storage', 'charger'], {
      age: 30,
      activeDiscountIds: [],
    })

    expect(result).toEqual({
      success: true,
      items: [
        { extraId: 'locker', price: 150, includedFree: false },
        { extraId: 'club_storage', price: 175, includedFree: false },
        { extraId: 'charger', price: 150, includedFree: false },
      ],
      total: 475,
    })
  })

  it('registra en consola cuando el cálculo de extras se rechaza', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    calculateExtras('pp', ['buggy_annual'], { age: 30, activeDiscountIds: [] })

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('un precio de extra editado (overrides) sustituye al del catálogo', () => {
    const result = calculateExtras('sm', ['locker'], {
      age: 30,
      activeDiscountIds: [],
      overrides: {
        modalityPrices: {},
        discountPercentages: {},
        extraPrices: { locker: 160 },
        monthlyPremiumRates: {},
      },
    })

    expect(result).toEqual({ success: true, items: [{ extraId: 'locker', price: 160, includedFree: false }], total: 160 })
  })

  it('un extra gratuito por inclusión (buggy anual) ignora el override de precio', () => {
    const result = calculateExtras('sm_buggy', ['buggy_annual'], {
      age: 30,
      activeDiscountIds: [],
      overrides: {
        modalityPrices: {},
        discountPercentages: {},
        extraPrices: { buggy_annual: 2000 },
        monthlyPremiumRates: {},
      },
    })

    expect(result).toEqual({
      success: true,
      items: [{ extraId: 'buggy_annual', price: 0, includedFree: true }],
      total: 0,
    })
  })
})
