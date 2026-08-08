import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadTariffOverrides, saveTariffOverrides, TARIFF_OVERRIDES_STORAGE_KEY } from './tariffOverridesRepository'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('loadTariffOverrides', () => {
  it('sin nada guardado, devuelve overrides vacíos', () => {
    expect(loadTariffOverrides()).toEqual({
      modalityPrices: {},
      discountPercentages: {},
      extraPrices: {},
      monthlyPremiumRates: {},
    })
  })

  it('con un JSON que no es válido, devuelve overrides vacíos y registra el error', () => {
    localStorage.setItem(TARIFF_OVERRIDES_STORAGE_KEY, '{ esto no es json')
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(loadTariffOverrides()).toEqual({
      modalityPrices: {},
      discountPercentages: {},
      extraPrices: {},
      monthlyPremiumRates: {},
    })
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('con una forma inesperada (un array en vez de un objeto), devuelve overrides vacíos', () => {
    localStorage.setItem(TARIFF_OVERRIDES_STORAGE_KEY, JSON.stringify(['sm', 4500]))

    expect(loadTariffOverrides()).toEqual({
      modalityPrices: {},
      discountPercentages: {},
      extraPrices: {},
      monthlyPremiumRates: {},
    })
  })

  it('descarta entradas con id desconocido o valor no numérico/no positivo, conservando las válidas', () => {
    localStorage.setItem(
      TARIFF_OVERRIDES_STORAGE_KEY,
      JSON.stringify({
        modalityPrices: { sm: 4500, not_a_real_modality: 999, dr_sq: -10, sv: 'gratis', pp: 0 },
        discountPercentages: { week: 20 },
        extraPrices: {},
        monthlyPremiumRates: { high: 750, standard: Number.NaN },
      }),
    )

    expect(loadTariffOverrides()).toEqual({
      modalityPrices: { sm: 4500 },
      discountPercentages: { week: 20 },
      extraPrices: {},
      monthlyPremiumRates: { high: 750 },
    })
  })

  it('con valores válidos guardados previamente, los recupera tal cual (round-trip con saveTariffOverrides)', () => {
    const overrides = {
      modalityPrices: { sm: 4500 },
      discountPercentages: { week: 20 },
      extraPrices: { locker: 160 },
      monthlyPremiumRates: { high: 750 },
    }

    saveTariffOverrides(overrides)

    expect(loadTariffOverrides()).toEqual(overrides)
  })
})

describe('saveTariffOverrides', () => {
  it('si localStorage lanza (p. ej. cuota excedida), no propaga la excepción', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError simulado')
    })
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      saveTariffOverrides({ modalityPrices: {}, discountPercentages: {}, extraPrices: {}, monthlyPremiumRates: {} }),
    ).not.toThrow()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
