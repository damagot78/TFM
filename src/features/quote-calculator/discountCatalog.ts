import type { CategoryId, Discount, DiscountId } from '../../shared/types/catalog'
import { DISCOUNTS } from '../../shared/constants/discounts'

export function getDiscountOrThrow(id: DiscountId): Discount {
  const discount = DISCOUNTS.find((d) => d.id === id)
  if (!discount) {
    throw new Error(`Descuento desconocido en el catálogo: ${id}`)
  }
  return discount
}

/** Si un descuento se puede aplicar a una modalidad según la categoría de esta (independiente de la edad). */
export function isDiscountAllowedForCategory(discount: Discount, category: CategoryId): boolean {
  if (discount.categoryRestriction === 'excludes-premium' && category === 'premium') {
    return false
  }
  if (discount.categoryRestriction === 'premium-only' && category !== 'premium') {
    return false
  }
  return true
}

/** De entre `selectedIds`, cuáles son incompatibles con `candidateId` según la matriz del catálogo. */
export function getBlockingSelections(
  candidateId: DiscountId,
  selectedIds: readonly DiscountId[],
): DiscountId[] {
  const candidate = getDiscountOrThrow(candidateId)
  return selectedIds.filter((id) => id !== candidateId && candidate.incompatibleWith.includes(id))
}
