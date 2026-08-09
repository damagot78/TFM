import type { DiscountId, ExtraId, ModalityId, SeasonRate } from '../../shared/types/catalog'
import { MODALITIES } from '../../shared/constants/modalities'
import { DISCOUNTS } from '../../shared/constants/discounts'
import { EXTRAS } from '../../shared/constants/extras'
import type { MonthlyPremiumManualChoices } from './calculateMonthlyPremiumPrice'

export const QUOTE_DRAFT_STORAGE_KEY = 'agm.quoteDraft'

const MODALITY_IDS = MODALITIES.map((m) => m.id)
const DISCOUNT_IDS = DISCOUNTS.map((d) => d.id)
const EXTRA_IDS = EXTRAS.map((e) => e.id)
const MONTHLY_MONTHS_OPTIONS = [1, 2, 3]
const SEASON_RATES: readonly SeasonRate[] = ['high', 'standard']

export interface QuoteDraft {
  subscriberName: string
  birthDate: string
  email: string
  phone: string
  modalityId: ModalityId | ''
  monthlyStartDate: string
  monthlyMonths: 1 | 2 | 3
  monthlyManualChoices: MonthlyPremiumManualChoices
  discountIds: DiscountId[]
  referralAmount: string
  extraIds: ExtraId[]
}

export const EMPTY_QUOTE_DRAFT: QuoteDraft = {
  subscriberName: '',
  birthDate: '',
  email: '',
  phone: '',
  modalityId: '',
  monthlyStartDate: '',
  monthlyMonths: 1,
  monthlyManualChoices: {},
  discountIds: [],
  referralAmount: '',
  extraIds: [],
}

function sanitizeString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function sanitizeModalityId(value: unknown): ModalityId | '' {
  return typeof value === 'string' && MODALITY_IDS.includes(value as ModalityId) ? (value as ModalityId) : ''
}

function sanitizeMonthlyMonths(value: unknown): 1 | 2 | 3 {
  return MONTHLY_MONTHS_OPTIONS.includes(value as number) ? (value as 1 | 2 | 3) : EMPTY_QUOTE_DRAFT.monthlyMonths
}

function sanitizeCatalogIds<T extends string>(value: unknown, validIds: readonly T[]): T[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter((id): id is T => typeof id === 'string' && validIds.includes(id as T))
}

function sanitizeMonthlyManualChoices(value: unknown): MonthlyPremiumManualChoices {
  const result: MonthlyPremiumManualChoices = {}

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return result
  }

  for (const [key, rate] of Object.entries(value as Record<string, unknown>)) {
    const index = Number(key)
    if (!Number.isInteger(index) || index < 0 || !SEASON_RATES.includes(rate as SeasonRate)) {
      continue
    }
    result[index] = rate as SeasonRate
  }

  return result
}

function sanitizeQuoteDraft(parsed: unknown): QuoteDraft {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return EMPTY_QUOTE_DRAFT
  }

  const raw = parsed as Record<string, unknown>

  return {
    subscriberName: sanitizeString(raw.subscriberName),
    birthDate: sanitizeString(raw.birthDate),
    email: sanitizeString(raw.email),
    phone: sanitizeString(raw.phone),
    modalityId: sanitizeModalityId(raw.modalityId),
    monthlyStartDate: sanitizeString(raw.monthlyStartDate),
    monthlyMonths: sanitizeMonthlyMonths(raw.monthlyMonths),
    monthlyManualChoices: sanitizeMonthlyManualChoices(raw.monthlyManualChoices),
    discountIds: sanitizeCatalogIds(raw.discountIds, DISCOUNT_IDS),
    referralAmount: sanitizeString(raw.referralAmount),
    extraIds: sanitizeCatalogIds(raw.extraIds, EXTRA_IDS),
  }
}

/**
 * Único punto de acceso al borrador de cotización en curso (patrón
 * repositorio/adaptador, igual que `tariffOverridesRepository` y
 * `exportedQuotesRepository`): valida la forma de lo leído de
 * `sessionStorage` antes de confiar en ello.
 */
export function loadQuoteDraft(): QuoteDraft {
  try {
    const raw = sessionStorage.getItem(QUOTE_DRAFT_STORAGE_KEY)
    if (raw === null) {
      return EMPTY_QUOTE_DRAFT
    }
    return sanitizeQuoteDraft(JSON.parse(raw))
  } catch (error) {
    console.error('No se pudo leer el borrador de cotización de sessionStorage; se usa un borrador vacío.', error)
    return EMPTY_QUOTE_DRAFT
  }
}

export function saveQuoteDraft(draft: QuoteDraft): void {
  try {
    sessionStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch (error) {
    console.error('No se pudo guardar el borrador de cotización en sessionStorage.', error)
  }
}

export function clearQuoteDraft(): void {
  try {
    sessionStorage.removeItem(QUOTE_DRAFT_STORAGE_KEY)
  } catch (error) {
    console.error('No se pudo borrar el borrador de cotización de sessionStorage.', error)
  }
}
