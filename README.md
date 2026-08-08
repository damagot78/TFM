# Calculadora de Cuotas — Arabella Golf Mallorca

Trabajo de Fin de Máster — Máster de Desarrollo con IA (BIG School).

## Contexto

Arabella Golf Mallorca gestiona sus cuotas de abonado (18 modalidades, descuentos combinables con límite de 3, extras con exclusividad de grupo, distintos modos de pago) mediante un proceso manual apoyado en tarifas oficiales. La complejidad de las combinaciones provoca:

- **Errores de cálculo** en presupuestos.
- **Tiempos de resolución altos** por cotización.
- **Curva de aprendizaje elevada** para personal nuevo.

## Solución

Una calculadora guiada y explicada: no solo devuelve el importe final, también muestra qué reglas se han aplicado y por qué, atacando los tres problemas a la vez (errores, tiempos, formación).

## Alcance v1

- Motor de cuota base + cascada de descuentos (orden y matriz de incompatibilidades según [`docs/reglas-de-negocio.md`](./docs/reglas-de-negocio.md)) + validación de edad.
- Extras con exclusividad de grupo (custodia de palos / buggy).
- Un solo modo de pago anual para las modalidades `Standard`/`Premium`, más la modalidad `monthly_premium` (mes a mes, hasta 3 meses, tarifa por temporada — ver `docs/reglas-de-negocio.md`). Interfaz en español.
- Identificación de personal (PIN, lista fija de 3-4 agentes), validada en servidor — registra quién realiza cada cotización.
- Exportación a Excel de las cotizaciones generadas (agente, modalidad, descuentos, extras, edad, total, y para `monthly_premium` la tarifa aplicada por mes).
- Actualizador de tarifas: edición del precio de los conceptos del catálogo fijo (no se añaden/eliminan productos ni reglas).

### Roadmap más allá del v1

Fuera del núcleo v1, pero contempladas como extensión si el tiempo lo permite (orden de prioridad; se recorta desde el final si el plazo aprieta):

1. Modos de pago fraccionado/temporal para las modalidades `Standard`/`Premium`.
2. Firma digital del abonado.
3. Soporte multi-idioma (EN/DE).
4. Generación de documento/PDF imprimible.
5. Gestión multi-abonado.

## Diseño de interfaz

La interfaz reutiliza un diseño ya validado con uso real (secciones: datos del abonado, modalidad de abono, descuentos, extras, tipo de pago, resumen lateral). Se añaden dos pantallas nuevas que no existían previamente: **identificación de personal** (selección de agente + PIN) y **actualizador de tarifas**. "Construido desde cero" se refiere al código y la arquitectura, no al rediseño de un UX que ya funciona para el usuario.

## Stack técnico

- React 19 + TypeScript + Vite
- Tailwind CSS
- Vitest + Testing Library (tests unitarios y de caracterización)
- Una única función serverless (`api/validate-pin.ts`, en Vercel) para validar el PIN de personal en servidor — el resto de la aplicación es 100% cliente (localStorage)

## Metodología de desarrollo

Proyecto construido desde cero aplicando lo aprendido en el máster:

1. **Análisis de requisitos** a partir de las tarifas y normativa oficiales de Arabella Golf Mallorca — ver [`docs/reglas-de-negocio.md`](./docs/reglas-de-negocio.md).
2. **TDD** (red-green-refactor) para toda la lógica de negocio.
3. **Scope Rule** para la organización del código (`shared/` vs `features/`).
4. **Quality gates**: lint + typecheck + tests antes de cada commit relevante.
5. Desarrollo guiado por IA (Claude Code) bajo dirección explícita del autor, capítulo a capítulo, con explicación de cada decisión — ver [`CLAUDE.md`](./CLAUDE.md).

## Documentación y despliegue

_(se completa a medida que se avanza)_

### Instalación y ejecución

```bash
pnpm install       # instalar dependencias
pnpm dev           # servidor de desarrollo
pnpm test          # tests en modo watch
pnpm test:run      # tests en modo CI (una pasada)
pnpm test:coverage # tests con cobertura
pnpm lint          # linter (oxlint)
pnpm build         # build de producción (typecheck + vite build)
```

### Estructura del proyecto

```
src/
├── shared/{types,utils,constants,strategies,hooks,components}/  # usado por 2+ features
├── features/
│   ├── quote-calculator/     # motor de cuota + UI del formulario/resumen
│   ├── staff-identification/ # pantalla de agente + PIN
│   ├── tariff-admin/         # actualizador de precios
│   └── excel-export/         # exportación de cotizaciones
├── context/
└── test/setup.ts
api/
└── validate-pin.ts           # función serverless (Vercel) — capítulo 5
```

- Despliegue: pendiente (previsto en Vercel).
- Slides: pendiente.
- Vídeo: pendiente.

## Nota sobre seguridad de la identificación de personal

El PIN de cada agente se valida en una función serverless (`api/validate-pin.ts`), comparándolo contra variables de entorno del servidor que nunca se envían al navegador. Es un mecanismo de **registro interno** (saber quién generó cada cotización) para una herramienta de uso interno, no un sistema de autenticación multiusuario con roles — decisión de alcance consciente y documentada.
