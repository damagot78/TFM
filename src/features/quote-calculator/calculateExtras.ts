import type { DiscountId, Extra, ExtraId, ModalityId } from '../../shared/types/catalog'
import { MIN_AGE_FOR_BUGGY, MODALITIES_WITH_FREE_BUGGY_ANNUAL } from '../../shared/constants/extras'
import { MODALITIES } from '../../shared/constants/modalities'
import { isAdult } from './ageEligibility'
import {
  getBlockingGroupSelection,
  getExtraOrThrow,
  isExtraAllowedForAge,
  isExtraAllowedForModality,
} from './extrasCatalog'

export interface ExtraLineItem {
  extraId: ExtraId
  price: number
  includedFree: boolean
}

export interface ExtrasCalculationContext {
  age: number | null
  activeDiscountIds: readonly DiscountId[]
}

export type ExtrasCalculationResult =
  | { success: true; items: ExtraLineItem[]; total: number }
  | { success: false; errors: string[] }

function validateExtraSelection(
  modalityId: ModalityId,
  extraIds: ExtraId[],
  context: ExtrasCalculationContext,
): string[] {
  const errors: string[] = []

  for (const id of extraIds) {
    const extra = getExtraOrThrow(id)

    if (!isExtraAllowedForModality(extra, modalityId)) {
      errors.push(`La modalidad "${modalityId}" no tiene instalaciones para extras de Buggy.`)
    }
    if (!isExtraAllowedForAge(extra, context.age)) {
      errors.push(`Los extras de Buggy requieren tener al menos ${MIN_AGE_FOR_BUGGY} años.`)
    }

    const blockers = getBlockingGroupSelection(id, extraIds)
    if (blockers.length > 0) {
      const names = blockers.map((blockerId) => getExtraOrThrow(blockerId).name).join(', ')
      errors.push(`"${extra.name}" es excluyente con: ${names}.`)
    }
  }

  return errors
}

function priceExtra(
  extra: Extra,
  modalityId: ModalityId,
  context: ExtrasCalculationContext,
): ExtraLineItem {
  if (extra.id === 'buggy_annual' && MODALITIES_WITH_FREE_BUGGY_ANNUAL.includes(modalityId)) {
    return { extraId: extra.id, price: 0, includedFree: true }
  }

  if (extra.id === 'charger') {
    const modality = MODALITIES.find((m) => m.id === modalityId)
    const isFreeInPremium =
      modality?.category === 'premium' && isAdult(context.age, context.activeDiscountIds)
    if (isFreeInPremium) {
      return { extraId: extra.id, price: 0, includedFree: true }
    }
  }

  return { extraId: extra.id, price: extra.price, includedFree: false }
}

export function calculateExtras(
  modalityId: ModalityId,
  extraIds: ExtraId[],
  context: ExtrasCalculationContext,
): ExtrasCalculationResult {
  const errors = validateExtraSelection(modalityId, extraIds, context)
  if (errors.length > 0) {
    console.error(`Cálculo de extras rechazado (${modalityId}): ${errors.join(' | ')}`)
    return { success: false, errors }
  }

  const items = extraIds.map((id) => priceExtra(getExtraOrThrow(id), modalityId, context))
  const total = items.reduce((sum, item) => sum + item.price, 0)

  return { success: true, items, total }
}
