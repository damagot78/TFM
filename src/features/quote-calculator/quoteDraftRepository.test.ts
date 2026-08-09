import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearQuoteDraft,
  loadQuoteDraft,
  QUOTE_DRAFT_STORAGE_KEY,
  saveQuoteDraft,
  type QuoteDraft,
} from './quoteDraftRepository'

const EMPTY_DRAFT: QuoteDraft = {
  subscriberName: '',
  birthDate: '',
  email: '',
  phone: '',
  modalityId: '',
  monthlyStartDate: '',
  monthlyMonths: 1,
  monthlyManualChoices: {},
  discountIds: [],
  referralAmount: '',
  extraIds: [],
}

afterEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
})

describe('loadQuoteDraft', () => {
  it('sin nada guardado, devuelve el borrador vacío por defecto', () => {
    expect(loadQuoteDraft()).toEqual(EMPTY_DRAFT)
  })

  it('con un JSON que no es válido, devuelve el borrador vacío y registra el error', () => {
    sessionStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, '{ esto no es json')
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(loadQuoteDraft()).toEqual(EMPTY_DRAFT)
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('con una forma inesperada (un array en vez de un objeto), devuelve el borrador vacío', () => {
    sessionStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, JSON.stringify(['Juan', 'sm']))

    expect(loadQuoteDraft()).toEqual(EMPTY_DRAFT)
  })

  it('con un objeto vacío, todos los campos caen a su valor por defecto', () => {
    sessionStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, JSON.stringify({}))

    expect(loadQuoteDraft()).toEqual(EMPTY_DRAFT)
  })

  it('campos con tipo incorrecto caen a su default, conservando los campos válidos del resto', () => {
    sessionStorage.setItem(
      QUOTE_DRAFT_STORAGE_KEY,
      JSON.stringify({
        subscriberName: 'Juan Pérez',
        modalityId: 123,
        monthlyMonths: 7,
        discountIds: 'no es un array',
        extraIds: ['locker', 'not_a_real_extra'],
      }),
    )

    expect(loadQuoteDraft()).toEqual({
      ...EMPTY_DRAFT,
      subscriberName: 'Juan Pérez',
      modalityId: '',
      monthlyMonths: 1,
      discountIds: [],
      extraIds: ['locker'],
    })
  })

  it('descarta discountIds/modalityId desconocidos del catálogo, conservando los válidos', () => {
    sessionStorage.setItem(
      QUOTE_DRAFT_STORAGE_KEY,
      JSON.stringify({ modalityId: 'not_a_real_modality', discountIds: ['week', 'not_a_real_discount'] }),
    )

    expect(loadQuoteDraft()).toEqual({ ...EMPTY_DRAFT, modalityId: '', discountIds: ['week'] })
  })

  it('descarta entradas de monthlyManualChoices con clave o valor inválidos, conservando las válidas', () => {
    sessionStorage.setItem(
      QUOTE_DRAFT_STORAGE_KEY,
      JSON.stringify({ monthlyManualChoices: { 0: 'high', 1: 'not_a_real_rate', abc: 'standard' } }),
    )

    expect(loadQuoteDraft()).toEqual({ ...EMPTY_DRAFT, monthlyManualChoices: { 0: 'high' } })
  })

  it('con valores válidos guardados previamente, los recupera tal cual (round-trip con saveQuoteDraft)', () => {
    const draft: QuoteDraft = {
      subscriberName: 'Juan Pérez',
      birthDate: '1990-01-01',
      email: 'juan@example.com',
      phone: '600111222',
      modalityId: 'sm',
      monthlyStartDate: '',
      monthlyMonths: 1,
      monthlyManualChoices: {},
      discountIds: ['week'],
      referralAmount: '',
      extraIds: ['locker'],
    }

    saveQuoteDraft(draft)

    expect(loadQuoteDraft()).toEqual(draft)
  })
})

describe('saveQuoteDraft', () => {
  it('si sessionStorage lanza (p. ej. cuota excedida), no propaga la excepción', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError simulado')
    })
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => saveQuoteDraft(EMPTY_DRAFT)).not.toThrow()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})

describe('clearQuoteDraft', () => {
  it('elimina el borrador de sessionStorage', () => {
    saveQuoteDraft({ ...EMPTY_DRAFT, subscriberName: 'Juan Pérez' })

    clearQuoteDraft()

    expect(sessionStorage.getItem(QUOTE_DRAFT_STORAGE_KEY)).toBeNull()
    expect(loadQuoteDraft()).toEqual(EMPTY_DRAFT)
  })

  it('si sessionStorage lanza al borrar, no propaga la excepción', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('fallo simulado')
    })
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => clearQuoteDraft()).not.toThrow()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
