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
