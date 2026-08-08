import type { Discount, DiscountId } from '../../shared/types/catalog'
import { DISCOUNTS } from '../../shared/constants/discounts'

export function getDiscountOrThrow(id: DiscountId): Discount {
  const discount = DISCOUNTS.find((d) => d.id === id)
  if (!discount) {
    throw new Error(`Descuento desconocido en el catálogo: ${id}`)
  }
  return discount
}
