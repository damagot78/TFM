import { FormField, formInputClasses } from './FormField'

interface SubscriberDataSectionProps {
  subscriberName: string
  onSubscriberNameChange: (value: string) => void
  birthDate: string
  onBirthDateChange: (value: string) => void
  age: number | null
  email: string
  onEmailChange: (value: string) => void
  phone: string
  onPhoneChange: (value: string) => void
}

export function SubscriberDataSection({
  subscriberName,
  onSubscriberNameChange,
  birthDate,
  onBirthDateChange,
  age,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
}: SubscriberDataSectionProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Datos del abonado</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Nombre" htmlFor="subscriber-name">
          <input
            id="subscriber-name"
            type="text"
            className={formInputClasses}
            value={subscriberName}
            onChange={(event) => onSubscriberNameChange(event.target.value)}
          />
        </FormField>

        <FormField
          label="Fecha de nacimiento"
          htmlFor="subscriber-birth-date"
          hint={age !== null ? `Edad: ${age} años` : undefined}
        >
          <input
            id="subscriber-birth-date"
            type="date"
            className={formInputClasses}
            value={birthDate}
            onChange={(event) => onBirthDateChange(event.target.value)}
          />
        </FormField>

        <FormField label="Email (opcional)" htmlFor="subscriber-email">
          <input
            id="subscriber-email"
            type="email"
            className={formInputClasses}
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </FormField>

        <FormField label="Teléfono (opcional)" htmlFor="subscriber-phone">
          <input
            id="subscriber-phone"
            type="tel"
            className={formInputClasses}
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
          />
        </FormField>
      </div>
    </section>
  )
}
