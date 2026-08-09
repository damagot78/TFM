import { describe, expect, it } from 'vitest'
import type { ModalityId } from '../../shared/types/catalog'
import { buildExportedQuote } from './buildExportedQuote'

const NOW = new Date('2026-08-08T10:00:00.000Z')

describe('buildExportedQuote', () => {
  it('sin cotización (quote.kind "none"), devuelve null', () => {
    const result = buildExportedQuote(
      {
        quote: { kind: 'none' },
        extras: { success: true, items: [], total: 0 },
        grandTotal: 0,
        modalityId: '',
        subscriberName: '',
        email: '',
        age: null,
      },
      'Agente 1',
      NOW,
    )

    expect(result).toBeNull()
  })

  it('con la cascada rechazada (success:false), devuelve null', () => {
    const result = buildExportedQuote(
      {
        quote: { kind: 'cascade', result: { success: false, errors: ['algo falló'] } },
        extras: { success: true, items: [], total: 0 },
        grandTotal: 0,
        modalityId: 'sm',
        subscriberName: 'Juan',
        email: '',
        age: null,
      },
      'Agente 1',
      NOW,
    )

    expect(result).toBeNull()
  })

  it('con extras rechazados (success:false) aunque la cascada sea válida, devuelve null', () => {
    const result = buildExportedQuote(
      {
        quote: {
          kind: 'cascade',
          result: { success: true, modalityId: 'sm', basePrice: 4400, steps: [], total: 4400, savings: 0 },
        },
        extras: { success: false, errors: ['algo falló'] },
        grandTotal: 0,
        modalityId: 'sm',
        subscriberName: 'Juan',
        email: '',
        age: null,
      },
      'Agente 1',
      NOW,
    )

    expect(result).toBeNull()
  })

  it('caso dorado (cascada válida): construye el snapshot completo con los tres descuentos', () => {
    const result = buildExportedQuote(
      {
        quote: {
          kind: 'cascade',
          result: {
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
          },
        },
        extras: { success: true, items: [{ extraId: 'locker', price: 150, includedFree: false }], total: 150 },
        grandTotal: 2674.5,
        modalityId: 'sm',
        subscriberName: 'Juan Pérez',
        email: 'juan@example.com',
        age: 40,
      },
      'Agente 1',
      NOW,
    )

    expect(result).toMatchObject({
      agentName: 'Agente 1',
      generatedAt: NOW.toISOString(),
      subscriberName: 'Juan Pérez',
      subscriberEmail: 'juan@example.com',
      age: 40,
      modalityName: 'Golf Son Muntaner (SM)',
      discounts: [
        { name: 'Lunes a Viernes', percentage: 15, amount: 660 },
        { name: 'Abono Tarde (desde 14h)', percentage: 25, amount: 935 },
        { name: 'Descuento Familiar', percentage: 10, amount: 280.5 },
      ],
      monthlyPremiumUnits: [],
      extras: [{ name: 'Alquiler de Taquilla', price: 150, includedFree: false }],
      total: 2674.5,
    })
    expect(typeof result?.id).toBe('string')
    expect(result?.id.length).toBeGreaterThan(0)
  })

  it('monthly_premium: construye el desglose por mes en vez de descuentos', () => {
    const result = buildExportedQuote(
      {
        quote: {
          kind: 'monthly',
          result: {
            success: true,
            units: [
              { index: 0, rate: 'high', price: 725, resolvedManually: false },
              { index: 1, rate: 'standard', price: 860, resolvedManually: true },
            ],
            total: 1585,
          },
        },
        extras: { success: true, items: [], total: 0 },
        grandTotal: 1585,
        modalityId: 'monthly_premium',
        subscriberName: 'Ana',
        email: '',
        age: null,
      },
      'Agente 2',
      NOW,
    )

    expect(result).toMatchObject({
      modalityName: 'Premium Mensual',
      discounts: [],
      monthlyPremiumUnits: [
        { month: 1, rate: 'high', price: 725, resolvedManually: false },
        { month: 2, rate: 'standard', price: 860, resolvedManually: true },
      ],
      total: 1585,
    })
  })

  it('genera un id distinto en cada llamada', () => {
    const source = {
      quote: {
        kind: 'cascade' as const,
        result: { success: true as const, modalityId: 'pp' as const, basePrice: 725, steps: [], total: 725, savings: 0 },
      },
      extras: { success: true as const, items: [], total: 0 },
      grandTotal: 725,
      modalityId: 'pp' as const,
      subscriberName: '',
      email: '',
      age: null,
    }

    const first = buildExportedQuote(source, 'Agente 1', NOW)
    const second = buildExportedQuote(source, 'Agente 1', NOW)

    expect(first?.id).not.toBe(second?.id)
  })

  it('con una modalidad que no existe en el catálogo, devuelve null', () => {
    const result = buildExportedQuote(
      {
        quote: {
          kind: 'cascade',
          result: { success: true, modalityId: 'sm', basePrice: 4400, steps: [], total: 4400, savings: 0 },
        },
        extras: { success: true, items: [], total: 0 },
        grandTotal: 4400,
        modalityId: 'not-a-real-modality' as ModalityId,
        subscriberName: '',
        email: '',
        age: null,
      },
      'Agente 1',
      NOW,
    )

    expect(result).toBeNull()
  })
})
