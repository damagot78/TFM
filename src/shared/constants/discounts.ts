import type { Discount } from '../types/catalog'

export const MAX_SIMULTANEOUS_DISCOUNTS = 3

/**
 * Orden de aplicación en cascada (verificado contra el código validado —
 * NO es el orden mostrado en el folleto de tarifas al cliente).
 */
export const DISCOUNTS: readonly Discount[] = [
  { id: 'week', name: 'Lunes a Viernes', order: 1, percentage: 15, categoryRestriction: 'excludes-premium', incompatibleWith: [] },
  { id: 'afternoon', name: 'Abono Tarde (desde 14h)', order: 2, percentage: 25, categoryRestriction: 'excludes-premium', incompatibleWith: [] },
  { id: 'upgrade', name: 'Up-Grade (renovación +1 campo)', order: 3, percentage: 7, incompatibleWith: [] },
  { id: 'avsv', name: 'Asociación Vecinos Son Vida', order: 4, percentage: 10, incompatibleWith: [] },
  { id: 'family', name: 'Descuento Familiar', order: 5, percentage: 10, incompatibleWith: ['junior', 'child', 'sub25'] },
  { id: 'young', name: 'Joven', order: 6, percentage: 20, incompatibleWith: ['child', 'junior', 'sub25'], ageRange: { min: 26, max: 35 } },
  { id: 'child', name: 'Niño', order: 7, percentage: 80, categoryRestriction: 'premium-only', incompatibleWith: ['junior', 'sub25', 'young', 'family'], ageRange: { min: 6, max: 12 } },
  { id: 'junior', name: 'Junior', order: 8, percentage: 70, categoryRestriction: 'premium-only', incompatibleWith: ['family', 'sub25', 'child', 'young'], ageRange: { min: 13, max: 18 } },
  { id: 'sub25', name: 'Sub-25', order: 9, percentage: 50, incompatibleWith: ['junior', 'child', 'young', 'family'], ageRange: { max: 25 } },
  { id: 'referral', name: 'Premio Referral', order: 10, percentage: 10, incompatibleWith: [] },
]
