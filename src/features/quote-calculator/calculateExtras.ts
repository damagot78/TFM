import type { DiscountId, Extra, ExtraId, ModalityId } from '../../shared/types/catalog'
import {
  EXTRAS,
  MIN_AGE_FOR_BUGGY,
  MODALITIES_WITHOUT_BUGGY_FACILITIES,
  MODALITIES_WITH_FREE_BUGGY_ANNUAL,
} from '../../shared/constants/extras'
import { MODALITIES } from '../../shared/constants/modalities'
import { isAdult } from './ageEligibility'

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

function getExtraOrThrow(id: ExtraId): Extra {
  const extra = EXTRAS.find((e) => e.id === id)
  if (!extra) {
    throw new Error(`Extra desconocido en el catálogo: ${id}`)
  }
  return extra
}

function validateExtraSelection(
  modalityId: ModalityId,
  extraIds: ExtraId[],
  context: ExtrasCalculationContext,
): string[] {
  const errors: string[] = []
  const extras = extraIds.map((id) => getExtraOrThrow(id))

  const groupCounts = new Map<string, Extra[]>()
  for (const extra of extras) {
    if (!extra.group) continue
    const group = groupCounts.get(extra.group) ?? []
    group.push(extra)
    groupCounts.set(extra.group, group)
  }
  for (const [group, groupExtras] of groupCounts) {
    if (groupExtras.length > 1) {
      const names = groupExtras.map((e) => e.name).join(', ')
      errors.push(`Los extras del grupo "${group}" son excluyentes entre sí: ${names}.`)
    }
  }

  const hasBuggyExtra = extras.some((e) => e.group === 'buggy')
  if (hasBuggyExtra) {
    if (MODALITIES_WITHOUT_BUGGY_FACILITIES.includes(modalityId)) {
      errors.push(`La modalidad "${modalityId}" no tiene instalaciones para extras de Buggy.`)
    }
    if (context.age === null || context.age < MIN_AGE_FOR_BUGGY) {
      errors.push(`Los extras de Buggy requieren tener al menos ${MIN_AGE_FOR_BUGGY} años.`)
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
