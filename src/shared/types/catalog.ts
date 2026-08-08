export type CategoryId = 'standard' | 'premium' | 'monthly'

/** Temporada de tarifa mensual de `monthly_premium`: alta (725 €) o estándar (860 €). */
export type SeasonRate = 'high' | 'standard'

export type ModalityId =
  | 'pp'
  | 'dr_sq'
  | 'pp_dr_sq'
  | 'dr_sm'
  | 'sv'
  | 'sq'
  | 'sv_dr_sq'
  | 'sv_pp'
  | 'sv_dr_sm'
  | 'sq_pp'
  | 'sv_sq'
  | 'sm'
  | 'sm_buggy'
  | 'premium'
  | 'premium_spa'
  | 'premium_buggy'
  | 'premium_spa_buggy'
  | 'monthly_premium'

export type DiscountId =
  | 'week'
  | 'afternoon'
  | 'upgrade'
  | 'avsv'
  | 'family'
  | 'young'
  | 'child'
  | 'junior'
  | 'sub25'
  | 'referral'

export interface Modality {
  id: ModalityId
  name: string
  category: CategoryId
  /**
   * Precio anual fijo. `null` para modalidades sin precio único (p. ej.
   * `monthly_premium`, cuyo importe depende de la temporada y se calcula
   * con `calculateMonthlyPremiumPrice`).
   */
  price: number | null
}

/** Restricción de categoría de modalidad para aplicar un descuento. */
export type DiscountCategoryRestriction = 'excludes-premium' | 'premium-only'

export interface Discount {
  id: DiscountId
  name: string
  /** Orden fijo de aplicación en la cascada (1 = primero). No es el orden del folleto al cliente. */
  order: number
  percentage: number
  categoryRestriction?: DiscountCategoryRestriction
  incompatibleWith: DiscountId[]
}
