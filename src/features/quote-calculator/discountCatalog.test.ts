import { describe, expect, it } from 'vitest'
import type { DiscountId } from '../../shared/types/catalog'
import { getBlockingSelections, getDiscountOrThrow, isDiscountAllowedForCategory } from './discountCatalog'

describe('getDiscountOrThrow', () => {
  it('devuelve el descuento del catálogo para un id válido', () => {
    expect(getDiscountOrThrow('week').name).toBe('Lunes a Viernes')
  })

  it('lanza un error si el id no existe en el catálogo', () => {
    expect(() => getDiscountOrThrow('not-a-real-discount' as DiscountId)).toThrow()
  })
})

describe('isDiscountAllowedForCategory', () => {
  it('un descuento sin restricción de categoría se permite en cualquier categoría', () => {
    const upgrade = getDiscountOrThrow('upgrade')
    expect(isDiscountAllowedForCategory(upgrade, 'standard')).toBe(true)
    expect(isDiscountAllowedForCategory(upgrade, 'premium')).toBe(true)
    expect(isDiscountAllowedForCategory(upgrade, 'monthly')).toBe(true)
  })

  it('"Lunes a Viernes" (excludes-premium) no se permite en Premium, sí en el resto', () => {
    const week = getDiscountOrThrow('week')
    expect(isDiscountAllowedForCategory(week, 'premium')).toBe(false)
    expect(isDiscountAllowedForCategory(week, 'standard')).toBe(true)
  })

  it('"Niño" (premium-only) solo se permite en Premium', () => {
    const child = getDiscountOrThrow('child')
    expect(isDiscountAllowedForCategory(child, 'premium')).toBe(true)
    expect(isDiscountAllowedForCategory(child, 'standard')).toBe(false)
  })
})

describe('getBlockingSelections', () => {
  it('devuelve vacío si ningún seleccionado es incompatible con el candidato', () => {
    expect(getBlockingSelections('family', ['week', 'avsv'])).toEqual([])
  })

  it('devuelve los ids seleccionados que son incompatibles con el candidato', () => {
    expect(getBlockingSelections('family', ['child'])).toEqual(['child'])
  })

  it('devuelve varios ids si más de un seleccionado es incompatible', () => {
    expect(getBlockingSelections('child', ['family', 'sub25', 'avsv'])).toEqual(['family', 'sub25'])
  })

  it('no se bloquea a sí mismo si ya está en la lista de seleccionados', () => {
    expect(getBlockingSelections('family', ['family'])).toEqual([])
  })
})
