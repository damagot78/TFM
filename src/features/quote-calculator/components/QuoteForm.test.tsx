import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { loadExportedQuotes } from '../../../shared/utils/exportedQuotesRepository'
import { QuoteForm } from './QuoteForm'

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('QuoteForm (integración)', () => {
  it('reproduce el caso dorado de principio a fin: SM + Lunes a Viernes + Abono Tarde + Familiar = 2.524,50 €', () => {
    render(<QuoteForm agentName="Agente 1" />)

    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'sm' } })
    fireEvent.click(screen.getByLabelText('Lunes a Viernes (15%)'))
    fireEvent.click(screen.getByLabelText('Abono Tarde (desde 14h) (25%)'))
    fireEvent.click(screen.getByLabelText('Descuento Familiar (10%)'))

    expect(screen.getAllByText('2524.50 €')).toHaveLength(2) // subtotal cuota + total general
  })

  it('sumar un extra al caso dorado actualiza el total general', () => {
    render(<QuoteForm agentName="Agente 1" />)

    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'sm' } })
    fireEvent.click(screen.getByLabelText('Lunes a Viernes (15%)'))
    fireEvent.click(screen.getByLabelText('Abono Tarde (desde 14h) (25%)'))
    fireEvent.click(screen.getByLabelText('Descuento Familiar (10%)'))
    fireEvent.click(screen.getByLabelText(/Alquiler de Taquilla/))

    expect(screen.getByText('2674.50 €')).toBeInTheDocument() // 2524.50 + 150
  })

  it('para monthly_premium, muestra el selector de fecha/meses en vez de descuentos', () => {
    render(<QuoteForm agentName="Agente 1" />)

    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'monthly_premium' } })

    expect(screen.getByLabelText('Fecha de inicio')).toBeInTheDocument()
    expect(screen.queryByText('Descuentos')).not.toBeInTheDocument()
  })

  it('sin modalidad seleccionada, no se puede añadir a la exportación', () => {
    render(<QuoteForm agentName="Agente 1" />)

    expect(screen.queryByRole('button', { name: /Añadir a exportación/ })).not.toBeInTheDocument()
  })

  it('añadir el caso dorado a la exportación lo persiste con el agente y el total correctos', () => {
    render(<QuoteForm agentName="Agente 1" />)

    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'sm' } })
    fireEvent.click(screen.getByLabelText('Lunes a Viernes (15%)'))
    fireEvent.click(screen.getByLabelText('Abono Tarde (desde 14h) (25%)'))
    fireEvent.click(screen.getByLabelText('Descuento Familiar (10%)'))
    fireEvent.click(screen.getByRole('button', { name: /Añadir a exportación/ }))

    expect(screen.getByRole('status')).toHaveTextContent('exportación')
    const stored = loadExportedQuotes()
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({ agentName: 'Agente 1', modalityName: 'Golf Son Muntaner (SM)', total: 2524.5 })
  })

  it('tras exportar con éxito, el formulario queda vacío para la siguiente cotización', () => {
    render(<QuoteForm agentName="Agente 1" />)

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan Pérez' } })
    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'sm' } })
    fireEvent.click(screen.getByRole('button', { name: /Añadir a exportación/ }))

    expect(screen.getByLabelText('Nombre')).toHaveValue('')
    expect(screen.getByLabelText('Modalidad')).toHaveValue('')
  })

  it('empezar una cotización nueva tras exportar oculta la confirmación anterior', () => {
    render(<QuoteForm agentName="Agente 1" />)

    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'sm' } })
    fireEvent.click(screen.getByRole('button', { name: /Añadir a exportación/ }))
    expect(screen.getByRole('status')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'sq' } })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
