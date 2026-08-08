import type { DiscountId } from '../../shared/types/catalog'
import { DISCOUNTS } from '../../shared/constants/discounts'
import { getDiscountOrThrow } from './discountCatalog'

/**
 * Un descuento sin rango de edad es elegible a cualquier edad. Si el
 * descuento tiene rango y la edad es desconocida (`null`), no es elegible:
 * no se puede verificar la condición, así que se falla cerrado.
 */
export function isDiscountEligibleByAge(id: DiscountId, age: number | null): boolean {
  const { ageRange } = getDiscountOrThrow(id)
  if (!ageRange) {
    return true
  }
  if (age === null) {
    return false
  }
  if (ageRange.min !== undefined && age < ageRange.min) {
    return false
  }
  if (ageRange.max !== undefined && age > ageRange.max) {
    return false
  }
  return true
}

export function filterDiscountsEligibleByAge(
  age: number | null,
  discountIds: readonly DiscountId[] = DISCOUNTS.map((d) => d.id),
): DiscountId[] {
  return discountIds.filter((id) => isDiscountEligibleByAge(id, age))
}

/**
 * Regla de "adulto" para beneficios como el cargador eléctrico gratuito:
 * - Con fecha de nacimiento conocida, la edad manda (≥18 = adulto), sin
 *   importar los descuentos activos.
 * - Sin fecha de nacimiento conocida, se presume adulto salvo que el
 *   descuento Niño o Junior esté activo (indicio de que es menor).
 */
export function isAdult(age: number | null, activeDiscountIds: readonly DiscountId[]): boolean {
  if (age !== null) {
    return age >= 18
  }
  return !activeDiscountIds.includes('child') && !activeDiscountIds.includes('junior')
}
