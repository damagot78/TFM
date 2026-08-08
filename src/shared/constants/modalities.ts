import type { Modality } from '../types/catalog'

export const MODALITIES: readonly Modality[] = [
  { id: 'pp', name: 'Palma Pitch & Putt (P&P)', category: 'standard', price: 725 },
  { id: 'dr_sq', name: 'Driving Range Son Quint (DR-SQ)', category: 'standard', price: 750 },
  { id: 'pp_dr_sq', name: 'P&P + DR-SQ', category: 'standard', price: 995 },
  { id: 'dr_sm', name: 'Driving Range SM (DR-SM)', category: 'standard', price: 1150 },
  { id: 'sv', name: 'Golf Son Vida (SV)', category: 'standard', price: 3150 },
  { id: 'sq', name: 'Golf Son Quint (SQ)', category: 'standard', price: 3250 },
  { id: 'sv_dr_sq', name: 'SV + DR-SQ', category: 'standard', price: 3270 },
  { id: 'sv_pp', name: 'SV + P&P', category: 'standard', price: 3370 },
  { id: 'sv_dr_sm', name: 'SV + DR-SM', category: 'standard', price: 3470 },
  { id: 'sq_pp', name: 'SQ + P&P', category: 'standard', price: 3570 },
  { id: 'sv_sq', name: 'SV + SQ', category: 'standard', price: 3700 },
  { id: 'sm', name: 'Golf Son Muntaner (SM)', category: 'standard', price: 4400 },
  { id: 'sm_buggy', name: 'SM + Buggy', category: 'standard', price: 5450 },
  { id: 'premium', name: 'Premium (SM+SV+SQ+P&P)', category: 'premium', price: 5450 },
  { id: 'premium_spa', name: 'Premium + SPA', category: 'premium', price: 6050 },
  { id: 'premium_buggy', name: 'Premium + Buggy', category: 'premium', price: 6450 },
  { id: 'premium_spa_buggy', name: 'Premium + SPA + Buggy', category: 'premium', price: 7050 },
  // Sin precio fijo: se calcula por mes/temporada con calculateMonthlyPremiumPrice.
  { id: 'monthly_premium', name: 'Premium Mensual', category: 'monthly', price: null },
]
