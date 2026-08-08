import { describe, expect, it, vi } from 'vitest'
import type { ModalityId } from '../../shared/types/catalog'
import { calculateQuote } from './calculateQuote'

describe('calculateQuote', () => {
  it('sin descuentos, el total es el precio base de la modalidad', () => {
    const result = calculateQuote('pp', [])

    expect(result).toEqual({
      success: true,
      modalityId: 'pp',
      basePrice: 725,
      steps: [],
      total: 725,
      savings: 0,
    })
  })

  it('caso dorado: SM + Lunes a Viernes + Abono Tarde + Familiar = 2.524,50 €', () => {
    const result = calculateQuote('sm', ['week', 'afternoon', 'family'])

    expect(result).toEqual({
      success: true,
      modalityId: 'sm',
      basePrice: 4400,
      steps: [
        { discountId: 'week', percentage: 15, base: 4400, amount: 660, remaining: 3740 },
        { discountId: 'afternoon', percentage: 25, base: 3740, amount: 935, remaining: 2805 },
        { discountId: 'family', percentage: 10, base: 2805, amount: 280.5, remaining: 2524.5 },
      ],
      total: 2524.5,
      savings: 1875.5,
    })
  })

  it('aplica los descuentos en el orden fijo de la cascada, sin importar el orden de entrada', () => {
    const inOrder = calculateQuote('sm', ['week', 'afternoon', 'family'])
    const shuffled = calculateQuote('sm', ['family', 'afternoon', 'week'])

    expect(shuffled).toEqual(inOrder)
  })

  it('rechaza más de 3 descuentos simultáneos', () => {
    const result = calculateQuote('sm', ['week', 'afternoon', 'upgrade', 'avsv'])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('3'))).toBe(true)
    }
  })

  it('rechaza "Lunes a Viernes" en una modalidad Premium', () => {
    const result = calculateQuote('premium', ['week'])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('Lunes a Viernes'))).toBe(true)
    }
  })

  it('rechaza "Niño" en una modalidad que no es Premium', () => {
    const result = calculateQuote('sm', ['child'])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('Niño'))).toBe(true)
    }
  })

  it('rechaza combinaciones incompatibles (Familiar + Niño)', () => {
    const result = calculateQuote('premium', ['family', 'child'])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('incompatible'))).toBe(true)
    }
  })

  it('rechaza calcular una cuota para monthly_premium (no tiene precio fijo)', () => {
    const result = calculateQuote('monthly_premium', [])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('calculateMonthlyPremiumPrice'))).toBe(true)
    }
  })

  it('referral: calcula el 10% sobre el importe del referido, no sobre el subtotal propio', () => {
    const result = calculateQuote('sm', ['referral'], { referralAmount: 5000 })

    expect(result).toEqual({
      success: true,
      modalityId: 'sm',
      basePrice: 4400,
      steps: [{ discountId: 'referral', percentage: 10, base: 5000, amount: 500, remaining: 3900 }],
      total: 3900,
      savings: 500,
    })
  })

  it('referral combinado con otros descuentos: se aplica el último y usa siempre la base externa', () => {
    const result = calculateQuote('sm', ['week', 'referral'], { referralAmount: 5000 })

    expect(result.success).toBe(true)
    if (result.success) {
      const referralStep = result.steps.find((step) => step.discountId === 'referral')
      expect(referralStep).toEqual({
        discountId: 'referral',
        percentage: 10,
        base: 5000,
        amount: 500,
        remaining: 3740 - 500,
      })
    }
  })

  it('rechaza seleccionar "referral" sin indicar el importe del referido', () => {
    const result = calculateQuote('sm', ['referral'])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('referido'))).toBe(true)
    }
  })

  it('rechaza "referral" con un importe del referido no positivo', () => {
    const result = calculateQuote('sm', ['referral'], { referralAmount: 0 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('mayor que 0'))).toBe(true)
    }
  })

  it('rechaza una modalidad desconocida', () => {
    const result = calculateQuote('not-a-real-modality' as ModalityId, [])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('desconocida'))).toBe(true)
    }
  })

  it('registra en consola cuando el cálculo falla por una combinación inválida', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    calculateQuote('premium', ['week'])

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('un precio de modalidad editado (overrides) sustituye al del catálogo', () => {
    const result = calculateQuote('sm', [], {
      overrides: {
        modalityPrices: { sm: 5000 },
        discountPercentages: {},
        extraPrices: {},
        monthlyPremiumRates: {},
      },
    })

    expect(result).toEqual({
      success: true,
      modalityId: 'sm',
      basePrice: 5000,
      steps: [],
      total: 5000,
      savings: 0,
    })
  })

  it('un porcentaje de descuento editado (overrides) se usa en la cascada', () => {
    const result = calculateQuote('sm', ['week'], {
      overrides: {
        modalityPrices: {},
        discountPercentages: { week: 20 },
        extraPrices: {},
        monthlyPremiumRates: {},
      },
    })

    expect(result).toEqual({
      success: true,
      modalityId: 'sm',
      basePrice: 4400,
      steps: [{ discountId: 'week', percentage: 20, base: 4400, amount: 880, remaining: 3520 }],
      total: 3520,
      savings: 880,
    })
  })

  it('sin overrides explícitos, el resultado es idéntico al catálogo fijo (no rompe el caso dorado)', () => {
    const withEmptyOverrides = calculateQuote('sm', ['week', 'afternoon', 'family'], {
      overrides: { modalityPrices: {}, discountPercentages: {}, extraPrices: {}, monthlyPremiumRates: {} },
    })
    const withoutOverrides = calculateQuote('sm', ['week', 'afternoon', 'family'])

    expect(withEmptyOverrides).toEqual(withoutOverrides)
  })
})
