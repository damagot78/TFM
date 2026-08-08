import type { TariffOverrides } from '../types/tariffOverrides'
import { EMPTY_TARIFF_OVERRIDES } from '../constants/tariffOverrides'
import { MODALITIES } from '../constants/modalities'
import { DISCOUNTS } from '../constants/discounts'
import { EXTRAS } from '../constants/extras'

export const TARIFF_OVERRIDES_STORAGE_KEY = 'agm.tariffOverrides'

const MODALITY_IDS = MODALITIES.map((m) => m.id)
const DISCOUNT_IDS = DISCOUNTS.map((d) => d.id)
const EXTRA_IDS = EXTRAS.map((e) => e.id)
const SEASON_RATE_IDS = ['high', 'standard']

/**
 * Se queda solo con las entradas cuya clave está en `validKeys` y cuyo valor
 * es un número finito positivo, descartando el resto. `localStorage` puede
 * haber sido editado a mano (devtools) o corrompido — nunca se confía en su
 * contenido sin validar la forma primero (equivalente a validar una entrada
 * externa, Módulo 9).
 */
function sanitizeNumericRecord(value: unknown, validKeys: readonly string[]): Record<string, number> {
  const result: Record<string, number> = {}

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return result
  }

  for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
    if (!validKeys.includes(key)) {
      continue
    }
    if (typeof entryValue !== 'number' || !Number.isFinite(entryValue) || entryValue <= 0) {
      continue
    }
    result[key] = entryValue
  }

  return result
}

function sanitizeTariffOverrides(parsed: unknown): TariffOverrides {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return EMPTY_TARIFF_OVERRIDES
  }

  const raw = parsed as Record<string, unknown>

  return {
    modalityPrices: sanitizeNumericRecord(raw.modalityPrices, MODALITY_IDS),
    discountPercentages: sanitizeNumericRecord(raw.discountPercentages, DISCOUNT_IDS),
    extraPrices: sanitizeNumericRecord(raw.extraPrices, EXTRA_IDS),
    monthlyPremiumRates: sanitizeNumericRecord(raw.monthlyPremiumRates, SEASON_RATE_IDS),
  }
}

/**
 * Único punto de acceso a las tarifas editadas persistidas (patrón
 * repositorio/adaptador): el resto de la app nunca llama a
 * `localStorage.getItem/setItem` directamente para esto.
 */
export function loadTariffOverrides(): TariffOverrides {
  try {
    const raw = localStorage.getItem(TARIFF_OVERRIDES_STORAGE_KEY)
    if (raw === null) {
      return EMPTY_TARIFF_OVERRIDES
    }
    return sanitizeTariffOverrides(JSON.parse(raw))
  } catch (error) {
    console.error('No se pudieron leer las tarifas editadas de localStorage; se usa el catálogo por defecto.', error)
    return EMPTY_TARIFF_OVERRIDES
  }
}

export function saveTariffOverrides(overrides: TariffOverrides): void {
  try {
    localStorage.setItem(TARIFF_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides))
  } catch (error) {
    console.error('No se pudieron guardar las tarifas editadas en localStorage.', error)
  }
}
