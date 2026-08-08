import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DISCOUNTS } from '../../../shared/constants/discounts'
import { DiscountsSection } from './DiscountsSection'

const ALL_DISCOUNT_IDS = DISCOUNTS.map((d) => d.id)

function renderSection(overrides: Partial<Parameters<typeof DiscountsSection>[0]> = {}) {
  const props = {
    discountIds: [],
    eligibleDiscountIds: ALL_DISCOUNT_IDS,
    onToggle: vi.fn(),
    referralAmount: '',
    onReferralAmountChange: vi.fn(),
    ...overrides,
  }
  render(<DiscountsSection {...props} />)
  return props
}

describe('DiscountsSection', () => {
  it('muestra los 10 descuentos del catálogo con su porcentaje', () => {
    renderSection()

    expect(screen.getByText('Lunes a Viernes (15%)')).toBeInTheDocument()
    expect(screen.getByText('Premio Referral (10%)')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(10)
  })

  it('muestra cuántos descuentos hay seleccionados de los 3 máximo', () => {
    renderSection({ discountIds: ['week', 'afternoon'] })

    expect(screen.getByText('2/3 seleccionados')).toBeInTheDocument()
  })

  it('marcar un descuento elegible y disponible llama a onToggle', () => {
    const props = renderSection()

    fireEvent.click(screen.getByLabelText('Lunes a Viernes (15%)'))

    expect(props.onToggle).toHaveBeenCalledWith('week')
  })

  it('un descuento fuera de la lista de elegibles aparece deshabilitado con el motivo', () => {
    renderSection({ eligibleDiscountIds: ALL_DISCOUNT_IDS.filter((id) => id !== 'child') })

    expect(screen.getByLabelText('Niño (80%)')).toBeDisabled()
    expect(screen.getByText('No disponible para esta modalidad/edad')).toBeInTheDocument()
  })

  it('al alcanzar el máximo de 3, los descuentos no seleccionados se deshabilitan', () => {
    renderSection({ discountIds: ['week', 'afternoon', 'upgrade'] })

    const avsvCheckbox = screen.getByLabelText('Asociación Vecinos Son Vida (10%)')
    expect(avsvCheckbox).toBeDisabled()
    expect(avsvCheckbox.closest('li')).toHaveTextContent('Máximo de 3 descuentos alcanzado')
    // los ya seleccionados siguen habilitados para poder desmarcarlos
    expect(screen.getByLabelText('Lunes a Viernes (15%)')).not.toBeDisabled()
  })

  it('un descuento incompatible con uno ya seleccionado se deshabilita con el motivo', () => {
    renderSection({ discountIds: ['family'] })

    const childCheckbox = screen.getByLabelText('Niño (80%)')
    expect(childCheckbox).toBeDisabled()
    expect(childCheckbox.closest('li')).toHaveTextContent('Incompatible con Descuento Familiar')
  })

  it('el campo de importe del referido solo aparece si "Referral" está seleccionado', () => {
    const { rerender } = render(
      <DiscountsSection
        discountIds={[]}
        eligibleDiscountIds={ALL_DISCOUNT_IDS}
        onToggle={vi.fn()}
        referralAmount=""
        onReferralAmountChange={vi.fn()}
      />,
    )

    expect(screen.queryByLabelText('Importe contratado por el referido (€)')).not.toBeInTheDocument()

    rerender(
      <DiscountsSection
        discountIds={['referral']}
        eligibleDiscountIds={ALL_DISCOUNT_IDS}
        onToggle={vi.fn()}
        referralAmount=""
        onReferralAmountChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Importe contratado por el referido (€)')).toBeInTheDocument()
  })

  it('escribir en el importe del referido llama a onReferralAmountChange', () => {
    const onReferralAmountChange = vi.fn()
    render(
      <DiscountsSection
        discountIds={['referral']}
        eligibleDiscountIds={ALL_DISCOUNT_IDS}
        onToggle={vi.fn()}
        referralAmount=""
        onReferralAmountChange={onReferralAmountChange}
      />,
    )

    fireEvent.change(screen.getByLabelText('Importe contratado por el referido (€)'), { target: { value: '5000' } })

    expect(onReferralAmountChange).toHaveBeenCalledWith('5000')
  })
})
