import { useEffect, useMemo, useState } from 'react'
import type { DiscountId, ExtraId, ModalityId, SeasonRate } from '../../shared/types/catalog'
import type { TariffOverrides } from '../../shared/types/tariffOverrides'
import { MODALITIES } from '../../shared/constants/modalities'
import { loadTariffOverrides } from '../../shared/utils/tariffOverridesRepository'
import { clearQuoteDraft, loadQuoteDraft, saveQuoteDraft } from './quoteDraftRepository'
import { calculateAge } from './calculateAge'
import { getEligibleDiscounts } from './ageEligibility'
import { calculateQuote, type QuoteCalculationResult } from './calculateQuote'
import {
  calculateMonthlyPremiumPrice,
  previewMonthlyPremiumUnits,
  type MonthlyPremiumManualChoices,
  type MonthlyPremiumPriceResult,
  type MonthlyPremiumUnitPreview,
} from './calculateMonthlyPremiumPrice'
import { calculateExtras, type ExtrasCalculationResult } from './calculateExtras'

const DEFAULT_MONTHLY_MONTHS = 1

export type QuoteState =
  | { kind: 'none' }
  | { kind: 'cascade'; result: QuoteCalculationResult }
  | { kind: 'monthly'; result: MonthlyPremiumPriceResult }

export interface UseQuoteFormResult {
  subscriberName: string
  birthDate: string
  email: string
  phone: string
  age: number | null
  modalityId: ModalityId | ''
  monthlyStartDate: string
  monthlyMonths: 1 | 2 | 3
  monthlyManualChoices: MonthlyPremiumManualChoices
  discountIds: DiscountId[]
  referralAmount: string
  extraIds: ExtraId[]
  eligibleDiscountIds: DiscountId[]
  monthlyPreview: MonthlyPremiumUnitPreview[]
  quote: QuoteState
  extras: ExtrasCalculationResult
  grandTotal: number
  tariffOverrides: TariffOverrides
  setSubscriberName: (value: string) => void
  setBirthDate: (value: string) => void
  setEmail: (value: string) => void
  setPhone: (value: string) => void
  setModalityId: (id: ModalityId) => void
  setMonthlyStartDate: (value: string) => void
  setMonthlyMonths: (months: 1 | 2 | 3) => void
  setMonthlyManualChoice: (index: number, rate: SeasonRate) => void
  toggleDiscount: (id: DiscountId) => void
  setReferralAmount: (value: string) => void
  toggleExtra: (id: ExtraId) => void
  resetDraft: () => void
}

export function useQuoteForm(): UseQuoteFormResult {
  // Se lee una sola vez al montar (patrón lazy-initializer, igual que
  // `tariffOverrides` abajo) para recuperar un borrador dejado a medias al
  // cambiar de pestaña o recargar la página — nunca en cada render.
  const [initialDraft] = useState(loadQuoteDraft)

  const [subscriberName, setSubscriberName] = useState(initialDraft.subscriberName)
  const [birthDate, setBirthDate] = useState(initialDraft.birthDate)
  const [email, setEmail] = useState(initialDraft.email)
  const [phone, setPhone] = useState(initialDraft.phone)
  const [modalityId, setModalityIdState] = useState<ModalityId | ''>(initialDraft.modalityId)
  const [monthlyStartDate, setMonthlyStartDate] = useState(initialDraft.monthlyStartDate)
  const [monthlyMonths, setMonthlyMonths] = useState<1 | 2 | 3>(initialDraft.monthlyMonths)
  const [monthlyManualChoices, setMonthlyManualChoices] = useState<MonthlyPremiumManualChoices>(
    initialDraft.monthlyManualChoices,
  )
  const [discountIds, setDiscountIds] = useState<DiscountId[]>(initialDraft.discountIds)
  const [referralAmount, setReferralAmount] = useState(initialDraft.referralAmount)
  const [extraIds, setExtraIds] = useState<ExtraId[]>(initialDraft.extraIds)

  // Se lee una vez al montar el formulario; si el personal edita tarifas en
  // otra pantalla, el cambio se recoge al volver a montar (navegación entre
  // pantallas), sin necesidad de sincronización en tiempo real.
  const [tariffOverrides] = useState<TariffOverrides>(() => loadTariffOverrides())

  // Persiste el borrador en cada cambio para que sobreviva a un cambio de
  // pestaña o a una recarga accidental de página a mitad de introducir los
  // datos de un cliente.
  useEffect(() => {
    saveQuoteDraft({
      subscriberName,
      birthDate,
      email,
      phone,
      modalityId,
      monthlyStartDate,
      monthlyMonths,
      monthlyManualChoices,
      discountIds,
      referralAmount,
      extraIds,
    })
  }, [
    subscriberName,
    birthDate,
    email,
    phone,
    modalityId,
    monthlyStartDate,
    monthlyMonths,
    monthlyManualChoices,
    discountIds,
    referralAmount,
    extraIds,
  ])

  const age = useMemo(() => (birthDate ? calculateAge(new Date(birthDate)) : null), [birthDate])

  const selectedModality = useMemo(() => MODALITIES.find((m) => m.id === modalityId), [modalityId])

  function setModalityId(id: ModalityId) {
    setModalityIdState(id)
    setDiscountIds([])
    setExtraIds([])
    setReferralAmount('')
    setMonthlyStartDate('')
    setMonthlyMonths(DEFAULT_MONTHLY_MONTHS)
    setMonthlyManualChoices({})
  }

  function toggleDiscount(id: DiscountId) {
    if (id === 'referral' && discountIds.includes('referral')) {
      setReferralAmount('')
    }
    setDiscountIds((current) => (current.includes(id) ? current.filter((d) => d !== id) : [...current, id]))
  }

  function toggleExtra(id: ExtraId) {
    setExtraIds((current) => (current.includes(id) ? current.filter((e) => e !== id) : [...current, id]))
  }

  function setMonthlyManualChoice(index: number, rate: SeasonRate) {
    setMonthlyManualChoices((current) => ({ ...current, [index]: rate }))
  }

  /**
   * Vacía el formulario en memoria y borra el borrador persistido. Se llama
   * tras exportar con éxito: sin esto, el formulario seguiría mostrando los
   * datos del cliente ya exportado hasta que alguien los borrara a mano,
   * con riesgo de generar la siguiente cotización a su nombre por error.
   */
  function resetDraft() {
    setSubscriberName('')
    setBirthDate('')
    setEmail('')
    setPhone('')
    setModalityIdState('')
    setMonthlyStartDate('')
    setMonthlyMonths(DEFAULT_MONTHLY_MONTHS)
    setMonthlyManualChoices({})
    setDiscountIds([])
    setReferralAmount('')
    setExtraIds([])
    clearQuoteDraft()
  }

  const eligibleDiscountIds = useMemo(
    () => (selectedModality ? getEligibleDiscounts(selectedModality, age) : []),
    [selectedModality, age],
  )

  const monthlyPreview = useMemo<MonthlyPremiumUnitPreview[]>(() => {
    if (!selectedModality || selectedModality.category !== 'monthly' || !monthlyStartDate) {
      return []
    }
    return previewMonthlyPremiumUnits(new Date(monthlyStartDate), monthlyMonths, tariffOverrides)
  }, [selectedModality, monthlyStartDate, monthlyMonths, tariffOverrides])

  const quote = useMemo<QuoteState>(() => {
    if (!selectedModality) {
      return { kind: 'none' }
    }

    if (selectedModality.category === 'monthly') {
      if (!monthlyStartDate) {
        return { kind: 'none' }
      }
      return {
        kind: 'monthly',
        result: calculateMonthlyPremiumPrice(
          new Date(monthlyStartDate),
          monthlyMonths,
          monthlyManualChoices,
          tariffOverrides,
        ),
      }
    }

    const parsedReferralAmount = referralAmount === '' ? undefined : Number(referralAmount)
    return {
      kind: 'cascade',
      result: calculateQuote(selectedModality.id, discountIds, {
        referralAmount: parsedReferralAmount,
        overrides: tariffOverrides,
      }),
    }
  }, [
    selectedModality,
    monthlyStartDate,
    monthlyMonths,
    monthlyManualChoices,
    discountIds,
    referralAmount,
    tariffOverrides,
  ])

  const extras = useMemo<ExtrasCalculationResult>(() => {
    if (!selectedModality) {
      return { success: true, items: [], total: 0 }
    }
    return calculateExtras(selectedModality.id, extraIds, {
      age,
      activeDiscountIds: discountIds,
      overrides: tariffOverrides,
    })
  }, [selectedModality, extraIds, age, discountIds, tariffOverrides])

  const quoteTotal = quote.kind !== 'none' && quote.result.success ? quote.result.total : 0
  const extrasTotal = extras.success ? extras.total : 0
  const grandTotal = quoteTotal + extrasTotal

  return {
    subscriberName,
    birthDate,
    email,
    phone,
    age,
    modalityId,
    monthlyStartDate,
    monthlyMonths,
    monthlyManualChoices,
    discountIds,
    referralAmount,
    extraIds,
    eligibleDiscountIds,
    monthlyPreview,
    quote,
    extras,
    grandTotal,
    tariffOverrides,
    setSubscriberName,
    setBirthDate,
    setEmail,
    setPhone,
    setModalityId,
    setMonthlyStartDate,
    setMonthlyMonths,
    setMonthlyManualChoice,
    toggleDiscount,
    setReferralAmount,
    toggleExtra,
    resetDraft,
  }
}
