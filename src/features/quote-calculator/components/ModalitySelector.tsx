import type { ReactNode } from 'react'
import type { CategoryId, Modality, ModalityId } from '../../../shared/types/catalog'
import type { TariffOverrides } from '../../../shared/types/tariffOverrides'
import { MODALITIES } from '../../../shared/constants/modalities'
import { EMPTY_TARIFF_OVERRIDES } from '../../../shared/constants/tariffOverrides'
import { resolveModalityPrice } from '../../../shared/utils/tariffResolvers'
import { FormField, formInputClasses } from '../../../shared/components/FormField'

const CATEGORY_LABELS: Record<CategoryId, string> = {
  standard: 'Standard',
  premium: 'Premium',
  monthly: 'Mensual',
}

const CATEGORY_ORDER: CategoryId[] = ['standard', 'premium', 'monthly']

function formatModalityLabel(modality: Modality, overrides: TariffOverrides): string {
  const price = resolveModalityPrice(modality, overrides)
  return price === null ? `${modality.name} (según temporada)` : `${modality.name} — ${price} €`
}

interface ModalitySelectorProps {
  modalityId: ModalityId | ''
  onSelect: (id: ModalityId) => void
  overrides?: TariffOverrides
  children?: ReactNode
}

export function ModalitySelector({
  modalityId,
  onSelect,
  overrides = EMPTY_TARIFF_OVERRIDES,
  children,
}: ModalitySelectorProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Modalidad de abono</h2>
      <FormField label="Modalidad" htmlFor="modality-select">
        <select
          id="modality-select"
          className={formInputClasses}
          value={modalityId}
          onChange={(event) => onSelect(event.target.value as ModalityId)}
        >
          <option value="" disabled>
            Selecciona una modalidad…
          </option>
          {CATEGORY_ORDER.map((category) => (
            <optgroup key={category} label={CATEGORY_LABELS[category]}>
              {MODALITIES.filter((modality) => modality.category === category).map((modality) => (
                <option key={modality.id} value={modality.id}>
                  {formatModalityLabel(modality, overrides)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </FormField>
      {children}
    </section>
  )
}
