import type { DiscountId } from '../../../shared/types/catalog'
import type { TariffOverrides } from '../../../shared/types/tariffOverrides'
import { DISCOUNTS, MAX_SIMULTANEOUS_DISCOUNTS } from '../../../shared/constants/discounts'
import { EMPTY_TARIFF_OVERRIDES } from '../../../shared/constants/tariffOverrides'
import { resolveDiscountPercentage } from '../../../shared/utils/tariffResolvers'
import { getBlockingSelections, getDiscountOrThrow } from '../discountCatalog'
import { FormField, formInputClasses } from '../../../shared/components/FormField'

interface DiscountsSectionProps {
  discountIds: DiscountId[]
  eligibleDiscountIds: DiscountId[]
  onToggle: (id: DiscountId) => void
  referralAmount: string
  onReferralAmountChange: (value: string) => void
  overrides?: TariffOverrides
}

function getDisabledReason(isEligible: boolean, blockers: DiscountId[], maxReached: boolean): string | null {
  if (!isEligible) {
    return 'No disponible para esta modalidad/edad'
  }
  if (blockers.length > 0) {
    const names = blockers.map((id) => getDiscountOrThrow(id).name).join(', ')
    return `Incompatible con ${names}`
  }
  if (maxReached) {
    return `Máximo de ${MAX_SIMULTANEOUS_DISCOUNTS} descuentos alcanzado`
  }
  return null
}

export function DiscountsSection({
  discountIds,
  eligibleDiscountIds,
  onToggle,
  referralAmount,
  onReferralAmountChange,
  overrides = EMPTY_TARIFF_OVERRIDES,
}: DiscountsSectionProps) {
  const maxReached = discountIds.length >= MAX_SIMULTANEOUS_DISCOUNTS

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Descuentos</h2>
        <span className="text-sm text-gray-500">
          {discountIds.length}/{MAX_SIMULTANEOUS_DISCOUNTS} seleccionados
        </span>
      </div>

      <ul className="space-y-2">
        {DISCOUNTS.map((discount) => {
          const isSelected = discountIds.includes(discount.id)
          const isEligible = eligibleDiscountIds.includes(discount.id)
          const blockers = getBlockingSelections(discount.id, discountIds)
          const disabled = !isSelected && (!isEligible || blockers.length > 0 || maxReached)
          const reason = isSelected ? null : getDisabledReason(isEligible, blockers, maxReached)

          return (
            <li key={discount.id}>
              <label className={`flex items-center gap-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-800'}`}>
                <input type="checkbox" checked={isSelected} disabled={disabled} onChange={() => onToggle(discount.id)} />
                <span>
                  {discount.name} ({resolveDiscountPercentage(discount, overrides)}%)
                </span>
              </label>
              {reason && <p className="ml-6 text-xs text-amber-700">{reason}</p>}
            </li>
          )
        })}
      </ul>

      {discountIds.includes('referral') && (
        <div className="mt-4">
          <FormField label="Importe contratado por el referido (€)" htmlFor="referral-amount">
            <input
              id="referral-amount"
              type="number"
              min="0"
              step="0.01"
              className={formInputClasses}
              value={referralAmount}
              onChange={(event) => onReferralAmountChange(event.target.value)}
            />
          </FormField>
        </div>
      )}
    </section>
  )
}
