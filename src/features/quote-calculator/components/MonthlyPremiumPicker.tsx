import type { SeasonRate } from '../../../shared/types/catalog'
import { MONTHLY_PREMIUM_RATES } from '../../../shared/constants/monthlyPremium'
import type { MonthlyPremiumManualChoices, MonthlyPremiumUnitPreview } from '../calculateMonthlyPremiumPrice'
import { FormField, formInputClasses } from './FormField'

const RATE_LABELS: Record<SeasonRate, string> = { high: 'Alta', standard: 'Estándar' }
const MONTH_OPTIONS: readonly (1 | 2 | 3)[] = [1, 2, 3]

interface MonthlyPremiumPickerProps {
  startDate: string
  onStartDateChange: (value: string) => void
  months: 1 | 2 | 3
  onMonthsChange: (months: 1 | 2 | 3) => void
  preview: MonthlyPremiumUnitPreview[]
  manualChoices: MonthlyPremiumManualChoices
  onManualChoiceChange: (index: number, rate: SeasonRate) => void
}

export function MonthlyPremiumPicker({
  startDate,
  onStartDateChange,
  months,
  onMonthsChange,
  preview,
  manualChoices,
  onManualChoiceChange,
}: MonthlyPremiumPickerProps) {
  return (
    <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Fecha de inicio" htmlFor="monthly-start-date">
          <input
            id="monthly-start-date"
            type="date"
            className={formInputClasses}
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
          />
        </FormField>

        <FormField label="Número de meses" htmlFor="monthly-months">
          <select
            id="monthly-months"
            className={formInputClasses}
            value={months}
            onChange={(event) => onMonthsChange(Number(event.target.value) as 1 | 2 | 3)}
          >
            {MONTH_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {preview.length > 0 && (
        <ul className="space-y-2">
          {preview.map((unit) => (
            <li key={unit.index} className="rounded-md border border-gray-200 p-3 text-sm">
              {unit.status === 'automatic' ? (
                <span>
                  Mes {unit.index + 1}: tarifa {RATE_LABELS[unit.rate]} — {unit.price} €
                </span>
              ) : (
                <div>
                  <p className="mb-2 text-amber-700">
                    Mes {unit.index + 1}: cruza dos temporadas con tarifas distintas. Elige cuál aplicar:
                  </p>
                  <div className="flex gap-2">
                    {unit.options.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => onManualChoiceChange(unit.index, rate)}
                        className={`rounded-md border px-3 py-1 text-sm ${
                          manualChoices[unit.index] === rate
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        {RATE_LABELS[rate]} ({MONTHLY_PREMIUM_RATES[rate]} €)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
