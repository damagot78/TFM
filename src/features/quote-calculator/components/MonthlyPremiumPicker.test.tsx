import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MonthlyPremiumPicker } from './MonthlyPremiumPicker'

function renderPicker(overrides: Partial<Parameters<typeof MonthlyPremiumPicker>[0]> = {}) {
  const props = {
    startDate: '',
    onStartDateChange: vi.fn(),
    months: 1 as const,
    onMonthsChange: vi.fn(),
    preview: [],
    manualChoices: {},
    onManualChoiceChange: vi.fn(),
    ...overrides,
  }
  render(<MonthlyPremiumPicker {...props} />)
  return props
}

describe('MonthlyPremiumPicker', () => {
  it('cambiar la fecha de inicio llama a onStartDateChange', () => {
    const props = renderPicker()

    fireEvent.change(screen.getByLabelText('Fecha de inicio'), { target: { value: '2026-08-01' } })

    expect(props.onStartDateChange).toHaveBeenCalledWith('2026-08-01')
  })

  it('cambiar el número de meses llama a onMonthsChange con un número', () => {
    const props = renderPicker()

    fireEvent.change(screen.getByLabelText('Número de meses'), { target: { value: '2' } })

    expect(props.onMonthsChange).toHaveBeenCalledWith(2)
  })

  it('muestra cada mes automático con su tarifa y precio', () => {
    renderPicker({
      preview: [
        { index: 0, status: 'automatic', rate: 'high', price: 725 },
        { index: 1, status: 'automatic', rate: 'standard', price: 860 },
      ],
    })

    expect(screen.getByText('Mes 1: tarifa Alta — 725 €')).toBeInTheDocument()
    expect(screen.getByText('Mes 2: tarifa Estándar — 860 €')).toBeInTheDocument()
  })

  it('un mes pendiente muestra dos botones de elección y avisa del cruce de temporada', () => {
    renderPicker({
      preview: [{ index: 0, status: 'pending', options: ['standard', 'high'] }],
    })

    expect(screen.getByText(/cruza dos temporadas/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Estándar (860 €)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Alta (725 €)' })).toBeInTheDocument()
  })

  it('elegir una tarifa para un mes pendiente llama a onManualChoiceChange', () => {
    const props = renderPicker({
      preview: [{ index: 0, status: 'pending', options: ['standard', 'high'] }],
    })

    fireEvent.click(screen.getByRole('button', { name: 'Alta (725 €)' }))

    expect(props.onManualChoiceChange).toHaveBeenCalledWith(0, 'high')
  })

  it('resalta visualmente la tarifa ya elegida para un mes pendiente', () => {
    renderPicker({
      preview: [{ index: 0, status: 'pending', options: ['standard', 'high'] }],
      manualChoices: { 0: 'high' },
    })

    expect(screen.getByRole('button', { name: 'Alta (725 €)' })).toHaveClass('bg-gray-900')
    expect(screen.getByRole('button', { name: 'Estándar (860 €)' })).not.toHaveClass('bg-gray-900')
  })
})
