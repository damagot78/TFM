import { describe, expect, it } from 'vitest'
import { filterDiscountsEligibleByAge, isAdult, isDiscountEligibleByAge } from './ageEligibility'

describe('isDiscountEligibleByAge', () => {
  it('un descuento sin restricción de edad es elegible a cualquier edad', () => {
    expect(isDiscountEligibleByAge('week', 5)).toBe(true)
    expect(isDiscountEligibleByAge('week', 90)).toBe(true)
    expect(isDiscountEligibleByAge('week', null)).toBe(true)
  })

  it('"young" (26-35 años) respeta ambos límites', () => {
    expect(isDiscountEligibleByAge('young', 25)).toBe(false)
    expect(isDiscountEligibleByAge('young', 26)).toBe(true)
    expect(isDiscountEligibleByAge('young', 35)).toBe(true)
    expect(isDiscountEligibleByAge('young', 36)).toBe(false)
  })

  it('"child" (6-12 años) respeta ambos límites', () => {
    expect(isDiscountEligibleByAge('child', 5)).toBe(false)
    expect(isDiscountEligibleByAge('child', 6)).toBe(true)
    expect(isDiscountEligibleByAge('child', 12)).toBe(true)
    expect(isDiscountEligibleByAge('child', 13)).toBe(false)
  })

  it('"junior" (13-18 años) respeta ambos límites', () => {
    expect(isDiscountEligibleByAge('junior', 12)).toBe(false)
    expect(isDiscountEligibleByAge('junior', 13)).toBe(true)
    expect(isDiscountEligibleByAge('junior', 18)).toBe(true)
    expect(isDiscountEligibleByAge('junior', 19)).toBe(false)
  })

  it('"sub25" (hasta 25 años, sin mínimo) respeta solo el máximo', () => {
    expect(isDiscountEligibleByAge('sub25', 0)).toBe(true)
    expect(isDiscountEligibleByAge('sub25', 25)).toBe(true)
    expect(isDiscountEligibleByAge('sub25', 26)).toBe(false)
  })

  it('si la edad es desconocida (null), los descuentos con restricción de edad no son elegibles', () => {
    expect(isDiscountEligibleByAge('young', null)).toBe(false)
    expect(isDiscountEligibleByAge('child', null)).toBe(false)
    expect(isDiscountEligibleByAge('junior', null)).toBe(false)
    expect(isDiscountEligibleByAge('sub25', null)).toBe(false)
  })
})

describe('filterDiscountsEligibleByAge', () => {
  it('para 10 años, filtra a los descuentos sin restricción más "child" y "sub25"', () => {
    expect(filterDiscountsEligibleByAge(10)).toEqual([
      'week',
      'afternoon',
      'upgrade',
      'avsv',
      'family',
      'child',
      'sub25',
      'referral',
    ])
  })

  it('para edad desconocida, filtra a solo los descuentos sin restricción de edad', () => {
    expect(filterDiscountsEligibleByAge(null)).toEqual([
      'week',
      'afternoon',
      'upgrade',
      'avsv',
      'family',
      'referral',
    ])
  })
})

describe('isAdult', () => {
  it('con fecha de nacimiento conocida, la edad manda: 18+ es adulto sin importar descuentos', () => {
    expect(isAdult(18, [])).toBe(true)
    expect(isAdult(18, ['child'])).toBe(true)
  })

  it('con fecha de nacimiento conocida, un menor de 18 nunca es adulto aunque no tenga descuento infantil', () => {
    expect(isAdult(15, [])).toBe(false)
  })

  it('sin fecha de nacimiento conocida, es adulto por defecto si no hay descuento Niño/Junior activo', () => {
    expect(isAdult(null, [])).toBe(true)
    expect(isAdult(null, ['week', 'family'])).toBe(true)
  })

  it('sin fecha de nacimiento conocida, no es adulto si el descuento Niño o Junior está activo', () => {
    expect(isAdult(null, ['child'])).toBe(false)
    expect(isAdult(null, ['junior'])).toBe(false)
  })
})
