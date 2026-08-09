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
- Exportación a Excel de las cotizaciones generadas (agente, nombre y email del abonado, edad, modalidad, descuentos, extras, total, y para `monthly_premium` la tarifa aplicada por mes).
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
6. Revisión deliberada contra el temario del máster (268 PDFs de los módulos de Ingeniería, Arquitectura, Calidad y Seguridad, contrastados contra el código real) — ver [`docs/analisis-curricular.md`](./docs/analisis-curricular.md).

## Documentación y despliegue

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
├── shared/
│   ├── types/catalog.ts, staff.ts, tariffOverrides.ts  # modelo de dominio compartido
│   ├── constants/                        # catálogo: modalidades, descuentos, extras, agentes
│   ├── utils/money.ts, tariffResolvers.ts, tariffOverridesRepository.ts # redondeo, overrides de tarifas
│   └── components/FormField.tsx          # input+label reutilizado por 2+ features
├── features/
│   ├── quote-calculator/
│   │   ├── calculateQuote.ts             # motor de cascada de descuentos (cap. 2, cap. 6: overrides)
│   │   ├── calculateMonthlyPremiumPrice.ts # precio de monthly_premium (cap. 2, cap. 6: overrides)
│   │   ├── calculateAge.ts, ageEligibility.ts # validación de edad (cap. 3)
│   │   ├── calculateExtras.ts            # extras con exclusividad de grupo (cap. 3, cap. 6: overrides)
│   │   ├── discountCatalog.ts, extrasCatalog.ts # lookups compartidos del catálogo
│   │   ├── useQuoteForm.ts               # hook de orquestación de la UI (cap. 4)
│   │   └── components/                   # formulario y resumen (cap. 4)
│   ├── staff-identification/
│   │   └── AgentIdentificationScreen.tsx # pantalla de agente + PIN (cap. 5)
│   ├── tariff-admin/
│   │   └── TariffAdminScreen.tsx         # actualizador de tarifas (cap. 6)
│   └── excel-export/
│       ├── generateQuotesWorkbook.ts     # genera el .xlsx con exceljs (cap. 7)
│       ├── sanitizeExcelCellValue.ts     # protección Formula Injection (cap. 7)
│       └── ExcelExportScreen.tsx         # lista acumulada + descarga (cap. 7)
├── context/                              # AgentSessionContext (sesión del agente)
└── test/setup.ts
api/
├── validate-pin.ts                       # endpoint serverless (cap. 5)
└── _lib/                                 # isPinValid, parseValidatePinPayload
```

### Métricas

_(actualizado en cada capítulo; refleja el estado a fecha del capítulo 8 de 8, en curso — despliegue hecho, slides/vídeo pendientes)_

| Métrica | Valor |
|---|---|
| 🧪 Tests | 266 pasados |
| 📈 Cobertura | 100% funciones, 98,8% líneas, 97,7% ramas (umbral: 100/80/80/80) |
| 🧹 Lint | 0 errores, 0 warnings (`oxlint`) |
| 🔒 Vulnerabilidades | 0 (`pnpm audit`) |
| 📦 Bundle JS (inicial) | 231,7 KB (71,4 KB gzip) |
| 📦 Bundle `exceljs` (diferido) | 929,6 KB (256,4 KB gzip) — solo se carga al exportar, no en la carga inicial |
| 🎨 Bundle CSS | 13,0 KB (3,4 KB gzip) |
| 🎭 E2E | fuera del núcleo v1 (roadmap, ver README §Roadmap) |
- Build de producción (`tsc -b && vite build`) correcto, incluyendo el proyecto `api/`.

### Checklist final

```
✅ pnpm dev            → app funciona en desarrollo
✅ pnpm lint            → 0 errores, 0 warnings
✅ pnpm build            → build de producción correcto (incluye api/)
✅ pnpm test:run          → todos los tests en verde
✅ pnpm test:coverage      → umbrales superados (100% funciones, 80%+ resto)
✅ Probado en navegador real → capítulos 4, 5, 6 y 7 verificados interactuando con la app
✅ Actualizador de tarifas con efecto real en los cálculos (cap. 6)
✅ Exportación a Excel real, con protección Formula Injection (cap. 7)

✅ Despliegue en Vercel
✅ Usuario y contraseña de prueba documentados (obligatorio, hay login)
⬜ Slides
⬜ Vídeo
⬜ Deuda técnica conocida resuelta (ver CLAUDE.md) — opcional, no bloquea la entrega
```

### Prácticas aplicadas

TDD (red-green-refactor) · Scope Rule · patrón Result en vez de excepciones para errores de negocio · funciones puras y pequeñas, una responsabilidad cada una · seguridad server-side para datos sensibles (PIN nunca en cliente) · umbrales de cobertura exigidos automáticamente · documentación como código, versionada junto al proyecto (`docs/reglas-de-negocio.md`, `docs/guion-tfm.md`) · desarrollo dirigido por IA con dirección explícita del autor, capítulo a capítulo.

- **Despliegue:** [tfm-two.vercel.app](https://tfm-two.vercel.app) (Vercel) — capítulo 8.
- **Usuario y contraseña de prueba:** Agente → `Agente 1`, PIN → `1234`. Este PIN es un **valor de demostración público para la evaluación del TFM**, distinto del que se usaría en un entorno real — configurado explícitamente para este propósito en las variables de entorno de Vercel (`PIN_AGENT_1`), nunca en el código. El resto de agentes (`Agente 2`–`Agente 4`) usan PIN reales no publicados.
- Slides: pendiente.
- Vídeo: pendiente.

## ⚠️ Nota sobre seguridad de la identificación de personal

El PIN de cada agente se valida en una función serverless (`api/validate-pin.ts`), comparándolo contra variables de entorno del servidor que nunca se envían al navegador. Es un mecanismo de **registro interno** (saber quién generó cada cotización) para una herramienta de uso interno, no un sistema de autenticación multiusuario con roles — decisión de alcance consciente y documentada.
