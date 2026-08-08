import { useState } from 'react'
import type { DiscountId, ExtraId, ModalityId, SeasonRate } from '../../shared/types/catalog'
import type { TariffOverrides } from '../../shared/types/tariffOverrides'
import { MODALITIES } from '../../shared/constants/modalities'
import { DISCOUNTS } from '../../shared/constants/discounts'
import { EXTRAS } from '../../shared/constants/extras'
import { loadTariffOverrides, saveTariffOverrides } from '../../shared/utils/tariffOverridesRepository'
import {
  resolveDiscountPercentage,
  resolveExtraPrice,
  resolveModalityPrice,
  resolveMonthlyPremiumRate,
} from '../../shared/utils/tariffResolvers'
import { formInputClasses } from '../../shared/components/FormField'

const RATE_LABELS: Record<SeasonRate, string> = { high: 'Alta', standard: 'Estándar' }

function withNumericOverride<K extends string>(
  record: Partial<Record<K, number>>,
  id: K,
  rawValue: string,
): Partial<Record<K, number>> {
  const parsed = Number(rawValue)
  if (rawValue.trim() === '' || !Number.isFinite(parsed) || parsed <= 0) {
    const next = { ...record }
    delete next[id]
    return next
  }
  return { ...record, [id]: parsed }
}

interface TariffRowProps {
  label: string
  value: number
  hasOverride: boolean
  step: string
  onChange: (rawValue: string) => void
  onReset: () => void
}

function TariffRow({ label, value, hasOverride, step, onChange, onReset }: TariffRowProps) {
  const inputId = `tariff-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <label htmlFor={inputId} className="text-sm text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${formInputClasses} w-28 text-right`}
        />
        {hasOverride && (
          <button type="button" onClick={onReset} className="text-xs whitespace-nowrap text-gray-500 underline">
            Restablecer {label}
          </button>
        )}
      </div>
    </li>
  )
}

export function TariffAdminScreen() {
  const [overrides, setOverrides] = useState<TariffOverrides>(() => loadTariffOverrides())
  const [savedMessageVisible, setSavedMessageVisible] = useState(false)

  function updateModalityPrice(id: ModalityId, rawValue: string) {
    setOverrides((current) => ({ ...current, modalityPrices: withNumericOverride(current.modalityPrices, id, rawValue) }))
    setSavedMessageVisible(false)
  }

  function resetModalityPrice(id: ModalityId) {
    setOverrides((current) => {
      const { [id]: _removed, ...rest } = current.modalityPrices
      return { ...current, modalityPrices: rest }
    })
    setSavedMessageVisible(false)
  }

  function updateDiscountPercentage(id: DiscountId, rawValue: string) {
    setOverrides((current) => ({
      ...current,
      discountPercentages: withNumericOverride(current.discountPercentages, id, rawValue),
    }))
    setSavedMessageVisible(false)
  }

  function resetDiscountPercentage(id: DiscountId) {
    setOverrides((current) => {
      const { [id]: _removed, ...rest } = current.discountPercentages
      return { ...current, discountPercentages: rest }
    })
    setSavedMessageVisible(false)
  }

  function updateExtraPrice(id: ExtraId, rawValue: string) {
    setOverrides((current) => ({ ...current, extraPrices: withNumericOverride(current.extraPrices, id, rawValue) }))
    setSavedMessageVisible(false)
  }

  function resetExtraPrice(id: ExtraId) {
    setOverrides((current) => {
      const { [id]: _removed, ...rest } = current.extraPrices
      return { ...current, extraPrices: rest }
    })
    setSavedMessageVisible(false)
  }

  function updateMonthlyPremiumRate(rate: SeasonRate, rawValue: string) {
    setOverrides((current) => ({
      ...current,
      monthlyPremiumRates: withNumericOverride(current.monthlyPremiumRates, rate, rawValue),
    }))
    setSavedMessageVisible(false)
  }

  function resetMonthlyPremiumRate(rate: SeasonRate) {
    setOverrides((current) => {
      const { [rate]: _removed, ...rest } = current.monthlyPremiumRates
      return { ...current, monthlyPremiumRates: rest }
    })
    setSavedMessageVisible(false)
  }

  function handleSave() {
    saveTariffOverrides(overrides)
    setSavedMessageVisible(true)
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold text-gray-900">Actualizador de tarifas</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-base font-semibold text-gray-900">Modalidades</h2>
        <ul className="divide-y divide-gray-100">
          {MODALITIES.filter((modality) => modality.price !== null).map((modality) => (
            <TariffRow
              key={modality.id}
              label={`${modality.name} (€/año)`}
              value={resolveModalityPrice(modality, overrides) as number}
              hasOverride={overrides.modalityPrices[modality.id as ModalityId] !== undefined}
              step="1"
              onChange={(rawValue) => updateModalityPrice(modality.id, rawValue)}
              onReset={() => resetModalityPrice(modality.id)}
            />
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-base font-semibold text-gray-900">Descuentos</h2>
        <ul className="divide-y divide-gray-100">
          {DISCOUNTS.map((discount) => (
            <TariffRow
              key={discount.id}
              label={`${discount.name} (%)`}
              value={resolveDiscountPercentage(discount, overrides)}
              hasOverride={overrides.discountPercentages[discount.id as DiscountId] !== undefined}
              step="1"
              onChange={(rawValue) => updateDiscountPercentage(discount.id, rawValue)}
              onReset={() => resetDiscountPercentage(discount.id)}
            />
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-base font-semibold text-gray-900">Extras</h2>
        <ul className="divide-y divide-gray-100">
          {EXTRAS.map((extra) => (
            <TariffRow
              key={extra.id}
              label={`${extra.name} (€)`}
              value={resolveExtraPrice(extra, overrides)}
              hasOverride={overrides.extraPrices[extra.id as ExtraId] !== undefined}
              step="1"
              onChange={(rawValue) => updateExtraPrice(extra.id, rawValue)}
              onReset={() => resetExtraPrice(extra.id)}
            />
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-base font-semibold text-gray-900">Premium Mensual</h2>
        <ul className="divide-y divide-gray-100">
          {(Object.keys(RATE_LABELS) as SeasonRate[]).map((rate) => (
            <TariffRow
              key={rate}
              label={`${RATE_LABELS[rate]} (€/mes)`}
              value={resolveMonthlyPremiumRate(rate, overrides)}
              hasOverride={overrides.monthlyPremiumRates[rate] !== undefined}
              step="1"
              onChange={(rawValue) => updateMonthlyPremiumRate(rate, rawValue)}
              onReset={() => resetMonthlyPremiumRate(rate)}
            />
          ))}
        </ul>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Guardar cambios
        </button>
        {savedMessageVisible && (
          <p role="status" className="text-sm text-green-700">
            Cambios guardados.
          </p>
        )}
      </div>
    </main>
  )
}
