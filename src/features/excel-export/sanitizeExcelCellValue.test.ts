import { describe, expect, it } from 'vitest'
import { sanitizeExcelCellValue } from './sanitizeExcelCellValue'

describe('sanitizeExcelCellValue', () => {
  it.each(['=SUMA(A1:A9)', '+34600000000', '-1', '@SUM(1+1)', '\t=1+1', '\r=1+1'])(
    'neutraliza un valor que empieza por un carácter peligroso: %s',
    (value) => {
      const result = sanitizeExcelCellValue(value)

      expect(result.startsWith("'")).toBe(true)
      expect(result).toBe(`'${value}`)
    },
  )

  it('no modifica un valor normal', () => {
    expect(sanitizeExcelCellValue('Juan Pérez')).toBe('Juan Pérez')
  })

  it('no modifica una cadena vacía', () => {
    expect(sanitizeExcelCellValue('')).toBe('')
  })

  it('solo mira el primer carácter: un "=" que no está al principio no se toca', () => {
    expect(sanitizeExcelCellValue('Juan=Pérez')).toBe('Juan=Pérez')
  })
})
