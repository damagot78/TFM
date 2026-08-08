import { describe, expect, it, vi } from 'vitest'
import { calculateMonthlyPremiumPrice, previewMonthlyPremiumUnits } from './calculateMonthlyPremiumPrice'

describe('calculateMonthlyPremiumPrice', () => {
  it('ejemplo de referencia: Agosto (alta) + Septiembre (estándar) = 725 + 860 = 1.585 €', () => {
    const result = calculateMonthlyPremiumPrice(new Date(2026, 7, 1), 2)

    expect(result).toEqual({
      success: true,
      units: [
        { index: 0, rate: 'high', price: 725, resolvedManually: false },
        { index: 1, rate: 'standard', price: 860, resolvedManually: false },
      ],
      total: 1585,
    })
  })

  it('un solo mes que cae limpio en temporada alta (Enero)', () => {
    const result = calculateMonthlyPremiumPrice(new Date(2026, 0, 1), 1)

    expect(result).toEqual({
      success: true,
      units: [{ index: 0, rate: 'high', price: 725, resolvedManually: false }],
      total: 725,
    })
  })

  it('un solo mes que cae limpio en temporada estándar (Marzo)', () => {
    const result = calculateMonthlyPremiumPrice(new Date(2026, 2, 1), 1)

    expect(result).toEqual({
      success: true,
      units: [{ index: 0, rate: 'standard', price: 860, resolvedManually: false }],
      total: 860,
    })
  })

  it('mes que cruza dos meses naturales con la misma tarifa: automático, sin elección manual', () => {
    const result = calculateMonthlyPremiumPrice(new Date(2026, 2, 15), 1) // 15 mar - 15 abr, ambos estándar

    expect(result).toEqual({
      success: true,
      units: [{ index: 0, rate: 'standard', price: 860, resolvedManually: false }],
      total: 860,
    })
  })

  it('mes que cruza dos meses naturales con tarifas distintas: falla si no hay elección manual', () => {
    const result = calculateMonthlyPremiumPrice(new Date(2026, 5, 15), 1) // 15 jun (estándar) - 15 jul (alta)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('manual'))).toBe(true)
    }
  })

  it('mes que cruza dos meses naturales con tarifas distintas: usa la elección manual del agente', () => {
    const result = calculateMonthlyPremiumPrice(new Date(2026, 5, 15), 1, { 0: 'high' })

    expect(result).toEqual({
      success: true,
      units: [{ index: 0, rate: 'high', price: 725, resolvedManually: true }],
      total: 725,
    })
  })

  it('acumula tarifas de varios meses cruzando el fin de año (Diciembre-Enero-Febrero)', () => {
    const result = calculateMonthlyPremiumPrice(new Date(2026, 11, 1), 3)

    expect(result).toEqual({
      success: true,
      units: [
        { index: 0, rate: 'high', price: 725, resolvedManually: false },
        { index: 1, rate: 'high', price: 725, resolvedManually: false },
        { index: 2, rate: 'standard', price: 860, resolvedManually: false },
      ],
      total: 2310,
    })
  })

  it('registra en consola cuando falta una elección manual', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    calculateMonthlyPremiumPrice(new Date(2026, 5, 15), 1)

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})

describe('previewMonthlyPremiumUnits', () => {
  it('para meses que caen limpios, cada unidad es automática con su tarifa y precio', () => {
    expect(previewMonthlyPremiumUnits(new Date(2026, 7, 1), 2)).toEqual([
      { index: 0, status: 'automatic', rate: 'high', price: 725 },
      { index: 1, status: 'automatic', rate: 'standard', price: 860 },
    ])
  })

  it('para un cruce de temporada con la misma tarifa, la unidad es automática', () => {
    expect(previewMonthlyPremiumUnits(new Date(2026, 2, 15), 1)).toEqual([
      { index: 0, status: 'automatic', rate: 'standard', price: 860 },
    ])
  })

  it('para un cruce de temporada con tarifas distintas, la unidad queda pendiente con las dos opciones', () => {
    expect(previewMonthlyPremiumUnits(new Date(2026, 5, 15), 1)).toEqual([
      { index: 0, status: 'pending', options: ['standard', 'high'] },
    ])
  })
})
