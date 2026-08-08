import type { Extra, ExtraId, ModalityId } from '../../shared/types/catalog'
import { EXTRAS, MIN_AGE_FOR_BUGGY, MODALITIES_WITHOUT_BUGGY_FACILITIES } from '../../shared/constants/extras'

export function getExtraOrThrow(id: ExtraId): Extra {
  const extra = EXTRAS.find((e) => e.id === id)
  if (!extra) {
    throw new Error(`Extra desconocido en el catálogo: ${id}`)
  }
  return extra
}

/** Si un extra se puede contratar en una modalidad (independiente de edad o de otros extras ya elegidos). */
export function isExtraAllowedForModality(extra: Extra, modalityId: ModalityId): boolean {
  if (extra.group === 'buggy' && MODALITIES_WITHOUT_BUGGY_FACILITIES.includes(modalityId)) {
    return false
  }
  return true
}

/** Si un extra se puede contratar a una edad dada. Edad desconocida falla cerrado para extras con restricción. */
export function isExtraAllowedForAge(extra: Extra, age: number | null): boolean {
  if (extra.group === 'buggy') {
    return age !== null && age >= MIN_AGE_FOR_BUGGY
  }
  return true
}

/** De entre `selectedIds`, cuáles pertenecen al mismo grupo de exclusividad que `candidateId`. */
export function getBlockingGroupSelection(candidateId: ExtraId, selectedIds: readonly ExtraId[]): ExtraId[] {
  const candidate = getExtraOrThrow(candidateId)
  if (!candidate.group) {
    return []
  }
  return selectedIds.filter((id) => id !== candidateId && getExtraOrThrow(id).group === candidate.group)
}
