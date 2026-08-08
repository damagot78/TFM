/** Redondea a 2 decimales, evitando el arrastre de error de punto flotante entre pasos de cálculo. */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}
