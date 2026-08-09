import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { QuoteState } from '../useQuoteForm'
import { QuoteSummary } from './QuoteSummary'

const EMPTY_EXTRAS = { success: true as const, items: [], total: 0 }

describe('QuoteSummary', () => {
  it('sin modalidad seleccionada, muestra un mensaje de placeholder', () => {
    render(<QuoteSummary quote={{ kind: 'none' }} extras={EMPTY_EXTRAS} grandTotal={0} />)

    expect(screen.getByText('Selecciona una modalidad para ver el resumen.')).toBeInTheDocument()
  })

  it('reproduce el caso dorado: base 4.400 €, tres pasos de cascada y subtotal 2.524,50 €', () => {
    const quote: QuoteState = {
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
    }

    render(<QuoteSummary quote={quote} extras={EMPTY_EXTRAS} grandTotal={2524.5} />)

    expect(screen.getByText('4400.00 €')).toBeInTheDocument()
    expect(screen.getByText(/Lunes a Viernes \(15% sobre 4400.00 €\)/)).toBeInTheDocument()
    expect(screen.getByText(/Abono Tarde \(desde 14h\) \(25% sobre 3740.00 €\)/)).toBeInTheDocument()
    expect(screen.getByText(/Descuento Familiar \(10% sobre 2805.00 €\)/)).toBeInTheDocument()
    expect(screen.getByText('−280.50 €')).toBeInTheDocument()
    expect(screen.getAllByText('2524.50 €')).toHaveLength(2) // subtotal cuota + total general
  })

  it('si la cascada se rechaza, muestra los motivos en vez de un importe', () => {
    const quote: QuoteState = {
      kind: 'cascade',
      result: { success: false, errors: ['Máximo 3 descuentos simultáneos.'] },
    }

    render(<QuoteSummary quote={quote} extras={EMPTY_EXTRAS} grandTotal={0} />)

    expect(screen.getByText('Máximo 3 descuentos simultáneos.')).toBeInTheDocument()
  })

  it('para monthly_premium, muestra el desglose mensual y el subtotal', () => {
    const quote: QuoteState = {
      kind: 'monthly',
      result: {
        success: true,
        units: [
          { index: 0, rate: 'high', price: 725, resolvedManually: false },
          { index: 1, rate: 'standard', price: 860, resolvedManually: true },
        ],
        total: 1585,
      },
    }

    render(<QuoteSummary quote={quote} extras={EMPTY_EXTRAS} grandTotal={1585} />)

    expect(screen.getByText('725.00 €')).toBeInTheDocument()
    expect(screen.getByText(/Mes 2 \(elegido manualmente\)/)).toBeInTheDocument()
  })

  it('para monthly_premium, si hay un cruce de temporada pendiente, muestra el aviso', () => {
    const quote: QuoteState = {
      kind: 'monthly',
      result: { success: false, errors: ['El mes contratado #1 cruza dos meses naturales con tarifas distintas.'] },
    }

    render(<QuoteSummary quote={quote} extras={EMPTY_EXTRAS} grandTotal={0} />)

    expect(
      screen.getByText('El mes contratado #1 cruza dos meses naturales con tarifas distintas.'),
    ).toBeInTheDocument()
  })

  it('muestra los extras contratados, marcando los gratuitos como "incluido"', () => {
    const quote: QuoteState = { kind: 'none' }
    const extras = {
      success: true as const,
      items: [
        { extraId: 'locker' as const, price: 150, includedFree: false },
        { extraId: 'buggy_annual' as const, price: 0, includedFree: true },
      ],
      total: 150,
    }

    render(<QuoteSummary quote={quote} extras={extras} grandTotal={150} />)

    expect(screen.getByText('Alquiler de Taquilla')).toBeInTheDocument()
    expect(screen.getByText('incluido')).toBeInTheDocument()
  })

  it('siempre muestra el total general', () => {
    render(<QuoteSummary quote={{ kind: 'none' }} extras={EMPTY_EXTRAS} grandTotal={99.9} />)

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('99.90 €')).toBeInTheDocument()
  })

  it('sin cotización exportable, no muestra el botón de añadir a exportación', () => {
    render(<QuoteSummary quote={{ kind: 'none' }} extras={EMPTY_EXTRAS} grandTotal={0} canExport={false} />)

    expect(screen.queryByRole('button', { name: /Añadir a exportación/ })).not.toBeInTheDocument()
  })

  it('con una cotización exportable, el botón llama a onExport al pulsarlo', () => {
    const onExport = vi.fn()
    render(
      <QuoteSummary quote={{ kind: 'none' }} extras={EMPTY_EXTRAS} grandTotal={0} canExport onExport={onExport} />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Añadir a exportación/ }))

    expect(onExport).toHaveBeenCalled()
  })

  it('muestra la confirmación solo cuando exportedMessageVisible es true', () => {
    render(
      <QuoteSummary
        quote={{ kind: 'none' }}
        extras={EMPTY_EXTRAS}
        grandTotal={0}
        canExport
        exportedMessageVisible
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('exportación')
  })

  it('muestra la confirmación aunque ya no haya cotización exportable (formulario reiniciado tras exportar)', () => {
    render(
      <QuoteSummary
        quote={{ kind: 'none' }}
        extras={EMPTY_EXTRAS}
        grandTotal={0}
        canExport={false}
        exportedMessageVisible
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('exportación')
    expect(screen.queryByRole('button', { name: /Añadir a exportación/ })).not.toBeInTheDocument()
  })
})
