import { useEffect, useRef, useState } from 'react'
import type { ExportedQuote } from '../../../shared/types/exportedQuote'
import { appendExportedQuote } from '../../../shared/utils/exportedQuotesRepository'
import { buildExportedQuote } from '../buildExportedQuote'
import { useQuoteForm } from '../useQuoteForm'
import { DiscountsSection } from './DiscountsSection'
import { ExtrasSection } from './ExtrasSection'
import { ModalitySelector } from './ModalitySelector'
import { MonthlyPremiumPicker } from './MonthlyPremiumPicker'
import { QuoteSummary } from './QuoteSummary'
import { SubscriberDataSection } from './SubscriberDataSection'

interface QuoteFormProps {
  agentName: string
}

export function QuoteForm({ agentName }: QuoteFormProps) {
  const form = useQuoteForm()
  const isMonthly = form.modalityId === 'monthly_premium'
  const [exportedMessageVisible, setExportedMessageVisible] = useState(false)

  const exportableQuote = buildExportedQuote(form, agentName)

  // resetDraft() (más abajo) también cambia form.quote/extras/grandTotal al
  // vaciar el formulario tras exportar, lo que dispararía este mismo efecto
  // y ocultaría el mensaje de confirmación en el mismo instante en que se
  // muestra. Esta bandera distingue ese cambio (causado por nosotros mismos)
  // de que el agente empiece de verdad una cotización nueva.
  const skipNextHideRef = useRef(false)

  useEffect(() => {
    if (skipNextHideRef.current) {
      skipNextHideRef.current = false
      return
    }
    setExportedMessageVisible(false)
  }, [form.quote, form.extras, form.grandTotal])

  function handleExport(quote: ExportedQuote) {
    appendExportedQuote(quote)
    skipNextHideRef.current = true
    form.resetDraft()
    setExportedMessageVisible(true)
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 p-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <SubscriberDataSection
          subscriberName={form.subscriberName}
          onSubscriberNameChange={form.setSubscriberName}
          birthDate={form.birthDate}
          onBirthDateChange={form.setBirthDate}
          age={form.age}
          email={form.email}
          onEmailChange={form.setEmail}
          phone={form.phone}
          onPhoneChange={form.setPhone}
        />

        <ModalitySelector modalityId={form.modalityId} onSelect={form.setModalityId} overrides={form.tariffOverrides}>
          {isMonthly && (
            <MonthlyPremiumPicker
              startDate={form.monthlyStartDate}
              onStartDateChange={form.setMonthlyStartDate}
              months={form.monthlyMonths}
              onMonthsChange={form.setMonthlyMonths}
              preview={form.monthlyPreview}
              manualChoices={form.monthlyManualChoices}
              onManualChoiceChange={form.setMonthlyManualChoice}
            />
          )}
        </ModalitySelector>

        {form.modalityId !== '' && !isMonthly && (
          <DiscountsSection
            discountIds={form.discountIds}
            eligibleDiscountIds={form.eligibleDiscountIds}
            onToggle={form.toggleDiscount}
            referralAmount={form.referralAmount}
            onReferralAmountChange={form.setReferralAmount}
            overrides={form.tariffOverrides}
          />
        )}

        {form.modalityId !== '' && (
          <ExtrasSection
            modalityId={form.modalityId}
            age={form.age}
            extraIds={form.extraIds}
            onToggle={form.toggleExtra}
            overrides={form.tariffOverrides}
          />
        )}
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <QuoteSummary
          quote={form.quote}
          extras={form.extras}
          grandTotal={form.grandTotal}
          canExport={exportableQuote !== null}
          onExport={exportableQuote ? () => handleExport(exportableQuote) : undefined}
          exportedMessageVisible={exportedMessageVisible}
        />
      </div>
    </div>
  )
}
