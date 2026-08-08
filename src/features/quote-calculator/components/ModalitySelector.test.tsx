import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModalitySelector } from './ModalitySelector'

describe('ModalitySelector', () => {
  it('agrupa las modalidades por categoría con nombre y precio', () => {
    render(<ModalitySelector modalityId="" onSelect={vi.fn()} />)

    expect(screen.getByRole('group', { name: 'Standard' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Premium' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Mensual' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Golf Son Muntaner (SM) — 4400 €' })).toBeInTheDocument()
  })

  it('monthly_premium se muestra sin precio fijo ("según temporada")', () => {
    render(<ModalitySelector modalityId="" onSelect={vi.fn()} />)

    expect(screen.getByRole('option', { name: 'Premium Mensual (según temporada)' })).toBeInTheDocument()
  })

  it('seleccionar una modalidad llama a onSelect con su id', () => {
    const onSelect = vi.fn()
    render(<ModalitySelector modalityId="" onSelect={onSelect} />)

    fireEvent.change(screen.getByLabelText('Modalidad'), { target: { value: 'sm' } })

    expect(onSelect).toHaveBeenCalledWith('sm')
  })
})
