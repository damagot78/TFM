import ExcelJS from 'exceljs'
import { describe, expect, it } from 'vitest'
import type { ExportedQuote } from '../../shared/types/exportedQuote'
import { generateQuotesWorkbook } from './generateQuotesWorkbook'

const SAMPLE_QUOTE: ExportedQuote = {
  id: 'quote-1',
  agentName: 'Agente 1',
  generatedAt: '2026-08-08T10:00:00.000Z',
  subscriberName: 'Juan Pérez',
  subscriberEmail: 'juan@example.com',
  age: 40,
  modalityName: 'Golf Son Muntaner (SM)',
  discounts: [
    { name: 'Lunes a Viernes', percentage: 15, amount: 660 },
    { name: 'Descuento Familiar', percentage: 10, amount: 280.5 },
  ],
  monthlyPremiumUnits: [],
  extras: [{ name: 'Alquiler de Taquilla', price: 150, includedFree: false }],
  total: 2674.5,
}

// El .xlsx no guarda las claves de columna de exceljs (son solo un helper en
// memoria del workbook original) — al recargar desde el buffer solo se puede
// direccionar por número de columna, en el mismo orden que COLUMNS.
const COLUMN = {
  agentName: 1,
  generatedAt: 2,
  subscriberName: 3,
  subscriberEmail: 4,
  age: 5,
  modalityName: 6,
  discountsSummary: 7,
  monthlySummary: 8,
  extrasSummary: 9,
  total: 10,
} as const

async function readBackWorkbook(buffer: ArrayBuffer) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  return workbook.getWorksheet('Cotizaciones')!
}

describe('generateQuotesWorkbook', () => {
  it('sin cotizaciones, genera un libro con solo la fila de cabeceras', async () => {
    const buffer = await generateQuotesWorkbook([])
    const sheet = await readBackWorkbook(buffer)

    expect(sheet.rowCount).toBe(1)
    expect(sheet.getRow(1).getCell(COLUMN.agentName).text).toBe('Agente')
  })

  it('añade una fila por cotización con los datos principales', async () => {
    const buffer = await generateQuotesWorkbook([SAMPLE_QUOTE])
    const sheet = await readBackWorkbook(buffer)

    expect(sheet.rowCount).toBe(2)
    const row = sheet.getRow(2)
    expect(row.getCell(COLUMN.agentName).text).toBe('Agente 1')
    expect(row.getCell(COLUMN.subscriberName).text).toBe('Juan Pérez')
    expect(row.getCell(COLUMN.subscriberEmail).text).toBe('juan@example.com')
    expect(row.getCell(COLUMN.age).value).toBe(40)
    expect(row.getCell(COLUMN.modalityName).text).toBe('Golf Son Muntaner (SM)')
    expect(row.getCell(COLUMN.total).value).toBe(2674.5)
  })

  it('resume los descuentos aplicados en una sola columna legible', async () => {
    const buffer = await generateQuotesWorkbook([SAMPLE_QUOTE])
    const sheet = await readBackWorkbook(buffer)

    const summary = sheet.getRow(2).getCell(COLUMN.discountsSummary).text
    expect(summary).toContain('Lunes a Viernes (15%)')
    expect(summary).toContain('Descuento Familiar (10%)')
  })

  it('resume los extras, marcando los gratuitos como "incluido"', async () => {
    const quoteWithFreeExtra: ExportedQuote = {
      ...SAMPLE_QUOTE,
      id: 'quote-free-extra',
      extras: [{ name: 'Buggy ilimitado anual', price: 0, includedFree: true }],
    }

    const buffer = await generateQuotesWorkbook([quoteWithFreeExtra])
    const sheet = await readBackWorkbook(buffer)

    const summary = sheet.getRow(2).getCell(COLUMN.extrasSummary).text
    expect(summary).toBe('Buggy ilimitado anual (incluido)')
  })

  it('resume el desglose por mes para monthly_premium', async () => {
    const monthlyQuote: ExportedQuote = {
      ...SAMPLE_QUOTE,
      id: 'quote-2',
      discounts: [],
      monthlyPremiumUnits: [
        { month: 1, rate: 'high', price: 725, resolvedManually: false },
        { month: 2, rate: 'standard', price: 860, resolvedManually: true },
      ],
    }

    const buffer = await generateQuotesWorkbook([monthlyQuote])
    const sheet = await readBackWorkbook(buffer)

    const summary = sheet.getRow(2).getCell(COLUMN.monthlySummary).text
    expect(summary).toContain('Mes 1: Alta (725')
    expect(summary).toContain('Mes 2: Estándar (860')
    expect(summary).toContain('manual')
  })

  it('neutraliza un nombre de abonado que empieza por "=" (Formula Injection)', async () => {
    const maliciousQuote: ExportedQuote = { ...SAMPLE_QUOTE, id: 'quote-3', subscriberName: '=2+2' }

    const buffer = await generateQuotesWorkbook([maliciousQuote])
    const sheet = await readBackWorkbook(buffer)

    const cell = sheet.getRow(2).getCell(COLUMN.subscriberName)
    expect(cell.text).toBe("'=2+2")
    expect(cell.type).not.toBe(ExcelJS.ValueType.Formula)
  })
})
