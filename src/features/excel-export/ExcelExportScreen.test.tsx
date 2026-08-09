import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ExportedQuote } from '../../shared/types/exportedQuote'
import { loadExportedQuotes, saveExportedQuotes } from '../../shared/utils/exportedQuotesRepository'
import { ExcelExportScreen } from './ExcelExportScreen'
import * as generateQuotesWorkbookModule from './generateQuotesWorkbook'

vi.mock('./generateQuotesWorkbook', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./generateQuotesWorkbook')>()
  return { ...actual, generateQuotesWorkbook: vi.fn(actual.generateQuotesWorkbook) }
})

const SAMPLE_QUOTE: ExportedQuote = {
  id: 'quote-1',
  agentName: 'Agente 1',
  generatedAt: '2026-08-08T10:00:00.000Z',
  subscriberName: 'Juan Pérez',
  subscriberEmail: 'juan@example.com',
  age: 40,
  modalityName: 'Golf Son Muntaner (SM)',
  discounts: [],
  monthlyPremiumUnits: [],
  extras: [],
  total: 2524.5,
}

beforeEach(() => {
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:mock'),
    revokeObjectURL: vi.fn(),
  })
})

afterEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('ExcelExportScreen', () => {
  it('sin cotizaciones añadidas, muestra un mensaje de lista vacía', () => {
    render(<ExcelExportScreen />)

    expect(screen.getByText(/No hay cotizaciones/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Descargar Excel' })).not.toBeInTheDocument()
  })

  it('muestra una fila por cotización acumulada', () => {
    saveExportedQuotes([SAMPLE_QUOTE])

    render(<ExcelExportScreen />)

    expect(screen.getByText('Agente 1')).toBeInTheDocument()
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Golf Son Muntaner (SM)')).toBeInTheDocument()
    expect(screen.getByText('2524.50 €')).toBeInTheDocument()
  })

  it('"Quitar" elimina la cotización de la lista y de localStorage', () => {
    saveExportedQuotes([SAMPLE_QUOTE])

    render(<ExcelExportScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Quitar' }))

    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument()
    expect(loadExportedQuotes()).toEqual([])
  })

  it('"Vaciar lista" elimina todas las cotizaciones', () => {
    saveExportedQuotes([SAMPLE_QUOTE, { ...SAMPLE_QUOTE, id: 'quote-2' }])

    render(<ExcelExportScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Vaciar lista' }))

    expect(screen.getByText(/No hay cotizaciones/)).toBeInTheDocument()
    expect(loadExportedQuotes()).toEqual([])
  })

  it('"Descargar Excel" genera el archivo y dispara la descarga', async () => {
    saveExportedQuotes([SAMPLE_QUOTE])
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(<ExcelExportScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Descargar Excel' }))

    await waitFor(() => expect(clickSpy).toHaveBeenCalled())
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('si falla la generación del Excel, registra el error y no descarga nada', async () => {
    saveExportedQuotes([SAMPLE_QUOTE])
    vi.mocked(generateQuotesWorkbookModule.generateQuotesWorkbook).mockRejectedValueOnce(
      new Error('fallo simulado'),
    )
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ExcelExportScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Descargar Excel' }))

    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalled())
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })
})
