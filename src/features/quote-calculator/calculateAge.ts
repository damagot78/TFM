/** Edad en años cumplidos a fecha `referenceDate` (por defecto, hoy). */
export function calculateAge(birthDate: Date, referenceDate: Date = new Date()): number {
  let age = referenceDate.getFullYear() - birthDate.getFullYear()

  const hasHadBirthdayThisYear =
    referenceDate.getMonth() > birthDate.getMonth() ||
    (referenceDate.getMonth() === birthDate.getMonth() && referenceDate.getDate() >= birthDate.getDate())

  if (!hasHadBirthdayThisYear) {
    age -= 1
  }

  return age
}
