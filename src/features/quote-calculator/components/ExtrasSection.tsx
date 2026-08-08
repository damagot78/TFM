import type { Extra, ExtraGroupId, ExtraId, ModalityId } from '../../../shared/types/catalog'
import { EXTRAS, MIN_AGE_FOR_BUGGY } from '../../../shared/constants/extras'
import { getBlockingGroupSelection, getExtraOrThrow, isExtraAllowedForAge, isExtraAllowedForModality } from '../extrasCatalog'

const GROUP_LABELS: Record<ExtraGroupId, string> = {
  storage: 'grupo Custodia',
  buggy: 'grupo Buggy',
}

interface ExtrasSectionProps {
  modalityId: ModalityId
  age: number | null
  extraIds: ExtraId[]
  onToggle: (id: ExtraId) => void
}

function getDisabledReason(
  allowedByModality: boolean,
  allowedByAge: boolean,
  blockers: ExtraId[],
): string | null {
  if (!allowedByModality) {
    return 'No disponible en esta modalidad'
  }
  if (!allowedByAge) {
    return `Requiere tener al menos ${MIN_AGE_FOR_BUGGY} años`
  }
  if (blockers.length > 0) {
    const names = blockers.map((id) => getExtraOrThrow(id).name).join(', ')
    return `Excluyente con: ${names}`
  }
  return null
}

function formatExtraLabel(extra: Extra): string {
  const groupSuffix = extra.group ? ` (${GROUP_LABELS[extra.group]})` : ''
  return `${extra.name} — ${extra.price} €${groupSuffix}`
}

export function ExtrasSection({ modalityId, age, extraIds, onToggle }: ExtrasSectionProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Extras</h2>
      <ul className="space-y-2">
        {EXTRAS.map((extra) => {
          const isSelected = extraIds.includes(extra.id)
          const allowedByModality = isExtraAllowedForModality(extra, modalityId)
          const allowedByAge = isExtraAllowedForAge(extra, age)
          const blockers = getBlockingGroupSelection(extra.id, extraIds)
          const disabled = !isSelected && (!allowedByModality || !allowedByAge || blockers.length > 0)
          const reason = isSelected ? null : getDisabledReason(allowedByModality, allowedByAge, blockers)

          return (
            <li key={extra.id}>
              <label className={`flex items-center gap-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-800'}`}>
                <input type="checkbox" checked={isSelected} disabled={disabled} onChange={() => onToggle(extra.id)} />
                <span>{formatExtraLabel(extra)}</span>
              </label>
              {reason && <p className="ml-6 text-xs text-amber-700">{reason}</p>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
