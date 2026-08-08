import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Sin `globals: true` (decisión del capítulo 1), Testing Library no detecta
// automáticamente el hook `afterEach` del test runner, así que el DOM no se
// desmonta solo entre tests. Sin este registro explícito, los tests de un
// mismo archivo que rendericen el mismo componente varias veces acumulan
// elementos duplicados en el DOM (p. ej. varias etiquetas con el mismo texto).
afterEach(() => {
  cleanup()
})
