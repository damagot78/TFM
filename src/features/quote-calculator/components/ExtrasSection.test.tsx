import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ExtrasSection } from './ExtrasSection'

describe('ExtrasSection', () => {
  it('muestra los 8 extras del catálogo con su precio', () => {
    render(<ExtrasSection modalityId="sm" age={30} extraIds={[]} onToggle={vi.fn()} />)

    expect(screen.getAllByRole('checkbox')).toHaveLength(8)
    expect(screen.getByText('Alquiler de Taquilla — 150 €')).toBeInTheDocument()
  })

  it('marcar un extra disponible llama a onToggle', () => {
    const onToggle = vi.fn()
    render(<ExtrasSection modalityId="sm" age={30} extraIds={[]} onToggle={onToggle} />)

    fireEvent.click(screen.getByLabelText(/Alquiler de Taquilla/))

    expect(onToggle).toHaveBeenCalledWith('locker')
  })

  it('en una modalidad sin instalaciones de buggy, los extras de ese grupo se deshabilitan', () => {
    render(<ExtrasSection modalityId="pp" age={30} extraIds={[]} onToggle={vi.fn()} />)

    const buggyCheckbox = screen.getByLabelText(/Buggy ilimitado anual/)
    expect(buggyCheckbox).toBeDisabled()
    expect(buggyCheckbox.closest('li')).toHaveTextContent('No disponible en esta modalidad')
  })

  it('para menores de 16 años, los extras de buggy se deshabilitan indicando el motivo', () => {
    render(<ExtrasSection modalityId="sm" age={15} extraIds={[]} onToggle={vi.fn()} />)

    const buggyCheckbox = screen.getByLabelText(/Buggy ilimitado anual/)
    expect(buggyCheckbox).toBeDisabled()
    expect(buggyCheckbox.closest('li')).toHaveTextContent('Requiere tener al menos 16 años')
  })

  it('seleccionar un extra de un grupo deshabilita a los demás del mismo grupo', () => {
    render(<ExtrasSection modalityId="sm" age={30} extraIds={['club_storage']} onToggle={vi.fn()} />)

    const trolleyCheckbox = screen.getByLabelText(/Custodia \+ Trolley —/)
    expect(trolleyCheckbox).toBeDisabled()
    expect(trolleyCheckbox.closest('li')).toHaveTextContent('Excluyente con: Custodia de Palos')
    // el ya seleccionado sigue habilitado para poder desmarcarlo
    expect(screen.getByLabelText(/Custodia de Palos/)).not.toBeDisabled()
  })
})
