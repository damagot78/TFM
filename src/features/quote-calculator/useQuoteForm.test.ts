import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TARIFF_OVERRIDES_STORAGE_KEY } from '../../shared/utils/tariffOverridesRepository'
import { useQuoteForm } from './useQuoteForm'

afterEach(() => {
  localStorage.clear()
})

describe('useQuoteForm', () => {
  it('empieza sin modalidad, sin edad y con cotización vacía', () => {
    const { result } = renderHook(() => useQuoteForm())

    expect(result.current.age).toBeNull()
    expect(result.current.quote).toEqual({ kind: 'none' })
    expect(result.current.grandTotal).toBe(0)
  })

  it('calcula la edad al fijar la fecha de nacimiento', () => {
    const { result } = renderHook(() => useQuoteForm())

    act(() => result.current.setBirthDate('2000-06-15'))

    expect(result.current.age).not.toBeNull()
  })

  it('al elegir una modalidad con precio fijo, la cotización usa el motor de cascada', () => {
    const { result } = renderHook(() => useQuoteForm())

    act(() => result.current.setModalityId('sm'))

    expect(result.current.quote).toEqual({
      kind: 'cascade',
      result: {
        success: true,
        modalityId: 'sm',
        basePrice: 4400,
        steps: [],
        total: 4400,
        savings: 0,
      },
    })
    expect(result.current.grandTotal).toBe(4400)
  })

  it('reproduce el caso dorado al marcar los tres descuentos de referencia', () => {
    const { result } = renderHook(() => useQuoteForm())

    act(() => result.current.setModalityId('sm'))
    act(() => result.current.toggleDiscount('week'))
    act(() => result.current.toggleDiscount('afternoon'))
    act(() => result.current.toggleDiscount('family'))

    expect(result.current.quote.kind).toBe('cascade')
    if (result.current.quote.kind === 'cascade' && result.current.quote.result.success) {
      expect(result.current.quote.result.total).toBe(2524.5)
    }
    expect(result.current.grandTotal).toBe(2524.5)
  })

  it('cambiar de modalidad reinicia los descuentos y extras seleccionados', () => {
    const { result } = renderHook(() => useQuoteForm())

    act(() => result.current.setModalityId('sm'))
    act(() => result.current.toggleDiscount('week'))
    act(() => result.current.toggleExtra('locker'))

    act(() => result.current.setModalityId('sq'))

    expect(result.current.discountIds).toEqual([])
    expect(result.current.extraIds).toEqual([])
  })

  it('para monthly_premium, la cotización usa la calculadora de temporada', () => {
    const { result } = renderHook(() => useQuoteForm())

    act(() => result.current.setModalityId('monthly_premium'))
    act(() => result.current.setMonthlyStartDate('2026-08-01'))
    act(() => result.current.setMonthlyMonths(2))

    expect(result.current.quote).toEqual({
      kind: 'monthly',
      result: {
        success: true,
        units: [
          { index: 0, rate: 'high', price: 725, resolvedManually: false },
          { index: 1, rate: 'standard', price: 860, resolvedManually: false },
        ],
        total: 1585,
      },
    })
    expect(result.current.grandTotal).toBe(1585)
  })

  it('un cruce de temporada pendiente se resuelve con setMonthlyManualChoice', () => {
    const { result } = renderHook(() => useQuoteForm())

    act(() => result.current.setModalityId('monthly_premium'))
    act(() => result.current.setMonthlyStartDate('2026-06-15')) // cruza junio (estándar) - julio (alta)

    expect(result.current.quote).toEqual({ kind: 'monthly', result: { success: false, errors: expect.any(Array) } })

    act(() => result.current.setMonthlyManualChoice(0, 'high'))

    expect(result.current.quote).toEqual({
      kind: 'monthly',
      result: { success: true, units: [{ index: 0, rate: 'high', price: 725, resolvedManually: true }], total: 725 },
    })
  })

  it('los extras seleccionados se suman al total de la cotización', () => {
    const { result } = renderHook(() => useQuoteForm())

    act(() => result.current.setModalityId('sm'))
    act(() => result.current.setBirthDate('1990-01-01'))
    act(() => result.current.toggleExtra('locker'))

    expect(result.current.extras.success).toBe(true)
    if (result.current.extras.success) {
      expect(result.current.extras.total).toBe(150)
    }
    expect(result.current.grandTotal).toBe(4400 + 150)
  })

  it('el descuento "referral" usa el importe del referido introducido en el formulario', () => {
    const { result } = renderHook(() => useQuoteForm())

    act(() => result.current.setModalityId('sm'))
    act(() => result.current.toggleDiscount('referral'))
    act(() => result.current.setReferralAmount('5000'))

    expect(result.current.quote.kind).toBe('cascade')
    if (result.current.quote.kind === 'cascade' && result.current.quote.result.success) {
      expect(result.current.quote.result.total).toBe(3900)
    }
  })

  it('eligibleDiscountIds refleja la modalidad y la edad actuales', () => {
    const { result } = renderHook(() => useQuoteForm())

    act(() => result.current.setModalityId('premium'))
    act(() => result.current.setBirthDate(`${new Date().getFullYear() - 10}-01-01`))

    expect(result.current.eligibleDiscountIds).toContain('child')
    expect(result.current.eligibleDiscountIds).not.toContain('week')
  })

  it('desmarcar "referral" limpia el importe del referido introducido', () => {
    const { result } = renderHook(() => useQuoteForm())

    act(() => result.current.setModalityId('sm'))
    act(() => result.current.toggleDiscount('referral'))
    act(() => result.current.setReferralAmount('5000'))
    act(() => result.current.toggleDiscount('referral'))

    expect(result.current.discountIds).not.toContain('referral')
    expect(result.current.referralAmount).toBe('')
  })

  it('desmarcar un extra ya seleccionado lo quita de extraIds', () => {
    const { result } = renderHook(() => useQuoteForm())

    act(() => result.current.setModalityId('sm'))
    act(() => result.current.toggleExtra('locker'))
    act(() => result.current.toggleExtra('locker'))

    expect(result.current.extraIds).toEqual([])
  })

  it('un precio editado y guardado en localStorage llega hasta el total calculado', () => {
    localStorage.setItem(
      TARIFF_OVERRIDES_STORAGE_KEY,
      JSON.stringify({
        modalityPrices: { sm: 4500 },
        discountPercentages: {},
        extraPrices: {},
        monthlyPremiumRates: {},
      }),
    )

    const { result } = renderHook(() => useQuoteForm())
    act(() => result.current.setModalityId('sm'))

    expect(result.current.grandTotal).toBe(4500)
  })
})
