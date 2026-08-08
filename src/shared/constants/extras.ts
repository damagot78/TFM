import type { Extra, ModalityId } from '../types/catalog'

export const EXTRAS: readonly Extra[] = [
  { id: 'locker', name: 'Alquiler de Taquilla', price: 150 },
  { id: 'club_storage', name: 'Custodia de Palos', price: 175, group: 'storage' },
  { id: 'storage_trolley', name: 'Custodia + Trolley', price: 290, group: 'storage' },
  { id: 'storage_trolley_battery', name: 'Custodia + Trolley + Batería', price: 400, group: 'storage' },
  { id: 'buggy_monthly', name: 'Buggy ilimitado mensual', price: 195, group: 'buggy' },
  { id: 'buggy_annual', name: 'Buggy ilimitado anual', price: 1400, group: 'buggy' },
  { id: 'charger', name: 'Cargador eléctrico', price: 150 },
  { id: 'license_insurance', name: 'Seguro Licencia RFEG', price: 144 },
]

/** Edad mínima para contratar o usar cualquier extra del grupo `buggy`. */
export const MIN_AGE_FOR_BUGGY = 16

/** Modalidades sin instalaciones para buggy/carrito: no permiten extras del grupo `buggy`. */
export const MODALITIES_WITHOUT_BUGGY_FACILITIES: readonly ModalityId[] = [
  'pp',
  'dr_sq',
  'pp_dr_sq',
  'dr_sm',
]

/** Modalidades que incluyen el Buggy anual gratis (no se cobra aparte). */
export const MODALITIES_WITH_FREE_BUGGY_ANNUAL: readonly ModalityId[] = [
  'sm_buggy',
  'premium_buggy',
  'premium_spa_buggy',
]
