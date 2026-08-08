import { describe, expect, it } from 'vitest'
import { calculateAge } from './calculateAge'

describe('calculateAge', () => {
  it('calcula la edad cuando el cumpleaños ya pasó este año', () => {
    expect(calculateAge(new Date(2000, 0, 15), new Date(2026, 5, 1))).toBe(26)
  })

  it('calcula la edad cuando el cumpleaños todavía no ha llegado este año', () => {
    expect(calculateAge(new Date(2000, 11, 15), new Date(2026, 5, 1))).toBe(25)
  })

  it('calcula la edad el mismo día del cumpleaños', () => {
    expect(calculateAge(new Date(2000, 5, 1), new Date(2026, 5, 1))).toBe(26)
  })

  it('devuelve 0 para un recién nacido en la fecha de referencia', () => {
    expect(calculateAge(new Date(2026, 5, 1), new Date(2026, 5, 1))).toBe(0)
  })
})
