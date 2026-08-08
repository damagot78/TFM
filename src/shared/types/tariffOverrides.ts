import type { DiscountId, ExtraId, ModalityId, SeasonRate } from './catalog'

/**
 * Precios/porcentajes editados por el personal autorizado (capítulo 6),
 * que sustituyen al valor del catálogo fijo cuando están presentes. El
 * catálogo de conceptos en sí (qué modalidades/descuentos/extras existen)
 * nunca cambia — solo su valor numérico.
 */
export interface TariffOverrides {
  modalityPrices: Partial<Record<ModalityId, number>>
  discountPercentages: Partial<Record<DiscountId, number>>
  extraPrices: Partial<Record<ExtraId, number>>
  monthlyPremiumRates: Partial<Record<SeasonRate, number>>
}
