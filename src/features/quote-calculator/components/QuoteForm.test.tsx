import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuoteForm } from './QuoteForm'

describe('QuoteForm (integración)', () => {
  it('reproduce el caso dorado de principio a fin: SM + Lunes a Viernes + Abono Tarde + Familiar = 2.524,50 €', () => {
    render(<QuoteForm />)

    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'sm' } })
    fireEvent.click(screen.getByLabelText('Lunes a Viernes (15%)'))
    fireEvent.click(screen.getByLabelText('Abono Tarde (desde 14h) (25%)'))
    fireEvent.click(screen.getByLabelText('Descuento Familiar (10%)'))

    expect(screen.getAllByText('2524.50 €')).toHaveLength(2) // subtotal cuota + total general
  })

  it('sumar un extra al caso dorado actualiza el total general', () => {
    render(<QuoteForm />)

    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'sm' } })
    fireEvent.click(screen.getByLabelText('Lunes a Viernes (15%)'))
    fireEvent.click(screen.getByLabelText('Abono Tarde (desde 14h) (25%)'))
    fireEvent.click(screen.getByLabelText('Descuento Familiar (10%)'))
    fireEvent.click(screen.getByLabelText(/Alquiler de Taquilla/))

    expect(screen.getByText('2674.50 €')).toBeInTheDocument() // 2524.50 + 150
  })

  it('para monthly_premium, muestra el selector de fecha/meses en vez de descuentos', () => {
    render(<QuoteForm />)

    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'monthly_premium' } })

    expect(screen.getByLabelText('Fecha de inicio')).toBeInTheDocument()
    expect(screen.queryByText('Descuentos')).not.toBeInTheDocument()
  })
})
