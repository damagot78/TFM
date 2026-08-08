import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SubscriberDataSection } from './SubscriberDataSection'

function renderSection(overrides: Partial<Parameters<typeof SubscriberDataSection>[0]> = {}) {
  const props = {
    subscriberName: '',
    onSubscriberNameChange: vi.fn(),
    birthDate: '',
    onBirthDateChange: vi.fn(),
    age: null,
    email: '',
    onEmailChange: vi.fn(),
    phone: '',
    onPhoneChange: vi.fn(),
    ...overrides,
  }
  render(<SubscriberDataSection {...props} />)
  return props
}

describe('SubscriberDataSection', () => {
  it('escribir en el campo de nombre llama a onSubscriberNameChange', async () => {
    const user = userEvent.setup()
    const props = renderSection()

    await user.type(screen.getByLabelText('Nombre'), 'A')

    expect(props.onSubscriberNameChange).toHaveBeenCalledWith('A')
  })

  it('sin edad calculada, no muestra la pista de edad', () => {
    renderSection({ age: null })

    expect(screen.queryByText(/Edad:/)).not.toBeInTheDocument()
  })

  it('con edad calculada, muestra "Edad: N años" junto a la fecha de nacimiento', () => {
    renderSection({ age: 26 })

    expect(screen.getByText('Edad: 26 años')).toBeInTheDocument()
  })

  it('cambiar la fecha de nacimiento llama a onBirthDateChange', () => {
    const props = renderSection()

    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-01-15' } })

    expect(props.onBirthDateChange).toHaveBeenCalledWith('2000-01-15')
  })

  it('escribir en el campo de email llama a onEmailChange', async () => {
    const user = userEvent.setup()
    const props = renderSection()

    await user.type(screen.getByLabelText('Email (opcional)'), 'a')

    expect(props.onEmailChange).toHaveBeenCalledWith('a')
  })

  it('escribir en el campo de teléfono llama a onPhoneChange', async () => {
    const user = userEvent.setup()
    const props = renderSection()

    await user.type(screen.getByLabelText('Teléfono (opcional)'), '6')

    expect(props.onPhoneChange).toHaveBeenCalledWith('6')
  })
})
