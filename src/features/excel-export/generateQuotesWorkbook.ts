import type ExcelJS from 'exceljs'
import type { ExportedQuote } from '../../shared/types/exportedQuote'
import type { SeasonRate } from '../../shared/types/catalog'
import { sanitizeExcelCellValue } from './sanitizeExcelCellValue'

const SHEET_NAME = 'Cotizaciones'

const RATE_LABELS: Record<SeasonRate, string> = { high: 'Alta', standard: 'Estándar' }

const COLUMNS: Partial<ExcelJS.Column>[] = [
  { header: 'Agente', key: 'agentName', width: 18 },
  { header: 'Fecha', key: 'generatedAt', width: 20 },
  { header: 'Abonado', key: 'subscriberName', width: 24 },
  { header: 'Email', key: 'subscriberEmail', width: 26 },
  { header: 'Edad', key: 'age', width: 8 },
  { header: 'Modalidad', key: 'modalityName', width: 30 },
  { header: 'Descuentos aplicados', key: 'discountsSummary', width: 45 },
  { header: 'Tarifa por mes (Premium Mensual)', key: 'monthlySummary', width: 45 },
  { header: 'Extras', key: 'extrasSummary', width: 35 },
  { header: 'Total (€)', key: 'total', width: 12 },
]

function formatDiscountsSummary(quote: ExportedQuote): string {
  return quote.discounts
    .map((discount) => `${discount.name} (${discount.percentage}%): -${discount.amount.toFixed(2)} €`)
    .join('; ')
}

function formatMonthlySummary(quote: ExportedQuote): string {
  return quote.monthlyPremiumUnits
    .map((unit) => {
      const manualSuffix = unit.resolvedManually ? ' [elección manual]' : ''
      return `Mes ${unit.month}: ${RATE_LABELS[unit.rate]} (${unit.price} €)${manualSuffix}`
    })
    .join('; ')
}

function formatExtrasSummary(quote: ExportedQuote): string {
  return quote.extras
    .map((extra) => (extra.includedFree ? `${extra.name} (incluido)` : `${extra.name} (${extra.price} €)`))
    .join('; ')
}

/**
 * Genera el libro `.xlsx` de las cotizaciones acumuladas, una fila por
 * cotización. `exceljs` se importa dinámicamente: es una librería pesada que
 * solo hace falta en el momento de exportar, no en la carga inicial de la app.
 */
export async function generateQuotesWorkbook(quotes: ExportedQuote[]): Promise<ArrayBuffer> {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(SHEET_NAME)
  sheet.columns = COLUMNS

  for (const quote of quotes) {
    sheet.addRow({
      agentName: sanitizeExcelCellValue(quote.agentName),
      generatedAt: new Date(quote.generatedAt).toLocaleString('es-ES'),
      subscriberName: sanitizeExcelCellValue(quote.subscriberName),
      subscriberEmail: sanitizeExcelCellValue(quote.subscriberEmail),
      age: quote.age,
      modalityName: quote.modalityName,
      discountsSummary: formatDiscountsSummary(quote),
      monthlySummary: formatMonthlySummary(quote),
      extrasSummary: formatExtrasSummary(quote),
      total: quote.total,
    })
  }

  sheet.getRow(1).font = { bold: true }

  return (await workbook.xlsx.writeBuffer()) as ArrayBuffer
}
