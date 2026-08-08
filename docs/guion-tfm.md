# Guión y argumentario del TFM — decisiones y por qué

Este documento es el hilo conductor para explicar el proyecto en el vídeo y en las slides del TFM. No es un changelog técnico (para eso está el historial de git y el README) — es el **razonamiento detrás de cada decisión importante**, para poder defenderlas con seguridad. Se actualiza al cerrar cada capítulo.

---

## 0. Preparación (antes de escribir una sola línea de código)

### El problema

Arabella Golf Mallorca (el club de golf donde trabajo) calcula las cuotas de abonado de forma manual: 18 modalidades de abono, hasta 3 descuentos combinables en cascada con una matriz de incompatibilidades, extras con exclusividad de grupo, y distintos modos de pago. Esa complejidad produce tres problemas concretos y medibles:

1. **Errores de cálculo** en los presupuestos.
2. **Tiempos de resolución altos** por cotización.
3. **Curva de aprendizaje elevada** para personal nuevo, que tarda en dominar todas las combinaciones.

*Cómo contarlo en el vídeo:* no es un problema inventado para el TFM — es un problema real de mi trabajo, y por eso lo elegí entre varias ideas que barajé (evaluamos también una herramienta de revisión de PRs con IA, un gestor de gastos, un coach de estudio con RAG, una app de control de cromos y un gestor de libros — esta fue la que mejor combinaba valor real, alcance controlable para un primer proyecto, y ausencia de riesgo de datos sensibles).

### La solución propuesta

Una calculadora **guiada y explicada**: no solo devuelve el importe final, también muestra qué regla se ha aplicado y por qué. Esto es deliberado — un cálculo "a secas" solo atacaría errores y tiempos, pero mostrar el razonamiento también ataca la curva de aprendizaje, que es la tercera causa del problema original.

### Fuentes de los requisitos

Los requisitos de negocio (tarifas, descuentos, extras, edades) se extrajeron de la documentación oficial de Arabella Golf Mallorca, publicada online:

- [Tarifas Membresías 2026](https://arabellagolfmallorca.com/wp-content/uploads/2026/01/Members_2026_rev_QR.pdf)
- [Derechos y Obligaciones del Abonado 2026](https://arabellagolfmallorca.com/wp-content/uploads/2026/04/Derechos_y_obligaciones_del_abonado_2026-ES_04.pdf)

La especificación completa y estructurada de estas reglas está en [`docs/reglas-de-negocio.md`](./reglas-de-negocio.md), que es el documento de referencia para todo el desarrollo (equivalente a un documento de análisis de requisitos, Módulo 1 del máster).

### Por qué "construido desde cero"

**El código de este proyecto se ha escrito desde cero**, aplicando la metodología completa del máster (TDD, arquitectura, tests, documentación, seguridad) a partir del análisis de la documentación oficial. No parte de ningún código previo.

*Cómo contarlo en el vídeo:* el punto de partida fue el análisis del problema y de las tarifas/normativa oficiales (Módulo 1 — Análisis de Requisitos), y desde ahí se construyó todo siguiendo TDD capítulo a capítulo.

### Sobre el diseño de interfaz

El diseño de interfaz (secciones: datos del abonado, modalidad, descuentos, extras, pago, resumen) sigue un flujo pensado para cómo un usuario real completaría esta tarea paso a paso, priorizando claridad sobre originalidad visual — el valor de este proyecto está en la lógica de negocio y la calidad de ingeniería, no en el diseño gráfico.

### Alcance v1 y priorización

Con el plazo real de entrega y siendo mi primer proyecto de programación, definimos un alcance v1 defendible en vez de intentarlo todo:

**Incluido en v1:** motor de cuota + cascada de descuentos + validación de edad + extras con exclusividad de grupo, un solo modo de pago (anual), solo español, identificación de personal por PIN, exportación a Excel, actualizador de precios.

**Fuera de v1, como roadmap priorizado** (se añadiría en este orden si sobra tiempo, se recorta desde el final si no): pago fraccionado/temporal → firma digital → multi-idioma → PDF imprimible → multi-abonado.

*Cómo contarlo en el vídeo:* esto es una decisión de **priorización de producto**, no una limitación técnica — cada una de esas funcionalidades es viable, pero construirlas con tests y buena arquitectura desde cero tiene un coste real, y prefería entregar un núcleo completo y bien hecho antes que muchas funcionalidades a medias. Es una decisión que se puede defender con criterio de ingeniería (MoSCoW / priorización de requisitos, Módulo 1).

### Decisión de seguridad: identificación de personal

El PIN de cada agente **no se valida en el cliente** — aunque es solo una herramienta de uso interno, un PIN comparado en el navegador es visible para cualquiera que inspeccione el código de la app desplegada. Se valida en una única función serverless (`api/validate-pin.ts`), con los PIN en variables de entorno de servidor, nunca expuestas al navegador. El resto de la aplicación sigue siendo 100% cliente (sin backend).

*Cómo contarlo en el vídeo:* es una aplicación directa de una lección de seguridad del Módulo 9 (OWASP): no confiar nunca en el cliente para datos que deben protegerse, incluso en herramientas "internas".

### Metodología de trabajo con IA

El desarrollo se hace con Claude Code, con un reparto de roles explícito: yo dirijo (requisitos, prioridades, verificación de que cada capítulo funciona), la IA escribe el código bajo esa dirección, explicando cada decisión para que yo la entienda y la pueda defender. Esto no es "dejar que la IA lo haga todo" — es exactamente la metodología que enseña el propio máster (Módulos 4, 5 y 10), reflejada también en cómo el profesor documenta su propio proyecto de referencia.

---

## 1. Capítulo 1 — Setup del proyecto

### Stack elegido

- **Vite 8 + React 19 + TypeScript** — plantilla oficial `react-ts`.
- **Tailwind CSS v4** vía `@tailwindcss/vite` — la v4 elimina `tailwind.config.js` y `postcss.config.js`; se configura con una sola línea (`@import "tailwindcss";`) y el plugin de Vite. Un archivo de configuración menos que mantener.
- **Vitest 4 + jsdom + Testing Library** (`@testing-library/react`, `jest-dom`, `user-event`) + `@vitest/coverage-v8` para cobertura.
- **oxlint** como linter — viene por defecto en el scaffold moderno de Vite, más rápido que ESLint y sin configuración adicional.

### Decisiones a poder defender

- **Tailwind v4 en vez de v3:** menos archivos de configuración, setup más simple.
- **Sin `globals: true` en Vitest:** los tests importan `describe/it/expect` explícitamente de `vitest` — más explícito, evita tener que tocar `tsconfig` para tipar globals.
- **`api/validate-pin.ts` no se crea todavía:** pertenece al capítulo 5 (identificación de personal); en este capítulo solo se documenta su ubicación futura.
- **Test de humo (`src/App.test.tsx`):** verifica que Vitest + Testing Library + jsdom funcionan de extremo a extremo. No es lógica de negocio, así que no sigue TDD estricto (el TDD "de verdad" empieza en el capítulo 2, con el motor de cálculo).

### Estructura de carpetas (Scope Rule)

```
src/shared/{types,utils,constants,strategies,hooks,components}/   # usado por 2+ features
src/features/{quote-calculator,staff-identification,tariff-admin,excel-export}/  # específico de una feature
src/context/
src/test/setup.ts
```

*Cómo contarlo en el vídeo:* la organización no es por tipo técnico de archivo, sino por a quién pertenece cada pieza de código (Scope Rule) — si algo se usa en 2+ funcionalidades va a `shared/`, si es específico de una sola, se queda local en su `features/`. Esto hace que la estructura "grite" lo que hace la aplicación con solo mirar las carpetas.

### Verificación

`pnpm lint`, `pnpm test:run` y `pnpm build` verificados en verde (independientemente, no solo por el propio proceso que los ejecutó).

---

## 2. Capítulo 2 — Motor de cuota base y cascada de descuentos

### Qué se construyó

Dos piezas de lógica de negocio, cada una con su propio ciclo TDD (rojo → verde → refactor), verificadas contra [`docs/reglas-de-negocio.md`](./reglas-de-negocio.md):

1. **`calculateQuote`** — el motor de cascada de descuentos: recibe una modalidad y una lista de descuentos ya seleccionados, valida que la combinación sea legal (máximo 3 descuentos, restricción de categoría Premium/No-Premium, matriz de incompatibilidades) y aplica cada descuento en el orden fijo de la cascada, no en el orden en que se seleccionaron.
2. **`calculateMonthlyPremiumPrice`** — la calculadora de precio de la modalidad `monthly_premium`, que se cobra mes a mes según temporada (alta/estándar) en vez de con una tarifa anual fija.

*Cómo contarlo en el vídeo:* aquí empieza el TDD "de verdad" del proyecto — cada función se escribió primero como un test que fallaba, y solo después el código mínimo para pasarlo (Módulo 4 del máster).

### Por qué dos motores separados, no uno

`monthly_premium` es la única modalidad de categoría `Monthly`, y la especificación dice explícitamente que esa categoría **no admite ningún descuento**. Meter su lógica de temporada dentro del motor de cascada habría acoplado dos algoritmos que no comparten ni datos ni reglas: uno reparte un precio fijo entre hasta 3 descuentos porcentuales encadenados, el otro decide qué tarifa mensual aplica según en qué mes natural cae cada mes contratado. Separarlos en dos funciones puras, cada una con su propio archivo y sus propios tests, evita una función con dos responsabilidades y hace que cada una se pueda leer, testear y defender de forma independiente.

### El test dorado (golden test) del motor de cascada

La especificación incluye un caso ya validado con datos reales: abono `sm` (4.400 €) con Lunes a Viernes (15%) + Abono Tarde (25%) + Familiar (10%) debe dar exactamente **2.524,50 €**. Ese caso se escribió como el primer test del motor — si la implementación no reproduce esos números exactos, hay un error de orden o de lógica en la cascada, no solo un test que falla.

*Cómo contarlo en el vídeo:* usar un caso de negocio real y ya verificado como primer test (en vez de inventar un ejemplo) da mucha más confianza de que el motor calcula lo que el club realmente cobra, no solo lo que "parece correcto".

### Decisiones a poder defender

- **Redondeo a 2 decimales en cada paso de la cascada** (`shared/utils/money.ts`, `roundCurrency`): sin este redondeo, algunos porcentajes producen errores de punto flotante que se arrastran y crecen paso a paso (p. ej. `0.1 + 0.2` no da `0.3` exacto en JavaScript). Redondear tras cada paso, igual que hace la tabla de referencia de la especificación, evita ese arrastre. Se extrajo a `shared/` porque la usan ambos motores de este capítulo, y la usará también el módulo de extras en el capítulo 3.
- **Resultado como `{ success: true, ... } | { success: false, errors: string[] }` en vez de lanzar excepciones:** una combinación de descuentos inválida (más de 3, incompatibles, restringida por categoría) es un resultado esperado del negocio, no un fallo del programa. Modelarlo como un tipo de retorno explícito obliga a quien llama a la función a manejar ambos casos en tiempo de compilación, y le da a la futura UI (capítulo 4) el motivo exacto para mostrárselo al agente.
- **`referral` con base de cálculo externa:** es el único descuento de los 10 cuyo porcentaje no se aplica sobre el subtotal de la propia cuota, sino sobre el importe contratado por la persona referida. El motor acepta un parámetro opcional `referralAmount`; si `referral` está seleccionado sin ese importe, o con un importe no positivo, el cálculo se rechaza explícitamente en vez de asumir un valor por defecto silencioso.
- **`monthly_premium` sin precio fijo en el catálogo (`price: null`):** en vez de inventarle un precio anual representativo (que induciría a error si alguien lo usa sin darse cuenta), el motor de cascada rechaza explícitamente cualquier intento de calcularlo, señalando que debe usarse `calculateMonthlyPremiumPrice`. Es una barrera de diseño, no solo una validación: hace imposible mezclar los dos algoritmos por error.
- **Cálculo de temporada sin aritmética real de fechas:** para saber si un "mes contratado" cae limpio en un mes natural o cruza dos, solo hace falta saber en qué mes(es) del año cae, no la fecha exacta de fin — así se evita usar `Date` para sumar meses, que en JavaScript normaliza mal los días de fin de mes (p. ej. "31 de enero + 1 mes" no da un 31 de febrero, que no existe).
- **Cruces de temporada con tarifas distintas sin regla automática:** la especificación es explícita en que esto es una decisión humana del agente, no un algoritmo de días. El motor modela ese caso como `success: false` con un mensaje claro; la UI del capítulo 4 lo convertirá en un selector para el agente, y el motor vuelve a llamarse con la elección ya indicada.

### Verificación

`pnpm lint`, `pnpm test:run` (21 tests: 12 del motor de cascada + 8 de `monthly_premium` + 1 de humo del capítulo 1) y `pnpm build` verificados en verde.
