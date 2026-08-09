/**
 * Caracteres que Excel puede interpretar como inicio de fórmula si abren una
 * celda de texto libre (CSV/Excel Formula Injection — OWASP, Módulo 9).
 */
const DANGEROUS_LEADING_CHARS = new Set(['=', '+', '-', '@', '\t', '\r'])

/**
 * Neutraliza un valor de texto libre (introducido por el usuario) antes de
 * escribirlo en una celda: si empieza por un carácter que Excel podría leer
 * como el inicio de una fórmula, se antepone una comilla simple para forzar
 * que se trate como texto.
 */
export function sanitizeExcelCellValue(value: string): string {
  if (value.length === 0) {
    return value
  }
  return DANGEROUS_LEADING_CHARS.has(value[0]) ? `'${value}` : value
}
