# Calculadora de Cuotas AGM — Instrucciones para el asistente de IA

## Rol

El alumno dirige (requisitos, prioridades, verificación); el asistente escribe el código bajo esa dirección, explicando cada decisión para que el alumno pueda defenderla en el vídeo del TFM. Ver metodología completa en [`README.md`](./README.md).

## Stack

React 19 + TypeScript + Vite + Tailwind CSS + Vitest + Testing Library. Sin backend salvo una función serverless (`api/validate-pin.ts` en Vercel) para el PIN de personal.

## TDD — obligatorio para toda la lógica de negocio

1. Escribir el test primero → ejecutar → debe fallar.
2. Implementar el mínimo código para pasar.
3. Refactorizar manteniendo los tests en verde.

## Organización de archivos (Scope Rule)

- `src/shared/` → usado por 2+ features (types, utils, constants, strategies, hooks).
- `src/features/X/` → específico de una sola feature.

```
src/
├── shared/{types,utils,constants,strategies,hooks,components}/
├── features/
│   ├── quote-calculator/     # motor de cuota + UI del formulario/resumen
│   ├── staff-identification/ # pantalla de agente + PIN
│   ├── tariff-admin/         # actualizador de precios
│   └── excel-export/         # exportación de cotizaciones
├── context/
└── test/setup.ts
api/
└── validate-pin.ts           # única función serverless
```

## Fuente de la lógica de negocio

Toda regla de cálculo (precios, descuentos, cascada, extras, edad) debe implementarse y testearse según [`docs/reglas-de-negocio.md`](./docs/reglas-de-negocio.md) — es la especificación validada, no inventar ni asumir variantes.

## Reglas de calidad obligatorias

- Sin `any`; usar `unknown` + type assertion cuando haga falta.
- Sin strings/números mágicos repetidos (extraer a constantes).
- Funciones puras y pequeñas para la lógica de negocio (una responsabilidad cada una).
- Manejo de errores con logging (`console.error`), nunca silencioso.
- `pnpm lint` y `pnpm test` en verde antes de dar por cerrado un capítulo.

## PIN de personal

Nunca validar el PIN en el cliente. Siempre a través de `api/validate-pin.ts`, leyendo los PIN de variables de entorno de servidor (nunca `VITE_*`, que sí se empaquetan en el cliente). Especificación completa de seguridad del endpoint (contrato, comparación timing-safe, mensajes de error genéricos, decisión de alcance sobre rate limiting, sesión del agente) en [`docs/reglas-de-negocio.md`](./docs/reglas-de-negocio.md) §6 — leer antes de implementar el capítulo 5.

## Scripts (a crear en el setup)

- `pnpm dev`
- `pnpm test` / `pnpm test:run` / `pnpm test:coverage`
- `pnpm lint`
- `pnpm build`

## Plan por capítulos

**Núcleo v1 (obligatorio, en este orden):**

0. Commit inicial con los documentos de planificación (`README.md`, `CLAUDE.md`, `AGENTS.md`, `docs/`).
1. Setup del proyecto (Vite + TS + Tailwind + Vitest) + estructura Scope Rule.
2. Motor de cuota base + cascada de descuentos + matriz de incompatibilidades, **incluida la restricción por categoría Premium/No-Premium** (parte de la matriz, no de la edad) (TDD). El motor recibe una lista de IDs de descuento ya seleccionados/elegibles — no filtra por edad todavía, eso es el capítulo 3. Usar el caso de prueba de referencia de [`docs/reglas-de-negocio.md`](./docs/reglas-de-negocio.md) (SM + Lunes a Viernes + Abono Tarde + Familiar = 2.524,50 €) como test dorado.
3. Validación de **edad** (filtro de elegibilidad de descuentos por rango de edad, separado del motor de cascada) + extras con exclusividad de grupo (TDD).
4. UI del formulario/resumen (basada en el diseño ya validado).
5. Identificación de personal (PIN) + función serverless.
6. Actualizador de tarifas.
7. Exportación a Excel.
8. Quality gates, documentación final, despliegue, slides, vídeo.

**Roadmap adicional (solo si sobra tiempo tras el núcleo v1, en este orden de prioridad — recortar desde el final si el plazo aprieta):**

9. Modos de pago fraccionado/temporal (extensión del motor de cuota ya construido).
10. Firma digital (canvas táctil).
11. Soporte multi-idioma (EN/DE).
12. Generación de documento/PDF imprimible.
13. Gestión multi-abonado.

## Control de versiones

- **Commits:** uno al final de cada capítulo (o subcapítulo), en cuanto los tests estén en verde. **Nunca automático**: se propone el mensaje de commit y se espera confirmación explícita del alumno antes de ejecutar `git commit`. Mensajes descriptivos, con línea de coautoría de Claude.
- **Push a GitHub:** igual que el commit — **nunca automático**. Siempre se propone qué se va a subir y se espera confirmación explícita antes de `git push`.
- **Dónde se ejecutan:** commits y push se hacen desde esta sesión (la que trabaja directamente sobre el proyecto en VS Code), no desde otras sesiones de consulta/revisión que puedan tener acceso de lectura a la carpeta.
- **Rama:** se trabaja directo en `main`, sin ramas por feature.

## Guión del TFM — actualización obligatoria por capítulo

Al cerrar cada capítulo, añadir una sección a [`docs/guion-tfm.md`](./docs/guion-tfm.md) explicando qué se hizo y **por qué**, en un tono que el alumno pueda usar tal cual como guión del vídeo/presentación (no es un changelog técnico). Es el entregable más importante para que el alumno pueda defender el proyecto — no se puede omitir aunque el capítulo parezca menor.

## Para retomar una sesión

Indicar: capítulo actual, tests en verde (unit: N), y qué falta del capítulo en curso. El asistente debe releer `docs/reglas-de-negocio.md` antes de tocar lógica de negocio si ha pasado tiempo desde la última sesión.
