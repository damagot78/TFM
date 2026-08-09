import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ExportedQuote } from '../types/exportedQuote'
import {
  appendExportedQuote,
  clearExportedQuotes,
  EXPORTED_QUOTES_STORAGE_KEY,
  loadExportedQuotes,
  removeExportedQuote,
  saveExportedQuotes,
} from './exportedQuotesRepository'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

const SAMPLE_QUOTE: ExportedQuote = {
  id: 'quote-1',
  agentName: 'Agente 1',
  generatedAt: '2026-08-08T10:00:00.000Z',
  subscriberName: 'Juan Pérez',
  subscriberEmail: 'juan@example.com',
  age: 40,
  modalityName: 'Golf Son Muntaner (SM)',
  discounts: [{ name: 'Lunes a Viernes', percentage: 15, amount: 660 }],
  monthlyPremiumUnits: [],
  extras: [{ name: 'Alquiler de Taquilla', price: 150, includedFree: false }],
  total: 2674.5,
}

describe('loadExportedQuotes', () => {
  it('sin nada guardado, devuelve una lista vacía', () => {
    expect(loadExportedQuotes()).toEqual([])
  })

  it('con un JSON que no es válido, devuelve vacío y registra el error', () => {
    localStorage.setItem(EXPORTED_QUOTES_STORAGE_KEY, '{ esto no es json')
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(loadExportedQuotes()).toEqual([])
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('con una forma inesperada (un objeto en vez de un array), devuelve vacío', () => {
    localStorage.setItem(EXPORTED_QUOTES_STORAGE_KEY, JSON.stringify({ not: 'an array' }))

    expect(loadExportedQuotes()).toEqual([])
  })

  it('descarta elementos con forma inválida, conservando los válidos', () => {
    localStorage.setItem(
      EXPORTED_QUOTES_STORAGE_KEY,
      JSON.stringify([SAMPLE_QUOTE, { id: 'broken', total: 'not-a-number' }, 'not-an-object']),
    )

    expect(loadExportedQuotes()).toEqual([SAMPLE_QUOTE])
  })

  it('round-trip: lo guardado con saveExportedQuotes se recupera tal cual', () => {
    saveExportedQuotes([SAMPLE_QUOTE])

    expect(loadExportedQuotes()).toEqual([SAMPLE_QUOTE])
  })

  it('valida también las líneas de monthly_premium: conserva las válidas y descarta las corruptas', () => {
    const monthlyQuote: ExportedQuote = {
      ...SAMPLE_QUOTE,
      id: 'quote-monthly',
      discounts: [],
      monthlyPremiumUnits: [
        { month: 1, rate: 'high', price: 725, resolvedManually: false },
        { month: 2, rate: 'not-a-real-rate' as never, price: 860, resolvedManually: true },
      ],
    }
    localStorage.setItem(EXPORTED_QUOTES_STORAGE_KEY, JSON.stringify([monthlyQuote]))

    expect(loadExportedQuotes()).toEqual([
      { ...monthlyQuote, monthlyPremiumUnits: [{ month: 1, rate: 'high', price: 725, resolvedManually: false }] },
    ])
  })
})

describe('appendExportedQuote', () => {
  it('añade una cotización a la lista persistida y la devuelve', () => {
    const result = appendExportedQuote(SAMPLE_QUOTE)

    expect(result).toEqual([SAMPLE_QUOTE])
    expect(loadExportedQuotes()).toEqual([SAMPLE_QUOTE])
  })

  it('acumula varias cotizaciones en orden', () => {
    const second: ExportedQuote = { ...SAMPLE_QUOTE, id: 'quote-2' }

    appendExportedQuote(SAMPLE_QUOTE)
    const result = appendExportedQuote(second)

    expect(result.map((q) => q.id)).toEqual(['quote-1', 'quote-2'])
  })
})

describe('removeExportedQuote', () => {
  it('elimina solo la cotización con el id indicado', () => {
    const second: ExportedQuote = { ...SAMPLE_QUOTE, id: 'quote-2' }
    saveExportedQuotes([SAMPLE_QUOTE, second])

    const result = removeExportedQuote('quote-1')

    expect(result).toEqual([second])
    expect(loadExportedQuotes()).toEqual([second])
  })
})

describe('clearExportedQuotes', () => {
  it('vacía la lista persistida', () => {
    saveExportedQuotes([SAMPLE_QUOTE])

    clearExportedQuotes()

    expect(loadExportedQuotes()).toEqual([])
  })

  it('si localStorage lanza al borrar, no propaga la excepción', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('fallo simulado')
    })
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => clearExportedQuotes()).not.toThrow()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})

describe('saveExportedQuotes', () => {
  it('si localStorage lanza al guardar, no propaga la excepción', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError simulado')
    })
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => saveExportedQuotes([SAMPLE_QUOTE])).not.toThrow()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
