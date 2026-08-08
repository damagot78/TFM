import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TARIFF_OVERRIDES_STORAGE_KEY } from '../../shared/utils/tariffOverridesRepository'
import { TariffAdminScreen } from './TariffAdminScreen'

afterEach(() => {
  localStorage.clear()
})

describe('TariffAdminScreen', () => {
  it('muestra las 4 secciones del catálogo editable', () => {
    render(<TariffAdminScreen />)

    expect(screen.getByRole('heading', { name: 'Modalidades' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Descuentos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Extras' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Premium Mensual' })).toBeInTheDocument()
  })

  it('cada campo se prellena con el precio/porcentaje del catálogo cuando no hay ningún override', () => {
    render(<TariffAdminScreen />)

    expect(screen.getByLabelText(/Golf Son Muntaner/)).toHaveValue(4400)
    expect(screen.getByLabelText(/Lunes a Viernes/)).toHaveValue(15)
    expect(screen.getByLabelText(/Alquiler de Taquilla/)).toHaveValue(150)
    expect(screen.getByLabelText(/^Alta/)).toHaveValue(725)
  })

  it('si ya había overrides guardados, los muestra prellenados en vez del catálogo', () => {
    localStorage.setItem(
      TARIFF_OVERRIDES_STORAGE_KEY,
      JSON.stringify({
        modalityPrices: { sm: 4500 },
        discountPercentages: {},
        extraPrices: {},
        monthlyPremiumRates: {},
      }),
    )

    render(<TariffAdminScreen />)

    expect(screen.getByLabelText(/Golf Son Muntaner/)).toHaveValue(4500)
  })

  it('editar un precio y guardar lo persiste en localStorage', () => {
    render(<TariffAdminScreen />)

    fireEvent.change(screen.getByLabelText(/Golf Son Muntaner/), { target: { value: '4500' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    const saved = JSON.parse(localStorage.getItem(TARIFF_OVERRIDES_STORAGE_KEY) ?? '{}')
    expect(saved.modalityPrices.sm).toBe(4500)
  })

  it('tras guardar, muestra una confirmación', () => {
    render(<TariffAdminScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(screen.getByRole('status')).toHaveTextContent('Cambios guardados')
  })

  it('"Restablecer" solo aparece si el campo tiene un valor editado, y lo devuelve al catálogo', () => {
    render(<TariffAdminScreen />)

    const smField = screen.getByLabelText(/Golf Son Muntaner/)
    expect(screen.queryByRole('button', { name: /Restablecer Golf Son Muntaner/ })).not.toBeInTheDocument()

    fireEvent.change(smField, { target: { value: '4500' } })
    expect(screen.getByRole('button', { name: /Restablecer Golf Son Muntaner/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Restablecer Golf Son Muntaner/ }))
    expect(smField).toHaveValue(4400)
  })

  it('editar y restablecer un porcentaje de descuento persiste y revierte correctamente', () => {
    render(<TariffAdminScreen />)

    const weekField = screen.getByLabelText(/Lunes a Viernes/)
    fireEvent.change(weekField, { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    let saved = JSON.parse(localStorage.getItem(TARIFF_OVERRIDES_STORAGE_KEY) ?? '{}')
    expect(saved.discountPercentages.week).toBe(20)

    fireEvent.click(screen.getByRole('button', { name: /Restablecer Lunes a Viernes/ }))
    expect(weekField).toHaveValue(15)

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    saved = JSON.parse(localStorage.getItem(TARIFF_OVERRIDES_STORAGE_KEY) ?? '{}')
    expect(saved.discountPercentages.week).toBeUndefined()
  })

  it('editar y restablecer el precio de un extra persiste y revierte correctamente', () => {
    render(<TariffAdminScreen />)

    const lockerField = screen.getByLabelText(/Alquiler de Taquilla/)
    fireEvent.change(lockerField, { target: { value: '160' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    let saved = JSON.parse(localStorage.getItem(TARIFF_OVERRIDES_STORAGE_KEY) ?? '{}')
    expect(saved.extraPrices.locker).toBe(160)

    fireEvent.click(screen.getByRole('button', { name: /Restablecer Alquiler de Taquilla/ }))
    expect(lockerField).toHaveValue(150)

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    saved = JSON.parse(localStorage.getItem(TARIFF_OVERRIDES_STORAGE_KEY) ?? '{}')
    expect(saved.extraPrices.locker).toBeUndefined()
  })

  it('editar y restablecer una tarifa de Premium Mensual persiste y revierte correctamente', () => {
    render(<TariffAdminScreen />)

    const highRateField = screen.getByLabelText(/^Alta/)
    fireEvent.change(highRateField, { target: { value: '750' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    let saved = JSON.parse(localStorage.getItem(TARIFF_OVERRIDES_STORAGE_KEY) ?? '{}')
    expect(saved.monthlyPremiumRates.high).toBe(750)

    fireEvent.click(screen.getByRole('button', { name: /^Restablecer Alta/ }))
    expect(highRateField).toHaveValue(725)

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    saved = JSON.parse(localStorage.getItem(TARIFF_OVERRIDES_STORAGE_KEY) ?? '{}')
    expect(saved.monthlyPremiumRates.high).toBeUndefined()
  })

  it('un valor vacío o inválido al editar equivale a restablecer al catálogo', () => {
    render(<TariffAdminScreen />)

    const smField = screen.getByLabelText(/Golf Son Muntaner/)
    fireEvent.change(smField, { target: { value: '4500' } })
    fireEvent.change(smField, { target: { value: '' } })

    expect(smField).toHaveValue(4400)
    expect(screen.queryByRole('button', { name: /Restablecer Golf Son Muntaner/ })).not.toBeInTheDocument()
  })
})
